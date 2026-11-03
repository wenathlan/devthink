/**
 * scripts.ts — the one scripts file of the devthink root (the flat folder
 * law): the standalone operator scripts of the repository family ride this
 * single keyword file, one lane per former file, the lane word on argv[2]
 * naming the script the run answers — node devthink/scripts.ts <lane>
 * [lane arguments]. Every section below carries its source file verbatim;
 * the dispatcher retires the lane word from argv before the section runs,
 * so each script keeps the argv contract of its standalone era (the flags,
 * the positionals and the flag pairs all read from index 2 exactly the way
 * the former file read them) and the usage strings of the standalone era
 * stay the record of what each lane answers.
 *
 * scriptsnextconvert.ts stays its own file by law: the release workflow
 * invokes it by name (release.yml runs `node devthink/scriptsnextconvert.ts`)
 * and tests/publishlanes.test.ts reads the file at that path — a CI entry
 * never folds into a lane. scriptsrepocasebuild.ts rides beside this file
 * the same way until its own section lands (the wave map records it).
 *
 * Sections (one banner per source file):
 *   scriptschatbrowserprobe · scriptschatoptinprobe · scriptsdesktopprobe ·
 *   scriptsghauth · scriptsrepocaseharvest · scriptsrepocasemetadata ·
 *   scriptsscaffoldtemplates · scriptssignedlanding
 */
import { spawn, spawnSync } from "node:child_process";
import fs, { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { open } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { pathToFileURL } from "node:url";

/** The lane word every merged script answers: argv[2] names the lane and the
 * dispatcher retires the word before the section runs (the gh auth daemon
 * worker re-enters this file with its own worker mark instead of a lane —
 * the mark never trips the usage gate). */
const scriptslanes = new Set([
  "chatbrowserprobe",
  "chatoptinprobe",
  "desktopprobe",
  "ghauth",
  "repocaseharvest",
  "repocasemetadata",
  "scaffoldtemplates",
  "signedlanding",
]);
const scriptslane = process.argv[2];
const scriptsentry = process.argv[1]?.endsWith("scripts.ts") || process.argv[1]?.endsWith("scripts");
if (scriptslanes.has(scriptslane ?? "")) process.argv.splice(2, 1);
else if (scriptsentry && !process.argv.includes("--daemon-worker")) {
  console.error(`usage: node devthink/scripts.ts <lane> [lane arguments] — lanes: ${[...scriptslanes].join(", ")}`);
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* section: scriptschatbrowserprobe.ts — the manual chat browser probe */
/* ------------------------------------------------------------------ */
if (scriptslane === "chatbrowserprobe") {
// chatbrowserprobe.ts — the manual browser probe of the /chat surface.
// Launches an ISOLATED Brave instance (a throwaway profile, never the
// owner's running session), drives the real page against the real
// deployed gateway and leaves the artifacts in the repository-root
// artifacts/chat-probe/ folder.
//
// Run from devthink/ with the vite dev server already listening:
//
//   node devthink/scriptschatbrowserprobe.ts http://127.0.0.1:5179 https://<gateway-host>
//
// The probe verifies the owner-facing contract end to end:
// 1. the chat page renders (rail + welcome hero + composer),
// 2. the gateway endpoint saved in the session panel steers the client,
// 3. one real round trip commits an assistant turn with the echoed marker.

/* the probe rides the owner machine's playwright-core install: the module
   resolves at runtime only where the manual probe actually runs, so the
   require seam keeps the repository free of the dependency. */
const require = createRequire(import.meta.url);
const { chromium }: { chromium: any } = require("C:/Users/nathalan/node_modules/playwright-core");

const APP_URL = process.argv[2] ?? "http://127.0.0.1:5179";
const GATEWAY = (process.argv[3] ?? "").replace(/\/+$/, "");
const OUT = path.join(import.meta.dirname, "..", "artifacts", "chat-probe");

if (!/^https?:\/\//.test(GATEWAY)) {
  console.error("usage: node devthink/scriptschatbrowserprobe.ts <app-url> https://<gateway-host>");
  process.exit(1);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "dt-chat-probe-"));
  const context = await chromium.launchPersistentContext(profile, {
    executablePath: "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
    headless: true,
    viewport: { width: 1440, height: 900 },
    args: ["--no-first-run", "--no-default-browser-check"],
  });
  try {
    const page = context.pages()[0] ?? (await context.newPage());
    await page.goto(`${APP_URL}/chat`, { waitUntil: "networkidle", timeout: 45000 });

    const shot1 = path.join(OUT, "01-welcome.png");
    await page.screenshot({ path: shot1, fullPage: false });
    const composer = page.getByLabel("Message Sol");
    if (!(await composer.count())) throw new Error("the composer did not render on /chat");
    console.log("step 1: chat page rendered with the composer");

    /* point the client at the deployed gateway through the session panel
       (wide viewports open the panel by default — only toggle when closed) */
    const endpoint = page.getByLabel("Gateway endpoint base url");
    if (!(await endpoint.isVisible())) {
      await page.getByRole("button", { name: "Open session panel" }).click();
    }
    await endpoint.fill(GATEWAY);
    await page.getByRole("button", { name: "Save gateway endpoint" }).click();
    const shot2 = path.join(OUT, "02-endpoint.png");
    await page.screenshot({ path: shot2, fullPage: false });
    console.log(`step 2: gateway endpoint set (${GATEWAY})`);

    /* one real round trip: the echo marker proves the full client path */
    await composer.fill("Reply with exactly: sol chat ok");
    await page.getByRole("button", { name: "Send message" }).click();
    await page.waitForFunction(() => document.body?.innerText.includes("sol chat ok"), undefined, {
      timeout: 90000,
      polling: 500,
    });
    const shot3 = path.join(OUT, "03-answer.png");
    await page.screenshot({ path: shot3, fullPage: false });
    console.log("step 3: assistant turn committed with the marker");
    console.log("chat browser probe: ok");
  } finally {
    await context.close();
    fs.rmSync(profile, { recursive: true, force: true });
  }
})().catch((error: Error) => {
  console.error("chat browser probe failed:", error.message);
  process.exit(1);
});
}

/* ------------------------------------------------------------------ */
/* section: scriptschatoptinprobe.ts — the manual opt-in probe         */
/* ------------------------------------------------------------------ */
if (scriptslane === "chatoptinprobe") {
// chatoptinprobe.ts — manual visual+functional probe (NOT a gate): drives
// the deployed chat through the gateway opt-in registration — render, panel,
// register with a live gateway, connected state, one round trip with the
// marker. Usage:
//   node devthink/scriptschatoptinprobe.ts https://wenathlan.github.io/devthink/devthink [gatewayBase] [outDir]

/* the probe rides the owner machine's playwright-core install: the module
   resolves at runtime only where the manual probe actually runs, so the
   require seam keeps the repository free of the dependency. */
const require = createRequire(import.meta.url);
const { chromium }: { chromium: any } = require("C:/Users/nathalan/node_modules/playwright-core");

const APP_URL = process.argv[2] || "https://wenathlan.github.io/devthink/devthink";
const GATEWAY = (process.argv[3] || "https://g16be7k5h8u1-d.space-z.ai").replace(/\/$/, "");
const OUT_DIR = process.argv[4] || path.join(import.meta.dirname, "..", "artifacts", "chat-optin-probe");
const MARKER = `gateway optin ok ${Date.now()}`;

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const profile = path.join(OUT_DIR, "profile");
  const browser = await chromium.launchPersistentContext(profile, {
    executablePath: "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
    headless: true,
    viewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  const shot = (name: string) => page.screenshot({ path: path.join(OUT_DIR, name), fullPage: false });

  try {
    const base = APP_URL.replace(/\/$/, "");
    await page.goto(`${base}/chat`, { waitUntil: "load", timeout: 45000 });
    await page.waitForTimeout(3000);

    // the fresh profile lands on the identity lock: pass it before the chat
    const identityName = page.getByPlaceholder(/display name/i).first();
    if (await identityName.isVisible().catch(() => false)) {
      await identityName.fill("probe");
      await page
        .getByRole("button", { name: /create identity/i })
        .first()
        .click();
      await page.waitForTimeout(1500);
    } else {
      const continueBtn = page.getByRole("button", { name: /continue as/i }).first();
      if (await continueBtn.isVisible().catch(() => false)) {
        await continueBtn.click().catch(() => undefined);
        await page.waitForTimeout(1500);
      }
    }
    await shot("01-chat-disconnected.png");

    // open the session panel only if it starts closed
    const panelButton = page.getByRole("button", { name: /session panel|open session/i }).first();
    if (await panelButton.isVisible().catch(() => false)) await panelButton.click().catch(() => undefined);
    await page.waitForTimeout(800);
    await shot("02-register-form.png");

    // register the gateway (opt-in): fill the endpoint and submit
    const endpoint = page.getByLabel(/gateway endpoint/i).first();
    await endpoint.fill(GATEWAY);
    await page
      .getByRole("button", { name: /register gateway/i })
      .first()
      .click();
    await page.waitForTimeout(3500);
    await shot("03-gateway-connected.png");

    // one real round trip through the registered gateway
    await page.getByRole("textbox").first().fill(`reply with exactly this token and nothing else: ${MARKER}`);
    await page.keyboard.press("Enter");
    await page.waitForFunction((marker: string) => document.body.innerText.includes(marker), MARKER, { timeout: 90000 });
    await shot("04-answer.png");
    console.log(`probe ok: ${APP_URL}/chat — registered ${GATEWAY}, marker answered — shots in ${OUT_DIR}`);
  } catch (err) {
    await shot("99-failure.png").catch(() => undefined);
    console.error("probe failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await browser.close().catch(() => undefined);
  }
})();
}

/* ------------------------------------------------------------------ */
/* section: scriptsdesktopprobe.ts — the manual desktop probe          */
/* ------------------------------------------------------------------ */
if (scriptslane === "desktopprobe") {
// desktopprobe.ts — manual visual probe (NOT a gate): screenshots the live
// Sol shell entry chain (boot → identity → desktop) and the start menu, so
// the orchestrator can inspect the deployed design without opening a
// session of its own. Usage:
//   node devthink/scriptsdesktopprobe.ts https://wenathlan.github.io/devthink/devthink [outDir]

/* the probe rides the owner machine's playwright-core install: the module
   resolves at runtime only where the manual probe actually runs, so the
   require seam keeps the repository free of the dependency. */
const require = createRequire(import.meta.url);
const { chromium }: { chromium: any } = require("C:/Users/nathalan/node_modules/playwright-core");

const APP_URL = process.argv[2] || "https://wenathlan.github.io/devthink/devthink";
const OUT_DIR = process.argv[3] || path.join(import.meta.dirname, "..", "artifacts", "desktop-probe");

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const profile = path.join(OUT_DIR, "profile");
  const browser = await chromium.launchPersistentContext(profile, {
    executablePath: "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
    headless: true,
    viewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  const shot = (name: string) => page.screenshot({ path: path.join(OUT_DIR, name), fullPage: false });

  try {
    await page.goto(`${APP_URL.replace(/\/$/, "")}/`, { waitUntil: "load", timeout: 45000 });
    await page.waitForTimeout(1200);
    await shot("01-boot.png");
    // let the boot finish (or the identity lock to show)
    await page.waitForTimeout(2500);
    await shot("02-after-boot.png");

    // identity lock: try to continue as a local identity if the button exists
    const continueBtn = page.getByRole("button", { name: /continue|enter|open|start/i }).first();
    if (await continueBtn.isVisible().catch(() => false)) {
      await continueBtn.click().catch(() => undefined);
      await page.waitForTimeout(1500);
    }
    await shot("03-entry.png");

    // desktop: open the start menu if the button exists
    const startBtn = page.getByRole("button", { name: /start/i }).first();
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click().catch(() => undefined);
      await page.waitForTimeout(900);
      await shot("04-start-menu.png");
      await page.keyboard.press("Escape").catch(() => undefined);
      await page.waitForTimeout(400);
    }
    await shot("05-desktop.png");

    const title = await page.title();
    console.log(`probe ok: ${APP_URL} — title "${title}" — shots in ${OUT_DIR}`);
  } catch (err) {
    console.error("probe failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await browser.close().catch(() => undefined);
  }
})();
}

/* ------------------------------------------------------------------ */
/* section: scriptsghauth.ts — the gh authentication helper            */
/* ------------------------------------------------------------------ */
if (scriptslane === "ghauth" || process.argv.includes("--daemon-worker")) {
/**
 * scriptsghauth.ts — the one gh authentication helper of the
 * merged repository as a plain typescript module: it spawns
 * `gh auth login --web` with the admin grade scope set, auto-answers the
 * interactive prompts (the git-credential Y, the Press Enter of the device
 * flow) and keeps the process alive while the user authorizes the device
 * flow on github.com.
 *
 * Migrated from devthink/scripts/ghauth.py when the flat folder law
 * dissolved the scripts folder of the application first layer. The three
 * spawn strategies of the former python helper map onto the node lanes:
 *
 * - `--mode=daemon` (default): the double spawn detach of the python
 *   daemon mode — the module spawns itself as a detached worker (session
 *   leader, stdio ignored, unref'd) and the worker spawns gh with a stdin
 *   pipe it holds open for the whole deadline window (gh never sees EOF),
 *   logging every byte of output (including the one-time device code) to
 *   /tmp/gh-auth.log and the errors to /tmp/gh-daemon.err;
 * - `--mode=watch`: the prompt watcher of the python pexpect mode — gh
 *   spawns over pipes, the watcher matches the prompt lines of the byte
 *   stream (the git-credential question, the Press Enter and the Open this
 *   URL markers, the success markers) and pushes the same answers, staying
 *   in the foreground until the auth completes or the 24h watchdog elapses;
 * - the pseudo-terminal lane of the python pty mode rides the python copy
 *   of the helper (allan/organizado/python/ghauth.py --mode pty): node
 *   carries no pty primitive, and the two lanes above answer the same
 *   prompts without one.
 *
 * Common behavior (the python contract preserved):
 * - unlimited scopes (admin grade) so the automation never blocks;
 * - unlimited capture/login window: the watchdog deadline is 24h (the
 *   device code expiry is the real ceiling; gh renews the flow itself);
 * - output (including the one-time device code) goes to /tmp/gh-auth.log
 *   and errors to /tmp/gh-daemon.err.
 *
 * Usage: node scriptsghauth.ts [--mode=daemon|watch]
 */

/** the gh binary the helper drives (the user local install of the merged repository machine) */
const GH = "/home/z/my-project/.local/bin/gh";

/** the output log every byte of gh lands in (including the one-time device code) */
const LOG = "/tmp/gh-auth.log";

/** the error log the daemon lane records its lifecycle lines in */
const ERR = "/tmp/gh-daemon.err";

/** the admin grade scope set — unlimited so the automation never blocks */
const SCOPES = [
  "admin:enterprise",
  "admin:org",
  "admin:public_key",
  "admin:repo_hook",
  "admin:org_hook",
  "admin:gpg_key",
  "repo",
  "workflow",
  "write:packages",
  "delete:packages",
  "gist",
  "notifications",
  "user",
  "user:email",
  "write:discussion",
  "codespace",
  "read:enterprise",
  "read:org",
  "read:public_key",
  "read:repo_hook",
  "read:user",
  "read:discussion",
  "project",
  "delete_repo",
].join(",");

/** the gh auth login command the helper spawns (the web device flow over https) */
const CMD = [
  GH,
  "auth",
  "login",
  "--hostname",
  "github.com",
  "--git-protocol",
  "https",
  "--web",
  "--scopes",
  SCOPES,
];

/** 24h watchdog — the capture and login windows are effectively unlimited; gh's own device-code expiry is the real ceiling. */
const DEADLINE_MS = 24 * 60 * 60 * 1000;

/** the spawn mode of this run: daemon (the detached default) or watch (the foreground prompt watcher) */
const mode = process.argv.find((argument) => argument.startsWith("--mode="))?.slice("--mode=".length) ?? "daemon";

/** the daemon worker marker — the detached worker the daemon lane spawns carries it so the module knows it IS the worker */
const WORKER_MARK = "--daemon-worker";

/** Builds the environment gh rides: the browser opener neutered (the device flow prints its code instead of opening), the api debug lane on and the user local bin first on PATH. */
function ghenv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    BROWSER: "/bin/true",
    GH_DEBUG: "api",
    PATH: `/home/z/my-project/.local/bin:${process.env.PATH ?? ""}`,
  };
}

/** Appends one line to the error log of the daemon lane. */
async function errline(line: string) {
  const handle = await open(ERR, "a");
  try {
    await handle.appendFile(`${line}\n`);
  } finally {
    await handle.close();
  }
}

/**
 * The daemon worker lane: spawns gh with a stdin pipe this worker holds
 * open for the whole deadline window (gh never sees EOF, exactly the pipe
 * the python writer subprocess held), streams every output byte into the
 * log and stays alive until gh exits or the watchdog elapses.
 */
async function rundaemonworker() {
  const log = await open(LOG, "a");
  try {
    const child = spawn(CMD[0], CMD.slice(1), {
      env: ghenv(),
      stdio: ["pipe", log.fd, log.fd],
      detached: true,
    });
    await errline(`daemon: spawned gh pid=${child.pid}`);
    /* the held open stdin: the worker never writes and never closes the
     * write end, and the deadline keepalive keeps the worker itself alive
     * so the pipe survives the full capture window */
    const keepalive = setInterval(() => {}, 60 * 60 * 1000);
    const watchdog = setTimeout(() => {
      child.kill("SIGTERM");
    }, DEADLINE_MS);
    const code = await new Promise<number | null>((resolve) => {
      child.once("close", (exitcode) => resolve(exitcode));
      child.once("error", () => resolve(-1));
    });
    clearTimeout(watchdog);
    clearInterval(keepalive);
    await errline(`daemon: gh exited rc=${code ?? -1}`);
  } catch (error) {
    await errline(`daemon: exception ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await log.close();
  }
}

/**
 * The daemon lane: the double spawn detach of the python daemonize() —
 * the module spawns itself as a detached worker (its own session, stdio
 * ignored, unref'd so the parent exits immediately) and the worker carries
 * the gh process with its held open pipe.
 */
async function rundaemon() {
  const worker = spawn(
    process.execPath,
    [process.argv[1] ?? import.meta.url.replace(/^file:\/\//, ""), WORKER_MARK, `--mode=${mode}`],
    {
      env: ghenv(),
      stdio: "ignore",
      detached: true,
    },
  );
  worker.unref();
  await errline(`daemon: detached worker pid=${worker.pid}`);
}

/** One prompt marker of the watch lane: the byte pattern to wait for and the answer to push when it lands. */
const PROMPTS: Array<{ pattern: RegExp; answer: string; label: string }> = [
  {
    pattern: /Authenticate Git with your GitHub credentials\?/,
    answer: "Y\n",
    label: "answering Y to git-credential prompt",
  },
  {
    pattern: /Press Enter to open|Open this URL to continue/i,
    answer: "\n",
    label: "sending Enter (BROWSER=true)",
  },
];

/** The success markers: the auth completed, the watcher may drain and exit. */
const SUCCESS = /Authentication successful|Logged in as/;

/** The tolerated error markers: gh prints them while it recovers or polls, the watcher keeps waiting. */
const TOLERATED = /error:|fatal:/;

/**
 * The watch lane: the foreground prompt watcher of the python pexpect
 * mode — gh spawns over pipes, the watcher folds every output byte into
 * the log, matches the prompt markers of the stream and pushes the same
 * answers, and exits on the success markers, the gh exit or the 24h
 * watchdog.
 */
async function runwatch() {
  const log = await open(LOG, "a");
  const child = spawn(CMD[0], CMD.slice(1), {
    env: ghenv(),
    stdio: ["pipe", "pipe", "pipe"],
  });
  let stream = "";
  let done = false;
  const feed = (chunk: Buffer) => {
    stream += chunk.toString("utf8");
    /* keep the matching window bounded the way the python watcher kept its 8192 byte buffer */
    if (stream.length > 8192) stream = stream.slice(stream.length - 8192);
    log.appendFile(chunk).catch(() => {});
    for (const prompt of PROMPTS) {
      if (prompt.pattern.test(stream)) {
        stream = "";
        log.appendFile(`\n[auto] ${prompt.label}\n`).catch(() => {});
        child.stdin.write(prompt.answer);
      }
    }
    if (SUCCESS.test(stream)) {
      log.appendFile("\n[auth complete]\n").catch(() => {});
      done = true;
      child.stdin.end();
    }
  };
  child.stdout.on("data", feed);
  child.stderr.on("data", feed);
  const watchdog = setTimeout(() => {
    log.appendFile("\n[watchdog] deadline reached\n").catch(() => {});
    child.kill("SIGTERM");
  }, DEADLINE_MS);
  const code = await new Promise<number | null>((resolve) => {
    child.once("close", (exitcode) => resolve(exitcode));
    child.once("error", () => resolve(-1));
  });
  clearTimeout(watchdog);
  /* the tolerated error markers never exit the watcher on their own — the close above owns the ending, exactly the python polling contract */
  void TOLERATED;
  void done;
  await log.appendFile(`\n[watch mode exiting, gh rc=${code ?? -1}]\n`);
  await log.close();
  if ((code ?? -1) !== 0) process.exitCode = 1;
}

const invokeddirectly = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokeddirectly || process.argv.includes(WORKER_MARK)) {
  if (process.argv.includes(WORKER_MARK)) {
    /* the detached worker of the daemon lane */
    await rundaemonworker();
  } else if (mode === "watch") {
    await runwatch();
  } else {
    await rundaemon();
  }
}
}

/* ------------------------------------------------------------------ */
/* section: scriptsrepocaseharvest.ts — the repo.case harvest          */
/* ------------------------------------------------------------------ */
if (scriptslane === "repocaseharvest") {
// repocaseharvest.ts — repo.case harvest. extracts every dependency key from
// every manifest blob of every commit of a git repository. plain esm
// typescript on node, zero external dependencies. the owner asked for the
// script: it walks the whole commit graph, filters manifest paths, reads the
// blobs (lazy fetch included for partial clones) and records package names,
// kinds, specs, origins and engines.
// usage: node devthink/scriptsrepocaseharvest.ts --repo <git path> --out <json> [--label allen|devthink] [--absorb union.json,...] [--workers 8] [--chunk 150]

/** One parsed manifest json value: the registry manifests carry arbitrary shapes. */
type jsonrecord = Record<string, any>;

/** The command line options the argv walk answers, keyed by its flag name. */
function parseArgs(argv: string[]): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (let i = 2; i < argv.length; i += 2) {
    const key = String(argv[i]).replace(/^--/, "");
    out[key] = argv[i + 1];
  }
  return out;
}

const opts = parseArgs(process.argv);
if (!opts.repo || !opts.out) {
  console.error(
    "usage: node devthink/scriptsrepocaseharvest.ts --repo <git path> --out <json> [--label allen|devthink] [--absorb union.json,...] [--workers 8] [--chunk 150]",
  );
  process.exit(1);
}
const repo: string = opts.repo;
const outFile: string = opts.out;
const label = opts.label || path.basename(repo);
const absorbFiles = (opts.absorb || "").split(",").filter(Boolean);
const blobWorkers = Number(opts.workers || 8);
const chunkSize = Number(opts.chunk || 150);

/** Runs one git command against the repository synchronously and answers its stdout. */
function gitSync(params: string[], timeout: number): string {
  const r = spawnSync("git", ["-C", repo].concat(params), {
    maxBuffer: 1024 * 1024 * 1024,
    encoding: "utf8",
    timeout: timeout || 120000,
  });
  if (r.status !== 0) throw new Error("git " + params.join(" ") + " failed: " + (r.stderr || "").slice(0, 400));
  return r.stdout;
}

/** Runs one git command against the repository and answers its stdout buffer. */
function gitAsync(params: string[], timeout: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    /* spawn streams its output, so the child carries no max buffer option */
    const child = spawn("git", ["-C", repo].concat(params));
    const out: Buffer[] = [];
    let err = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("timeout"));
    }, timeout || 600000);
    child.stdout.on("data", (d: Buffer) => out.push(d));
    child.stderr.on("data", (d: Buffer) => {
      err += d.toString();
    });
    child.on("error", (e: Error) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code: number | null) => {
      clearTimeout(timer);
      if (code !== 0) reject(new Error("git " + params.join(" ") + " failed: " + err.slice(0, 400)));
      else resolve(Buffer.concat(out));
    });
  });
}

/* streams git ls-tree output line by line, zero full buffering. */
function gitStreamLines(params: string[], onLine: (line: string) => void, timeout: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", ["-C", repo].concat(params));
    let err = "";
    let finished = false;
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("git stream timeout"));
    }, timeout || 300000);
    const rl = readline.createInterface({ input: child.stdout });
    rl.on("line", (line: string) => onLine(line));
    child.stderr.on("data", (d: Buffer) => {
      err += d.toString();
    });
    child.on("error", (e: Error) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code: number | null) => {
      clearTimeout(timer);
      if (code !== 0 && !finished) reject(new Error("git " + params.join(" ") + " failed: " + err.slice(0, 300)));
      else resolve();
    });
    rl.on("close", () => {
      finished = true;
    });
  });
}

/* manifest path patterns. basename based, any depth. */
/** One manifest path pattern with the manifest type it answers. */
interface manifestpattern {
  re: RegExp;
  type: string;
}
const MANIFESTS: manifestpattern[] = [
  { re: /(^|\/)package\.json$/, type: "npm" },
  { re: /(^|\/)requirements[^/]*\.txt$/, type: "python" },
  { re: /(^|\/)pyproject\.toml$/, type: "python" },
  { re: /(^|\/)Pipfile$/, type: "python" },
  { re: /(^|\/)setup\.py$/, type: "python" },
  { re: /(^|\/)Cargo\.toml$/, type: "cargo" },
  { re: /(^|\/)go\.mod$/, type: "go" },
  { re: /(^|\/)Gemfile$/, type: "gem" },
  { re: /(^|\/)composer\.json$/, type: "composer" },
  { re: /(^|\/)deno\.jsonc?$/, type: "deno" },
  { re: /(^|\/)pnpm-workspace\.ya?ml$/, type: "pnpmws" },
  { re: /(^|\/)package\.10[^/]*\.json$/, type: "catalog" },
  { re: /(^|\/)package-10[^/]*\.json$/, type: "catalog" },
];

/** Answers the manifest type one path names, or null when the path names no manifest. */
function manifestType(p: string): string | null {
  for (const m of MANIFESTS) if (m.re.test(p)) return m.type;
  return null;
}

/* harvest state */
/** One harvested package: the manifest kinds it appeared under, the version specs, the origins and the sample paths. */
interface packageentry {
  kinds: Record<string, boolean>;
  specs: string[];
  origins: string[];
  paths: string[];
}
/** One package of the output document: the kinds as the sorted string list, the specs, the origins, the paths and the resolved ecosystem. */
interface packageoutput {
  kinds: string[];
  specs: string[];
  origins: string[];
  paths: string[];
  ecosystem: string;
}
/** One harvested engine: the version specs, the origins and the sample paths. */
interface engineentry {
  specs: string[];
  origins: string[];
  paths?: string[];
}
const packages: Record<string, packageentry> = Object.create(null);
const engines: Record<string, engineentry> = Object.create(null);
const repoHints: Record<string, string> = Object.create(null);
let commitsTotal = 0;
let treesScanned = 0;
let blobsSeen = 0;
const parseErrors: string[] = [];

/** Normalizes one version spec to a bounded string. */
function normSpec(v: unknown): string {
  if (v == null) return "";
  const s = String(v).trim();
  return s.length > 60 ? s.slice(0, 60) : s;
}

/** Records one package under its manifest kind with its spec, origin and sample path. */
function addPackage(name: unknown, kind: string, spec: string, origin: string, samplePath: string): void {
  const key = String(name).trim();
  if (!key || key.length > 200) return;
  let e = packages[key];
  if (!e) {
    e = packages[key] = { kinds: Object.create(null), specs: [], origins: [], paths: [] };
  }
  e.kinds[kind] = true;
  if (spec && e.specs.length < 8 && !e.specs.includes(spec)) e.specs.push(spec);
  if (!e.origins.includes(origin)) e.origins.push(origin);
  if (samplePath && e.paths.length < 4 && !e.paths.includes(samplePath)) e.paths.push(samplePath);
}

/** Records one engine declaration with its spec, origin and sample path. */
function addEngine(name: unknown, spec: unknown, origin: string, samplePath: string): void {
  const key = String(name).trim();
  if (!key) return;
  let e = engines[key];
  if (!e) e = engines[key] = { specs: [], origins: [], paths: [] };
  const s = normSpec(spec);
  if (s && e.specs.length < 8 && !e.specs.includes(s)) e.specs.push(s);
  if (!e.origins.includes(origin)) e.origins.push(origin);
  if (samplePath && e.paths && e.paths.length < 3 && !e.paths.includes(samplePath)) e.paths.push(samplePath);
}

/** Records one repository hint (a git or https url a catalog named for a package). */
function addRepoHint(name: unknown, url: unknown): void {
  if (!name || !url) return;
  const key = String(name);
  const u = String(url).trim();
  if (!/^https?:\/\//.test(u) && !/^git@/.test(u)) return;
  if (!repoHints[key] || repoHints[key].length < 300) {
    repoHints[key] = repoHints[key] ? repoHints[key] + "\n" + u : u;
  }
}

/* ============================= parsers ============================= */

/** Parses one json text, answering undefined when the text parses no json. */
function tryJson(text: string): jsonrecord | undefined {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? (parsed as jsonrecord) : undefined;
  } catch {
    /* the caller records the sample path of the unparseable manifest */
    return undefined;
  }
}

const NPM_KIND_EXACT = new Set([
  "overrides",
  "resolutions",
  "trustedDependencies",
  "untrustedDependencies",
  "savedDependencies",
  "peerDependenciesMeta",
  "pnpm",
  "volta",
  "catalog",
]);

/** Parses one npm or composer manifest into packages and engines. */
function parseNpmManifest(text: string, origin: string, samplePath: string, isComposer: boolean): void {
  const json = tryJson(text);
  if (!json) {
    parseErrors.push(samplePath);
    return;
  }
  if (isComposer) {
    for (const kind of ["require", "require-dev"]) {
      const obj = json[kind];
      if (obj && typeof obj === "object") {
        for (const [name, spec] of Object.entries(obj)) {
          if (name === "php" || name === "hhvm" || /^php-\d/.test(name) || /^(ext|lib)-/.test(name))
            addEngine(name, spec, origin, samplePath);
          else addPackage(name, "composer." + kind, normSpec(spec), origin, samplePath);
        }
      }
    }
    return;
  }
  for (const [key, value] of Object.entries(json)) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      /* scalar fields that are engines */
      if (key === "packageManager" && typeof value === "string") {
        const m = /^([^@]+)@(.+)$/.exec(value);
        if (m) addEngine(m[1], m[2], origin, samplePath);
      }
      continue;
    }
    if (/dependencies$/i.test(key) || NPM_KIND_EXACT.has(key)) {
      if (key === "volta") {
        for (const [eng, spec] of Object.entries(value)) addEngine(eng, normSpec(spec), origin, samplePath);
        continue;
      }
      if (key === "pnpm") {
        for (const [sub, subObj] of Object.entries(value)) {
          if (subObj && typeof subObj === "object" && !Array.isArray(subObj)) {
            for (const [name, spec] of Object.entries(subObj)) addPackage(name, "pnpm." + sub, normSpec(spec), origin, samplePath);
          }
        }
        continue;
      }
      for (const [name, spec] of Object.entries(value)) {
        addPackage(name, key, normSpec(spec), origin, samplePath);
      }
    } else if (key === "engines") {
      for (const [eng, spec] of Object.entries(value)) addEngine(eng, normSpec(spec), origin, samplePath);
    } else if (key === "enginesMeta" || key === "cpu" || key === "os" || key === "libc") {
      /* platform meta, keys are not packages */
    }
  }
}

/** Parses one python requirements.txt into packages. */
function parseRequirements(text: string, origin: string, samplePath: string): void {
  for (const raw of text.split(/\r?\n/)) {
    let line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith("-")) continue;
    const hashIdx = line.indexOf(" #");
    if (hashIdx >= 0) line = line.slice(0, hashIdx).trim();
    line = line.split(";")[0].trim();
    line = line.replace(/\[[^\]]*\]/g, "");
    if (!line || line.startsWith("http") || line.startsWith(".") || line.includes("://")) continue;
    const m = /^([A-Za-z0-9][A-Za-z0-9._-]*)\s*(.*)$/.exec(line);
    if (!m) continue;
    const spec = m[2].replace(/\s+/g, " ").trim();
    addPackage(m[1], "python.requirements", spec, origin, samplePath);
  }
}

/* minimal toml walk. enough for dependency tables and arrays. */
/** One toml section: its header, its key/value pairs and its array values. */
interface tomlsection {
  header: string;
  pairs: Array<{ key: string; value: string }>;
  arrays: Array<{ key: string; value: string }>;
}
/** Walks one toml text into its sections with the dependency tables and arrays the parsers read. */
function parseToml(text: string): tomlsection[] {
  const sections: tomlsection[] = [];
  let current: tomlsection = { header: "", pairs: [], arrays: [] };
  sections.push(current);
  const lines = text.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    const header = /^\[\[?([^\]]+)\]\]?$/.exec(trimmed);
    if (header) {
      current = { header: header[1].trim(), pairs: [], arrays: [] };
      sections.push(current);
      i += 1;
      continue;
    }
    const arr = /^([A-Za-z0-9_.-]+)\s*=\s*\[/.exec(trimmed);
    if (arr) {
      /* accumulate until brackets balance */
      let buf = trimmed;
      let depth = (trimmed.match(/\[/g) || []).length - (trimmed.match(/\]/g) || []).length;
      let j = i;
      while (depth > 0 && j + 1 < lines.length) {
        j += 1;
        buf += " " + lines[j].trim();
        depth += (lines[j].match(/\[/g) || []).length - (lines[j].match(/\]/g) || []).length;
      }
      current.arrays.push({ key: arr[1], value: buf });
      i = j + 1;
      continue;
    }
    const pair = /^["']?([A-Za-z0-9_.-]+)["']?\s*=\s*(.+)$/.exec(trimmed);
    if (pair) current.pairs.push({ key: pair[1], value: pair[2].trim() });
    i += 1;
  }
  return sections;
}

/** Collects the quoted string values of one toml buffer. */
function tomlStringValues(buf: string): string[] {
  const out: string[] = [];
  const re = /"([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(buf))) out.push(m[1]);
  return out;
}

/** Parses one pyproject.toml (and pipfile) into packages and engines. */
function parsePyproject(text: string, origin: string, samplePath: string): void {
  const sections = parseToml(text);
  for (const sec of sections) {
    const h = sec.header;
    if (h === "project" || h === "build-system" || h === "dependency-groups" || h === "tool.pdm" || h === "tool.pdm.dev-dependencies") {
      for (const arr of sec.arrays) {
        if (/^dependencies$/.test(arr.key) || /dependencies/.test(arr.key) || arr.key === "requires") {
          const kind =
            h === "build-system" ? "python.build-system" : h === "project" ? "python.dependencies" : "python." + h + "." + arr.key;
          for (const v of tomlStringValues(arr.value)) {
            const m = /^([A-Za-z0-9][A-Za-z0-9._-]*)\s*(.*)$/.exec(v);
            if (m) addPackage(m[1], kind, m[2].trim(), origin, samplePath);
          }
        }
      }
      /* optional-dependencies inline table: dev = [ ... ] pairs */
      for (const p of sec.pairs) {
        if (p.key === "optional-dependencies" || p.key === "dev-dependencies" || /dependencies/.test(p.key)) {
          const inner = parseToml(p.value.replace(/^\{/, "").replace(/\}$/, ""));
          for (const isec of inner) {
            for (const arr of isec.arrays) {
              for (const v of tomlStringValues(arr.value)) {
                const m = /^([A-Za-z0-9][A-Za-z0-9._-]*)\s*(.*)$/.exec(v);
                if (m) addPackage(m[1], "python.optional." + p.key, m[2].trim(), origin, samplePath);
              }
            }
          }
        }
        if (p.key === "requires-python") addEngine("python", p.value.replace(/"/g, ""), origin, samplePath);
      }
      continue;
    }
    const isDepTable =
      /(^|\.)dependencies$/.test(h) ||
      h === "packages" ||
      h === "dev-packages" ||
      (/^tool\.poetry(\.|$)/.test(h) && /dependencies/.test(h)) ||
      /^tool\.pdm\.dev-dependencies/.test(h);
    if (isDepTable) {
      for (const p of sec.pairs) {
        if (p.key === "python") {
          const vm = /version\s*=\s*"([^"]+)"/.exec(p.value) || /^"([^"]+)"/.exec(p.value);
          addEngine("python", vm ? vm[1] : p.value, origin, samplePath);
          continue;
        }
        let spec = "";
        const sm = /^"([^"]+)"/.exec(p.value);
        if (sm) spec = sm[1];
        else {
          const vm = /version\s*=\s*"([^"]+)"/.exec(p.value);
          if (vm) spec = vm[1];
        }
        const kind = h.startsWith("tool.poetry")
          ? "python.poetry"
          : h === "packages" || h === "dev-packages"
            ? "python.pipfile"
            : "python." + h;
        addPackage(p.key, kind === "python.poetry" && /dev/.test(h) ? "python.poetry.dev" : kind, spec, origin, samplePath);
      }
    }
  }
}

/** Parses one Cargo.toml into packages and engines. */
function parseCargo(text: string, origin: string, samplePath: string): void {
  const sections = parseToml(text);
  for (const sec of sections) {
    const h = sec.header;
    if (/^(workspace\.)?(dev-|build-)?dependencies$/.test(h) || /^target\..*\.dependencies$/.test(h) || /(^|\.)dependencies$/.test(h)) {
      for (const p of sec.pairs) {
        let spec = "";
        const sm = /^"([^"]+)"/.exec(p.value);
        if (sm) spec = sm[1];
        else {
          const vm = /version\s*=\s*"([^"]*)"/.exec(p.value);
          if (vm) spec = vm[1];
        }
        const kind = /dev-dependencies/.test(h)
          ? "cargo.dev-dependencies"
          : /build-dependencies/.test(h)
            ? "cargo.build-dependencies"
            : /workspace/.test(h)
              ? "cargo.workspace.dependencies"
              : "cargo.dependencies";
        addPackage(p.key, kind, spec, origin, samplePath);
      }
    }
    if (h === "package" || h === "workspace") {
      for (const p of sec.pairs) {
        if (p.key === "rust-version" || p.key === "edition") addEngine("rust-" + p.key, p.value.replace(/"/g, ""), origin, samplePath);
      }
    }
  }
}

/** Parses one go.mod into packages and engines. */
function parseGoMod(text: string, origin: string, samplePath: string): void {
  const lines = text.split(/\r?\n/);
  let inBlock = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("//")) continue;
    if (inBlock) {
      if (line.startsWith(")")) {
        inBlock = false;
        continue;
      }
      const m = /^(\S+)\s+(\S+)/.exec(line);
      if (m) addPackage(m[1], /\/\/\s*indirect/.test(raw) ? "go.require.indirect" : "go.require", m[2], origin, samplePath);
      continue;
    }
    if (line === "require (") {
      inBlock = true;
      continue;
    }
    const req = /^require\s+(\S+)\s+(\S+)/.exec(line);
    if (req) {
      addPackage(req[1], "go.require", req[2], origin, samplePath);
      continue;
    }
    const go = /^go\s+(\S+)/.exec(line);
    if (go) {
      addEngine("go", go[1], origin, samplePath);
      continue;
    }
    const tool = /^toolchain\s+(\S+)/.exec(line);
    if (tool) {
      addEngine("go-toolchain", tool[1], origin, samplePath);
      continue;
    }
  }
}

/** Parses one Gemfile into packages and engines. */
function parseGemfile(text: string, origin: string, samplePath: string): void {
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const m = /^gem\s+['"]([^'"]+)['"]/.exec(line);
    if (m) {
      addPackage(m[1], "gem", "", origin, samplePath);
      continue;
    }
    const r = /^ruby\s+['"]([^'"]+)['"]/.exec(line);
    if (r) addEngine("ruby", r[1], origin, samplePath);
  }
}

/** Strips the jsonc tolerances (comments and trailing commas) one deno config carries. */
function stripJsonC(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'\\])\/\/[^\n\r]*/g, "$1")
    .replace(/,(\s*[}\]])/g, "$1");
}

/** Parses one deno.json imports map into packages. */
function parseDeno(text: string, origin: string, samplePath: string): void {
  const json = tryJson(stripJsonC(text));
  if (!json) {
    parseErrors.push(samplePath);
    return;
  }
  const imports = json.imports || {};
  for (const [spec, url] of Object.entries(imports)) {
    const sources = [spec, String(url || "")];
    for (const s of sources) {
      let m = /npm:((?:@[^@/]+\/)?[^@/]+(?:\/[^@]+)?)(?:@[^/]*)?/.exec(s);
      if (m) addPackage(m[1], "deno.imports", "", origin, samplePath);
      m = /jsr:(?:@[^@/]+\/)?([^@/]+)@?/.exec(s);
      if (m) addPackage("@jsr/" + m[1], "deno.imports", "", origin, samplePath);
    }
  }
}

/** Parses one pnpm-workspace.yaml catalog into packages. */
function parsePnpmWorkspace(text: string, origin: string, samplePath: string): void {
  let inCatalog = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\r$/, "");
    const trimmed = line.trim();
    if (/^catalog(\.[^:]+)?:\s*$/.test(trimmed) || trimmed === "catalog:") {
      inCatalog = true;
      continue;
    }
    if (trimmed === "packages:") {
      inCatalog = false;
      continue;
    }
    if (inCatalog) {
      const m = /^([A-Za-z0-9@][A-Za-z0-9@/._-]*)\s*:\s*(.+)$/.exec(trimmed);
      if (m && !trimmed.startsWith("#")) addPackage(m[1], "pnpm.catalog", normSpec(m[2]), origin, samplePath);
      else if (trimmed && !trimmed.startsWith("  ") === false && trimmed === "") inCatalog = false;
    }
    if (trimmed && !/^ /.test(line) && !/^catalog/.test(trimmed)) inCatalog = false;
  }
}

/** Parses one setup.py install_requires list into packages. */
function parseSetupPy(text: string, origin: string, samplePath: string): void {
  const m = /install_requires\s*=\s*\[([\s\S]*?)\]/.exec(text);
  if (m) {
    for (const v of tomlStringValues(m[1])) {
      const pm = /^([A-Za-z0-9][A-Za-z0-9._-]*)\s*(.*)$/.exec(v);
      if (pm) addPackage(pm[1], "python.setup", pm[2].trim(), origin, samplePath);
    }
  }
}

/** Parses one package.10 catalog into packages and repository hints. */
function parseCatalog(text: string, origin: string, samplePath: string): void {
  const json = tryJson(text);
  if (!json) {
    parseErrors.push(samplePath);
    return;
  }
  const walk = (obj: jsonrecord, depth: number): void => {
    if (depth > 2 || !obj || typeof obj !== "object") return;
    for (const [name, value] of Object.entries(obj)) {
      if (name === "name" || name === "version" || name === "description" || name === "meta" || name === "packages" || name === "repository") {
        if (value && typeof value === "object" && name !== "meta") walk(value as jsonrecord, depth + 1);
        continue;
      }
      if (typeof value === "string") {
        if (/^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)/.test(value)) addRepoHint(name, value);
        else if (/^git@/.test(value)) addRepoHint(name, value);
        else if (/^[\^~><= ]*\d/.test(value) || value === "*" || value === "latest") addPackage(name, "catalog", value, origin, samplePath);
        else addRepoHint(name, value);
      } else if (value && typeof value === "object") {
        const repo = value.repository || value.repo || (typeof value.repository === "object" ? value.repository.url : null);
        if (repo) addRepoHint(name, String(repo));
        if (value.version) addPackage(name, "catalog", String(value.version), origin, samplePath);
        else walk(value as jsonrecord, depth + 1);
      }
    }
  };
  walk(json, 0);
}

/** Parses one manifest blob of the named type. */
function parseBlob(type: string, text: string, origin: string, samplePath: string): void {
  switch (type) {
    case "npm":
      return parseNpmManifest(text, origin, samplePath, false);
    case "composer":
      return parseNpmManifest(text, origin, samplePath, true);
    case "python": {
      if (/requirements.*\.txt$/.test(samplePath)) return parseRequirements(text, origin, samplePath);
      if (/Pipfile$/.test(samplePath)) return parsePyproject(text, origin, samplePath);
      if (/setup\.py$/.test(samplePath)) return parseSetupPy(text, origin, samplePath);
      return parsePyproject(text, origin, samplePath);
    }
    case "cargo":
      return parseCargo(text, origin, samplePath);
    case "go":
      return parseGoMod(text, origin, samplePath);
    case "gem":
      return parseGemfile(text, origin, samplePath);
    case "deno":
      return parseDeno(text, origin, samplePath);
    case "pnpmws":
      return parsePnpmWorkspace(text, origin, samplePath);
    case "catalog":
      return parseCatalog(text, origin, samplePath);
  }
}

/* ============================= git walk ============================= */

/** One manifest blob the walk collected: its manifest type and its sample paths. */
interface blobentry {
  type: string;
  paths: string[];
}

async function main(): Promise<void> {
  const commits = gitSync(["rev-list", "--all"], 120000)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  commitsTotal = commits.length;
  console.log("[" + label + "] commits: " + commitsTotal);

  /* enumerate manifest blobs across every commit tree. streamed tree walk, zero full buffering. */
  const blobMap = new Map<string, blobentry>();
  const seenTrees = new Set<string>();
  let done = 0;
  const treeWorker = async (queue: string[]): Promise<void> => {
    for (const c of queue) {
      try {
        const treeOid = gitSync(["rev-parse", c + "^{tree}"], 60000).trim();
        if (seenTrees.has(treeOid)) continue;
        seenTrees.add(treeOid);
        let scanned = false;
        await gitStreamLines(
          ["ls-tree", "-r", "--full-tree", c],
          (line: string) => {
            const tab = line.indexOf("\t");
            if (tab < 0) return;
            const meta = line.slice(0, tab).split(/\s+/);
            if (meta.length < 3 || meta[1] !== "blob") return;
            const p = line.slice(tab + 1).trim();
            const t = manifestType(p);
            if (!t) return;
            const oid = meta[2];
            let entry = blobMap.get(oid);
            if (!entry) {
              entry = { type: t, paths: [] };
              blobMap.set(oid, entry);
            }
            if (entry.paths.length < 3 && !entry.paths.includes(p)) entry.paths.push(p);
            if (!scanned) {
              scanned = true;
              treesScanned += 1;
            }
          },
          300000,
        );
      } catch {
        /* commit vanished or timeout, skip */
      }
      done += 1;
      if (done % 25 === 0)
        console.log("[" + label + "] trees walked: " + done + "/" + commitsTotal + ", manifest blobs so far: " + blobMap.size);
    }
  };
  const queues: string[][] = Array.from({ length: 3 }, () => []);
  commits.forEach((c, i) => {
    queues[i % 3].push(c);
  });
  await Promise.all(queues.map(treeWorker));
  console.log("[" + label + "] unique manifest blobs: " + blobMap.size);

  /* read blobs. parallel cat-file --batch workers handle lazy fetch on partial clones. */
  const oids = Array.from(blobMap.keys());
  const chunks: string[][] = [];
  for (let i = 0; i < oids.length; i += chunkSize) chunks.push(oids.slice(i, i + chunkSize));

  const fetchChunk = async (chunk: string[], attempt: number): Promise<Buffer> => {
    try {
      return await new Promise((resolve, reject) => {
        /* spawn streams its output, so the child carries no max buffer option */
        const child = spawn("git", ["-C", repo, "cat-file", "--batch"]);
        const bufs: Buffer[] = [];
        let err = "";
        const timer = setTimeout(() => {
          child.kill("SIGKILL");
          reject(new Error("cat-file timeout"));
        }, 900000);
        child.stdout.on("data", (d: Buffer) => bufs.push(d));
        child.stderr.on("data", (d: Buffer) => {
          err += d.toString();
        });
        child.on("error", (e: Error) => {
          clearTimeout(timer);
          reject(e);
        });
        child.on("close", (code: number | null) => {
          clearTimeout(timer);
          if (code !== 0 && bufs.length === 0) reject(new Error("cat-file failed: " + err.slice(0, 300)));
          else resolve(Buffer.concat(bufs));
        });
        child.stdin.write(chunk.join("\n") + "\n");
        child.stdin.end();
      });
    } catch (e) {
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 3000));
        return fetchChunk(chunk, attempt + 1);
      }
      throw e;
    }
  };

  let chunkDone = 0;
  const blobWorker = async (queue: string[][]): Promise<void> => {
    for (const chunk of queue) {
      let buf: Buffer;
      try {
        buf = await fetchChunk(chunk, 0);
      } catch (e) {
        console.error("[" + label + "] chunk failed permanently: " + (e as Error).message);
        continue;
      }
      let off = 0;
      const total = buf.length;
      while (off < total) {
        const nl = buf.indexOf(0x0a, off);
        if (nl < 0) break;
        const header = buf.slice(off, nl).toString("utf8");
        const parts = header.split(/\s+/);
        if (parts.length < 3 || parts[1] !== "blob") {
          off = nl + 1;
          continue;
        }
        const size = parseInt(parts[2], 10);
        if (!Number.isFinite(size)) {
          off = nl + 1;
          continue;
        }
        const body = buf.slice(nl + 1, nl + 1 + size);
        const oid = parts[0];
        const entry = blobMap.get(oid);
        if (entry && size <= 20 * 1024 * 1024) {
          blobsSeen += 1;
          try {
            parseBlob(entry.type, body.toString("utf8"), label, entry.paths[0] || "");
          } catch {
            parseErrors.push(entry.paths[0] || oid);
          }
        }
        off = nl + 1 + size + 1;
      }
      chunkDone += 1;
      console.log(
        "[" + label + "] blob chunk " + chunkDone + "/" + chunks.length + " (rss " + Math.round(process.memoryUsage().rss / 1048576) + " mb)",
      );
    }
  };
  const blobQueues: string[][][] = Array.from({ length: blobWorkers }, () => []);
  chunks.forEach((ch, i) => {
    blobQueues[i % blobWorkers].push(ch);
  });
  await Promise.all(blobQueues.map(blobWorker));
  console.log("[" + label + "] blobs parsed: " + blobsSeen);

  /* absorb previous union files */
  for (const f of absorbFiles) {
    if (!f) continue;
    let json: jsonrecord;
    try {
      json = JSON.parse(fs.readFileSync(f, "utf8"));
    } catch {
      console.error("absorb skip: " + f);
      continue;
    }
    const categories = json.categories || {};
    for (const [kind, map] of Object.entries(categories)) {
      if (!map || typeof map !== "object") continue;
      for (const [name, spec] of Object.entries(map as jsonrecord)) {
        if (kind === "engines" || kind === "volta") addEngine(name, normSpec(spec), "union", "organizado/md/package.json");
        else if (kind === "pnpm") addPackage(name, "pnpm.union", normSpec(spec), "union", "organizado/md/package.json");
        else addPackage(name, kind === "dependencies" ? "dependencies" : kind, normSpec(spec), "union", "organizado/md/package.json");
      }
    }
    const pk = json.packages || {};
    for (const [name, info] of Object.entries(pk)) {
      if (info && (info as jsonrecord).repository) addRepoHint(name, (info as jsonrecord).repository);
      if (info && Array.isArray((info as jsonrecord).origins)) {
        const e = packages[name];
        if (e) for (const o of (info as jsonrecord).origins) if (!e.origins.includes(o)) e.origins.push(o);
      }
    }
    console.log("[" + label + "] absorbed union: " + f);
  }

  /* stats */
  const ecosystemOf = (name: string): string => {
    const e = packages[name];
    if (!e) return "npm";
    if (e.kinds["python.requirements"] || Object.keys(e.kinds).some((k) => k.startsWith("python."))) return "python";
    if (Object.keys(e.kinds).some((k) => k.startsWith("cargo."))) return "cargo";
    if (Object.keys(e.kinds).some((k) => k.startsWith("go."))) return "go";
    if (Object.keys(e.kinds).some((k) => k.startsWith("gem"))) return "gem";
    if (Object.keys(e.kinds).some((k) => k.startsWith("composer."))) return "composer";
    if (Object.keys(e.kinds).some((k) => k.startsWith("deno."))) return "deno";
    return "npm";
  };
  const ecoCounts: Record<string, number> = {};
  const kindCounts: Record<string, number> = {};
  const outputpackages: Record<string, packageoutput> = {};
  for (const [name, e] of Object.entries(packages)) {
    for (const k of Object.keys(e.kinds)) kindCounts[k] = (kindCounts[k] || 0) + 1;
    const ecosystem = ecosystemOf(name);
    ecoCounts[ecosystem] = (ecoCounts[ecosystem] || 0) + 1;
    outputpackages[name] = { kinds: Object.keys(e.kinds), specs: e.specs, origins: e.origins, paths: e.paths, ecosystem };
  }

  const result = {
    label,
    repo,
    generatedAt: new Date().toISOString(),
    commits: commitsTotal,
    treesScanned,
    manifestBlobs: blobMap.size,
    blobsParsed: blobsSeen,
    parseErrors: parseErrors.length,
    uniquePackages: Object.keys(packages).length,
    ecosystemCounts: ecoCounts,
    kindCounts,
    packages: outputpackages,
    engines,
    repoHints,
  };
  fs.writeFileSync(outFile, JSON.stringify(result));
  console.log(
    "[" +
      label +
      "] wrote " +
      outFile +
      ": " +
      result.uniquePackages +
      " packages, " +
      Object.keys(engines).length +
      " engines, " +
      Object.keys(repoHints).length +
      " repo hints",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
}

/* ------------------------------------------------------------------ */
/* section: scriptsrepocasemetadata.ts — the repo.case metadata        */
/* ------------------------------------------------------------------ */
if (scriptslane === "repocasemetadata") {
// repocasemetadata.ts — repo.case metadata. merges the harvest files of both
// repositories and pulls the package descriptions from the public registries:
// npmjs latest manifest, pypi json, crates.io api, rubygems api, packagist
// api. falls back to repository hints harvested from the catalogs. plain esm
// typescript on node, zero external dependencies, resumable through the cache
// file.
// usage: node devthink/scriptsrepocasemetadata.ts --deps a.json,b.json --out meta.json [--cache file] [--concurrency 24]

/** One parsed registry or harvest json value: the documents carry arbitrary shapes. */
type jsonrecord = Record<string, any>;

/** The command line options the argv walk answers, keyed by its flag name. */
function parseArgs(argv: string[]): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (let i = 2; i < argv.length; i += 2) {
    const key = String(argv[i]).replace(/^--/, "");
    out[key] = argv[i + 1];
  }
  return out;
}

const opts = parseArgs(process.argv);
const depsFiles = (opts.deps || "").split(",").filter(Boolean);
if (!depsFiles.length || !opts.out) {
  console.error("usage: node devthink/scriptsrepocasemetadata.ts --deps a.json,b.json --out meta.json [--cache file] [--concurrency 24]");
  process.exit(1);
}
const outFile: string = opts.out;
const cacheFile = opts.cache || outFile + ".cache";
const concurrency = Number(opts.concurrency || 24);

/* ---------------- merge harvests ---------------- */
/** One merged package: the kinds, specs, origins, paths and the resolved ecosystem. */
interface mergedentry {
  kinds: string[];
  specs: string[];
  origins: string[];
  paths: string[];
  ecosystem: string;
}
/** One merged engine: the specs and the origins. */
interface mergedengine {
  specs: string[];
  origins: string[];
}
const merged: Record<string, mergedentry> = Object.create(null);
const engines: Record<string, mergedengine> = Object.create(null);
const repoHints: Record<string, string> = Object.create(null);
const sourcesMeta: Array<{ label: string; commits: number; manifestBlobs: number; blobsParsed: number; uniquePackages: number }> = [];
for (const f of depsFiles) {
  const j: jsonrecord = JSON.parse(fs.readFileSync(f, "utf8"));
  sourcesMeta.push({ label: j.label, commits: j.commits, manifestBlobs: j.manifestBlobs, blobsParsed: j.blobsParsed, uniquePackages: j.uniquePackages });
  for (const [name, info] of Object.entries(j.packages || {}) as Array<[string, jsonrecord]>) {
    let e = merged[name];
    if (!e) e = merged[name] = { kinds: [], specs: [], origins: [], paths: [], ecosystem: info.ecosystem || "npm" };
    for (const k of info.kinds || []) if (!e.kinds.includes(k)) e.kinds.push(k);
    for (const s of info.specs || []) if (e.specs.length < 8 && !e.specs.includes(s)) e.specs.push(s);
    for (const o of info.origins || []) if (!e.origins.includes(o)) e.origins.push(o);
    for (const p of info.paths || []) if (e.paths.length < 4 && !e.paths.includes(p)) e.paths.push(p);
    if ((info.ecosystem || "npm") !== "npm" && e.ecosystem === "npm") e.ecosystem = info.ecosystem;
  }
  for (const [name, info] of Object.entries(j.engines || {}) as Array<[string, jsonrecord]>) {
    let e = engines[name];
    if (!e) e = engines[name] = { specs: [], origins: [] };
    for (const s of info.specs || []) if (e.specs.length < 8 && !e.specs.includes(s)) e.specs.push(s);
    for (const o of info.origins || []) if (!e.origins.includes(o)) e.origins.push(o);
  }
  for (const [name, hints] of Object.entries(j.repoHints || {}) as Array<[string, string]>) {
    if (!repoHints[name]) repoHints[name] = hints;
  }
}
const names = Object.keys(merged).sort();
console.log("merged packages: " + names.length);

/* ---------------- link normalization ---------------- */
/** Normalizes one repository url onto its canonical https form, answering null when the url names no repository. */
function normalizeRepo(u: unknown): string | null {
  if (!u || typeof u !== "string") return null;
  let s = u.trim();
  s = s.replace(/^git\+https:\/\//, "https://").replace(/^git\+ssh:\/\/git@/, "https://").replace(/^git:\/\//, "https://");
  s = s.replace(/^ssh:\/\/git@/, "https://").replace(/^git@([^:]+):([^#]+)/, "https://$1/$2");
  s = s.replace(/^github:/, "https://github.com/").replace(/^bitbucket:/, "https://bitbucket.org/").replace(/^gitlab:/, "https://gitlab.com/");
  s = s.replace(/\.git(#.*)?$/, "").replace(/[?#].*$/, "");
  s = s.replace(/\/+$/, "");
  if (/^https:\/\/(github\.com|gitlab\.com|bitbucket\.org|codeberg\.org|sr\.ht|gitee\.com|sourceforge\.net|git\.sr\.ht)\/[\w.\-~]+\/[\w.\-~]+$/.test(s)) return s;
  if (/^https:\/\/(github\.com|gitlab\.com|bitbucket\.org|codeberg\.org)\/[\w.\-~]+\/[\w.\-~]+\//.test(s)) {
    const m = s.match(/^https:\/\/[^\/]+\/[^\/]+\/[^\/]+/);
    return m ? m[0] : null;
  }
  return null;
}

/** Answers whether one url is a valid repository link shape. */
function validRepoLink(u: unknown): boolean {
  return typeof u === "string" && /^https:\/\/[\w.\-]+\/[\w.\-~]+\/[\w.\-~]+/.test(u);
}

/** Answers the registry link of one package of its ecosystem. */
function registryLink(name: string, eco: string): string {
  switch (eco) {
    case "python":
      return "https://pypi.org/project/" + encodeURIComponent(name) + "/";
    case "cargo":
      return "https://crates.io/crates/" + encodeURIComponent(name);
    case "gem":
      return "https://rubygems.org/gems/" + encodeURIComponent(name);
    case "composer":
      return "https://packagist.org/packages/" + encodeURIComponent(name);
    case "go":
      return "https://pkg.go.dev/" + name;
    default:
      if (name.startsWith("@jsr/")) return "https://jsr.io/" + name.slice(5);
      return "https://www.npmjs.com/package/" + encodeURIComponent(name);
  }
}

/** Cleans one registry description into a bounded use statement. */
function cleanUse(s: unknown): string | null {
  if (!s || typeof s !== "string") return null;
  let t = s.replace(/\s+/g, " ").trim();
  if (t.length > 220) t = t.slice(0, 217).trim() + "...";
  return t || null;
}

/* ---------------- cache ---------------- */
/** One cached registry answer: the ecosystem, the use statement, the keywords, the license, the repository, the homepage and the source registry. */
interface cacheentry {
  eco: string;
  use: string | null;
  keywords: string[];
  license: string | null;
  repo: string | null;
  homepage: string | null;
  source: string;
}
let cache: Record<string, cacheentry> = {};
if (fs.existsSync(cacheFile)) {
  try {
    cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
  } catch {
    /* a broken cache answers empty and refetches */
    cache = {};
  }
}
let cacheDirty = 0;
function saveCache(): void {
  fs.writeFileSync(cacheFile, JSON.stringify(cache));
  cacheDirty = 0;
}

/* ---------------- fetchers ---------------- */
/** One registry http failure with the status it answered. */
class HttpError extends Error {
  status: number;
  constructor(status: number, url: string) {
    super("http " + status + " " + url);
    this.status = status;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Answers the http status an error carries, or undefined when the error answers none. */
function statusof(e: unknown): number | undefined {
  return e instanceof HttpError ? e.status : undefined;
}

/** Fetches one registry json with retry and backoff for rate limits and transient failures. */
async function jsonGet(url: string, extraHeaders?: Record<string, string>): Promise<any> {
  const headers: Record<string, string> = { accept: "application/json", "user-agent": "repocase-harvest (dependency catalog build)" };
  if (extraHeaders) Object.assign(headers, extraHeaders);
  for (let attempt = 0; attempt < 6; attempt += 1) {
    let res: Response;
    try {
      res = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
    } catch (e) {
      if (attempt === 5) throw e;
      await sleep(1200 * (attempt + 1));
      continue;
    }
    if (res.ok) return res.json();
    if (res.status === 404 || res.status === 410) throw new HttpError(res.status, url);
    if (res.status === 429 || res.status >= 500) {
      const delay = Math.min(45000, 2500 * Math.pow(2, attempt)) + Math.floor(Math.random() * 1500);
      await sleep(delay);
      continue;
    }
    throw new HttpError(res.status, url);
  }
  throw new HttpError(0, url);
}

/** Fetches the npmjs latest manifest of one package. */
async function fetchNpm(name: string): Promise<cacheentry> {
  const enc = name.startsWith("@jsr/") ? null : encodeURIComponent(name);
  const j = await jsonGet("https://registry.npmjs.org/" + enc + "/latest");
  const repoRaw = typeof j.repository === "string" ? j.repository : (j.repository && j.repository.url) || null;
  return {
    eco: "npm",
    use: cleanUse(j.description),
    keywords: Array.isArray(j.keywords) ? j.keywords.slice(0, 8) : [],
    license: j.license || null,
    repo: normalizeRepo(repoRaw) || normalizeRepo(j.homepage),
    homepage: typeof j.homepage === "string" && /^https?:\/\//.test(j.homepage) ? j.homepage : null,
    source: "npmjs",
  };
}

/** Normalizes one pypi project name onto its canonical dashed form. */
function pypiNorm(name: string): string {
  return name.toLowerCase().replace(/[-_.]+/g, "-");
}

/** Fetches the pypi metadata of one package, retrying the normalized name the registry redirects to. */
async function fetchPypi(name: string): Promise<cacheentry> {
  try {
    const j = await jsonGet("https://pypi.org/pypi/" + encodeURIComponent(name) + "/json");
    return pypiFrom(j);
  } catch (e) {
    const n = pypiNorm(name);
    if (n !== name) {
      const j = await jsonGet("https://pypi.org/pypi/" + encodeURIComponent(n) + "/json");
      return pypiFrom(j);
    }
    throw e;
  }
}

/** Maps one pypi json answer onto the cache entry shape. */
function pypiFrom(j: jsonrecord): cacheentry {
  const info = j.info || {};
  const urls = info.project_urls || {};
  const repo = normalizeRepo(urls.Source) || normalizeRepo(urls.Repository) || normalizeRepo(urls["Source Code"]) || normalizeRepo(urls.GitHub) || normalizeRepo(urls.source) || normalizeRepo(info.home_page);
  return {
    eco: "python",
    use: cleanUse(info.summary || (info.description || "").split("\n")[0] || null),
    keywords: typeof info.keywords === "string" && info.keywords ? info.keywords.split(/[,;]\s*/).slice(0, 8) : [],
    license: (info.license || "").toString().slice(0, 40) || null,
    repo: repo,
    homepage: /^https?:\/\//.test(info.home_page || "") ? info.home_page : urls.Homepage || null,
    source: "pypi",
  };
}

/** Fetches the crates.io metadata of one crate. */
async function fetchCargo(name: string): Promise<cacheentry> {
  const j = await jsonGet("https://crates.io/api/v1/crates/" + encodeURIComponent(name));
  const c = j.crate || {};
  return {
    eco: "cargo",
    use: cleanUse(c.description),
    keywords: (j.categories || []).map((x: jsonrecord) => x.id || x).slice(0, 6),
    license: c.license || null,
    repo: normalizeRepo(c.repository) || normalizeRepo(c.homepage),
    homepage: /^https?:\/\//.test(c.homepage || "") ? c.homepage : null,
    source: "crates.io",
  };
}

/** Fetches the rubygems metadata of one gem. */
async function fetchGem(name: string): Promise<cacheentry> {
  const j = await jsonGet("https://rubygems.org/api/v1/gems/" + encodeURIComponent(name) + ".json");
  return {
    eco: "gem",
    use: cleanUse(j.description || (j.info || "").split("\n")[0] || null),
    keywords: [],
    license: j.license || null,
    repo: normalizeRepo(j.source_code_uri) || normalizeRepo(j.homepage_uri),
    homepage: /^https?:\/\//.test(j.homepage_uri || "") ? j.homepage_uri : null,
    source: "rubygems",
  };
}

/** Fetches the packagist metadata of one composer package. */
async function fetchComposer(name: string): Promise<cacheentry> {
  const j = await jsonGet("https://repo.packagist.org/p/" + encodeURIComponent(name) + ".json");
  const pkgs = (j.packages || {})[name] || {};
  const versions = Object.keys(pkgs).filter((v) => /^[0-9]/.test(v)).sort(cmpVer);
  const latest = pkgs[versions[versions.length - 1]] || {};
  return {
    eco: "composer",
    use: cleanUse(latest.description),
    keywords: [],
    license: latest.license || null,
    repo: normalizeRepo(latest.source && latest.source.url),
    homepage: /^https?:\/\//.test(latest.homepage || "") ? latest.homepage : null,
    source: "packagist",
  };
}

/** Compares two version strings numerically across their dot and dash parts. */
function cmpVer(a: string, b: string): number {
  const pa = a.split(/[.-]/).map(Number);
  const pb = b.split(/[.-]/).map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
}

/** Fetches the metadata of one package from the registry its ecosystem names. */
async function fetchOne(name: string, eco: string): Promise<cacheentry> {
  switch (eco) {
    case "python":
      return fetchPypi(name);
    case "cargo":
      return fetchCargo(name);
    case "gem":
      return fetchGem(name);
    case "composer":
      return fetchComposer(name);
    case "go":
      return { eco: "go", use: null, keywords: [], license: null, repo: null, homepage: null, source: "none" };
    case "deno": {
      if (name.startsWith("@jsr/")) return { eco: "deno", use: null, keywords: [], license: null, repo: null, homepage: null, source: "none" };
      try {
        return await fetchNpm(name);
      } catch {
        return { eco: "deno", use: null, keywords: [], license: null, repo: null, homepage: null, source: "none" };
      }
    }
    default:
      return fetchNpm(name);
  }
}

async function main(): Promise<void> {
  /* repair pass: drop cache entries whose repository field was truncated by the old normalizer */
  let repaired = 0;
  for (const [name, entry] of Object.entries(cache)) {
    if (entry && entry.repo !== null && entry.repo !== undefined && !validRepoLink(entry.repo)) {
      delete cache[name];
      repaired += 1;
    } else if (entry && typeof entry.repo === "string" && entry.repo.length < 12) {
      delete cache[name];
      repaired += 1;
    }
  }
  if (repaired) {
    console.log("cache repair: dropped " + repaired + " poisoned entries for refetch");
    saveCache();
  }
  let done = 0;
  const failures: string[] = [];
  const queue = names.slice();
  const ecoSlow = new Set(["cargo", "composer", "gem"]);
  const inflight: Promise<void>[] = [];
  let idx = 0;

  async function worker(): Promise<void> {
    while (idx < queue.length) {
      const name = queue[idx];
      idx += 1;
      const info = merged[name];
      const eco = info.ecosystem || "npm";
      if (!cache[name]) {
        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            const r = await fetchOne(name, eco);
            if (r) {
              cache[name] = r;
              break;
            }
          } catch (e) {
            if (attempt === 2 || statusof(e) === 404 || statusof(e) === 410) failures.push(name);
            else await sleep(1500);
          }
        }
        cacheDirty += 1;
        await sleep(ecoSlow.has(eco) ? 200 : 60);
      }
      done += 1;
      if (done % 500 === 0) {
        console.log("metadata: " + done + "/" + queue.length + " (failures " + failures.length + ")");
        if (cacheDirty > 400) saveCache();
      }
    }
  }
  for (let i = 0; i < concurrency; i += 1) inflight.push(worker());
  await Promise.all(inflight);
  saveCache();

  /* build the final meta map with link and use resolution */
  const meta: Record<
    string,
    {
      ecosystem: string;
      kinds: string[];
      origins: string[];
      link: string;
      use: string | null;
      keywords: string[];
      license: string | null;
      source: string;
      repo: string | null;
    }
  > = {};
  for (const name of names) {
    const info = merged[name];
    const eco = info.ecosystem || "npm";
    const c: Partial<cacheentry> = cache[name] || {};
    const hintRepo = normalizeRepo((repoHints[name] || "").split("\n")[0]);
    const link = c.repo || hintRepo || c.homepage || registryLink(name, eco);
    meta[name] = {
      ecosystem: c.eco || eco,
      kinds: info.kinds,
      origins: info.origins,
      link,
      use: c.use || null,
      keywords: c.keywords || [],
      license: c.license || null,
      source: c.source || "registry",
      repo: c.repo || hintRepo || null,
    };
  }
  const out = {
    generatedAt: new Date().toISOString(),
    sources: sourcesMeta,
    uniquePackages: names.length,
    failures: failures.length,
    packages: meta,
    engines,
  };
  fs.writeFileSync(outFile, JSON.stringify(out));
  console.log(
    "wrote " + outFile + ": " + names.length + " packages, " + failures.length + " registry failures, " + Object.values(meta).filter((m) => m.use).length + " with descriptions",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
}

/* ------------------------------------------------------------------ */
/* section: scriptsscaffoldtemplates.ts — the deployable clone factory */
/* ------------------------------------------------------------------ */
if (scriptslane === "scaffoldtemplates") {
// scaffoldtemplates.ts — generates the deployable clones (vault, forge, foundry)
// on the official house tree: one folder per app, no src/. The app root carries
// the loose .ts logics, the theme root files (App.tsx the global anchor,
// index.html, the platform deploy copies, the manifest and the drizzle schema)
// and the theme stylesheet lives inside the theme as Sol/sol.css, docs/ and
// tests/ exist beside it, and the Sol/ folder carries the component folders:
// one folder per page with loose TSX components beside the shared shell and
// toast folders. The anchor architecture rides the tree: App.tsx imports only
// the theme anchor (Sol/Sol.tsx, the file named after the theme folder) and
// the stylesheet, the theme anchor consumes the page anchors and every page
// folder fronts its loose components with its own anchor
// (Sol/<folder>/<folder>.tsx — the former main component lives in the anchor
// itself and the public components ride its star exports).
// There is no per-page .styles.ts/.types.ts/.test.tsx quadruple and no
// next.personalizado folder — the Next variants exist only as release assets,
// built by nextconvert.ts.
// Usage: node devthink/scriptsscaffoldtemplates.ts   (at the monorepo root)

const ROOT = process.cwd();
const DENTRO = (alvo: string): string => {
  const r = path.resolve(alvo);
  if (r !== ROOT && !r.startsWith(ROOT + path.sep)) throw new Error("path outside the monorepo root: " + r);
  return r;
};
const w = (file: string, content: string) => {
  const alvo = DENTRO(file);
  mkdirSync(path.dirname(alvo), { recursive: true });
  writeFileSync(alvo, content.trimStart() + (content.endsWith("\n") ? "" : "\n"));
};

const casa = (nome: string, papel: string, logicas: string[]) => {
  const root = DENTRO(path.join(ROOT, nome));
  // the folder is fully regenerated: stale files from an older shape never survive
  rmSync(root, { recursive: true, force: true });
  const tema = path.join(root, "Sol");
  w(
    path.join(root, "README.md"),
    `# ${nome}\n\n${papel}.\n\nHouse tree: one folder per app, no src/ — the app root carries the loose .ts logics and the theme root files (App.tsx the router, index.html, the platform deploy copies, the manifest and the schema), the theme stylesheet lives inside the theme as Sol/sol.css, docs/ and tests/ exist beside it, and the Sol/ folder carries the component folders: one folder per page with loose TSX components beside the shared shell. The complete site archive and the Next conversions (done by the workflow, no folder duplication) travel as tar.xz assets in the release.\n`,
  );
  w(
    path.join(root, "App.tsx"),
    `/**\n * App — the global anchor (layer 1 of the anchor architecture) and the only\n * TSX outside the theme. The root manages the themes as single files: it\n * imports only the theme anchor (Sol/Sol.tsx — the file named after the theme\n * folder, beside Sol/sol.css) and the theme stylesheet and renders the theme.\n * Every page and component lives behind the anchor chain (App → Sol → the\n * page anchors → the loose components); nothing is imported directly.\n */\nimport Sol from './Sol/Sol';\nimport './Sol/sol.css';\n\nexport default function App() {\n  return <Sol />;\n}\n`,
  );
  w(
    path.join(root, "index.html"),
    `<!doctype html>\n<!-- web entry of the theme -->\n<html lang="pt-BR">\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <meta name="theme-color" content="#0f172a" />\n    <meta name="description" content="${papel}" />\n    <link rel="icon" href="./favicon.svg" />\n    <link rel="stylesheet" href="./Sol/sol.css" />\n    <link rel="manifest" href="./manifest.webmanifest" />\n    <title>${nome}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="./App.tsx"></script>\n  </body>\n</html>\n`,
  );
  w(
    path.join(tema, "sol.css"),
    `/* the only stylesheet of the theme — it lives inside the theme folder (Sol/sol.css) */\n:root {\n  color-scheme: dark light;\n  font-family: system-ui, sans-serif;\n}\n\nbody {\n  margin: 0;\n}\n`,
  );
  w(
    path.join(root, "vite.config.ts"),
    `// the vite build answers straight at the application root: the entry html and the hashed bundles live beside the engine logic, with no dist, no public and no assets folder\nimport react from '@vitejs/plugin-react';\nimport path from 'node:path';\nimport { defineConfig } from 'vite';\n\nexport default defineConfig({\n  base: '/',\n  plugins: [react()],\n  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'Sol') } },\n  root: import.meta.dirname,\n  build: { outDir: path.resolve(import.meta.dirname, '.'), emptyOutDir: false, assetsDir: '' },\n  server: { fs: { allow: [import.meta.dirname] }, host: true, allowedHosts: true },\n});\n`,
  );
  w(
    path.join(root, "tsconfig.json"),
    `{\n  "include": ["*.ts", "*.tsx", "Sol/**/*.ts", "Sol/**/*.tsx"],\n  "exclude": ["node_modules", "build", "**/*.test.ts"],\n  "compilerOptions": {\n    "noEmit": true,\n    "module": "ESNext",\n    "strict": true,\n    "lib": ["esnext", "dom", "dom.iterable"],\n    "jsx": "react-jsx",\n    "esModuleInterop": true,\n    "skipLibCheck": true,\n    "allowImportingTsExtensions": true,\n    "moduleResolution": "bundler",\n    "types": ["vite/client", "node"],\n    "baseUrl": ".",\n    "paths": { "@/*": ["Sol/*", "./*"] }\n  }\n}\n`,
  );
  w(
    path.join(root, "package.json"),
    JSON.stringify(
      {
        name: `@wenathlan/${nome}`,
        private: true,
        type: "module",
        version: "2.0.42",
        scripts: {
          dev: "vite --host",
          build: "vite build",
          start: "vite preview --host",
          preview: "vite preview --host",
          check: "tsc --noEmit",
        },
        dependencies: { "@fluentui/react-icons": "^2.0.344", react: "^19.3.0", "react-dom": "^19.3.0", wouter: "^3.13.0" },
        devDependencies: {
          "@types/react": "^19.3.0",
          "@types/react-dom": "^19.3.0",
          "@vitejs/plugin-react": "^6.1.1",
          typescript: "^7.0.2",
          vite: "^8.3.2",
        },
        packageManager: "pnpm@12.3.4",
      },
      null,
      2,
    ),
  );
  w(
    path.join(root, "pnpm-workspace.yaml"),
    `# the pnpm settings live here since pnpm 12 (the package.json pnpm field is no longer read): the build scripts the dependency tree may run, every other script stays ignored\nonlyBuiltDependencies:\n  - '@prisma/engines'\n  - '@tailwindcss/oxide'\n  - better-sqlite3\n  - cpu-features\n  - esbuild\n  - prisma\n  - protobufjs\n  - ssh2\n  - workerd\n`,
  );
  w(
    path.join(root, "devthink.toml"),
    `# application identity on the platform\napp = "${nome}"\nrole = "${papel}"\ntheme = "Sol"\npages = ["home", "notfound"]\n`,
  );
  w(
    path.join(root, "wrangler.toml"),
    `# Cloudflare/Workers config (deploy, bindings, domain routes)\nname = "${nome}"\nmain = "index.html"\ncompatibility_date = "2026-09-29"\n\n[assets]\ndirectory = "."\n`,
  );
  w(
    path.join(root, ".dev.vars.example"),
    `# local wrangler dev secrets (never committed; copy to .dev.vars)\nDEVTHINK_DB_URL=placeholder\nDEVTHINK_RUNNER_TOKEN=placeholder\n`,
  );
  w(path.join(root, ".gitignore"), `node_modules/\ndist/\n.dev.vars\n`);
  w(path.join(root, "vercel.json"), `{\n  "cleanUrls": true,\n  "outputDirectory": "."\n}\n`);
  w(
    path.join(root, "netlify.toml"),
    `# the build answers straight at the application root: no dist, no public\n[build]\n  publish = "."\n`,
  );
  w(
    path.join(root, "manifest.json"),
    `{\n  "name": "${nome}",\n  "short_name": "${nome}",\n  "description": "${papel}",\n  "start_url": "/",\n  "id": "/",\n  "display": "standalone",\n  "background_color": "#0f172a",\n  "theme_color": "#0f172a",\n  "scope": "/",\n  "lang": "pt-BR",\n  "icons": [\n    { "src": "/icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any" },\n    { "src": "/icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any maskable" }\n  ]\n}\n`,
  );
  w(
    path.join(root, "manifest.webmanifest"),
    `{\n  "name": "${nome}",\n  "short_name": "${nome}",\n  "description": "${papel}",\n  "start_url": "/",\n  "id": "/",\n  "display": "standalone",\n  "background_color": "#0f172a",\n  "theme_color": "#0f172a",\n  "scope": "/",\n  "lang": "pt-BR",\n  "icons": [\n    { "src": "/icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any" },\n    { "src": "/icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any maskable" }\n  ]\n}\n`,
  );
  w(path.join(root, "keywords.txt"), `${nome}, ${papel.toLowerCase()}, workbench, ai, llm, gateway, tema sol\n`);
  w(
    path.join(root, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<!-- the universal deployable template: the loc values stay relative so no domain is hardcoded here -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n<url>\n<loc>/</loc>\n<lastmod>2026-10-01</lastmod>\n<changefreq>weekly</changefreq>\n<priority>1.0</priority>\n</url>\n\n</urlset>\n`,
  );
  w(
    path.join(root, "robots.txt"),
    `# the universal deployable template: no domain lives here — the canonical domain binds at the platform only\nUser-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /node_modules/\nDisallow: /*.js.map$\nDisallow: /*.css.map$\n\nSitemap: /sitemap.xml\n`,
  );
  w(
    path.join(root, "icon.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#g)"/></svg>\n`,
  );
  w(
    path.join(root, "favicon.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#7c3aed"/></svg>\n`,
  );
  w(path.join(root, "schema.prisma"), `// the schema of the application database (the db.ts logic reads it)\n`);
  w(
    path.join(root, "drizzle.config.ts"),
    `// the drizzle kit config of the application database\nexport default {};\n`,
  );
  w(
    path.join(tema, "Sol.tsx"),
    `/**\n * Sol theme anchor — layer 2 of the anchor architecture.\n * The file carrying the theme folder's own name (Sol/Sol.tsx, beside\n * Sol/sol.css) is the path manager of the pages: it imports one anchor per\n * page folder (\`folder/folder.tsx\`, each beside the loose components its\n * folder keeps) and mounts the page surface of the theme. App.tsx consumes\n * only this file and the theme stylesheet; no page component is ever\n * imported outside this layer. When a theme folder changes its name (Moon,\n * Aqua), this file follows the new name and App.tsx keeps importing the\n * anchor by the folder path.\n */\nimport HomeAnchor from './home/home';\n\n/** Mounts the theme surface through the page anchors. */\nexport default function Sol() {\n  return <HomeAnchor />;\n}\n`,
  );
  w(
    path.join(tema, "shell", "Shell.tsx"),
    `// shared shell component of the theme: frame, dock and toasts wrap every page\nimport type { ReactNode } from 'react';\n\nexport function Shell({ children }: { children: ReactNode }) {\n  return <div className="shell">{children}</div>;\n}\n`,
  );
  w(
    path.join(tema, "home", "home.tsx"),
    `/**\n * home page anchor — layer 3 of the anchor architecture.\n * The file carrying the folder's own name is the path manager of the page:\n * it imports the loose components beside it, mounts the page and re-exports\n * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes\n * this file. This anchor carries the former main component of the folder,\n * which now lives here as the page mount itself.\n */\nimport { Entry } from './entry';\nimport { Tabs } from './tabs';\nimport type { HomeProps } from './types';\n\nexport * from './entry';\nexport * from './tabs';\n\nexport function Home(props: HomeProps) {\n  return (\n    <main className="page">\n      <h1>Home</h1>\n      <p>{props.input}</p>\n      <Entry />\n      <Tabs />\n    </main>\n  );\n}\n\nexport default Home;\n`,
  );
  w(
    path.join(tema, "home", "entry.tsx"),
    `// entry component of the home page — loose TSX in the page folder\nexport function Entry() {\n  return <section className="entry">entry</section>;\n}\n`,
  );
  w(
    path.join(tema, "home", "tabs.tsx"),
    `// tabs component of the home page — loose TSX in the page folder\nexport function Tabs() {\n  return <nav className="tabs">tabs</nav>;\n}\n`,
  );
  w(
    path.join(tema, "home", "types.ts"),
    `// types of the home page\nexport interface HomeProps {\n  input: string;\n}\n`,
  );
  w(
    path.join(tema, "notfound", "notfound.tsx"),
    `/**\n * notfound page anchor — layer 3 of the anchor architecture.\n * The file carrying the folder's own name is the path manager of the page:\n * it imports the loose components beside it, mounts the page and re-exports\n * the public component surface. Only the theme anchor (Sol/Sol.tsx) consumes\n * this file. This anchor carries the former main component of the folder,\n * which now lives here as the page mount itself.\n */\n\nexport function NotFound() {\n  return <main className="page"><h1>404</h1></main>;\n}\n\nexport default NotFound;\n`,
  );
  const corpo: Record<string, string> = {
    "api.ts": `// api — correlated logic of the site HTTP surface\nexport const routes = {\n  health: '/api/health',\n} as const;\n`,
    "db.ts": `// db — correlated logic of storage (Drizzle ORM + better-sqlite3; the schema lives at the application root)\nexport const tables = ['keys', 'payloads'] as const;\n`,
    "runner.ts": `// runner — correlated logic of execution (the Saddle engine runs the binary and returns the result)\nexport const modes = ['full-virtual', 'runner', 'node-packages', 'docker', 'ghcr'] as const;\n`,
    "utils.ts": `// utils — correlated logic of shared helpers\nexport const splitwords = (text: string): string[] => text.split(/\\s+/).filter(Boolean);\n`,
  };
  for (const logica of logicas) w(path.join(root, logica), corpo[logica] ?? `// ${logica}\nexport {};\n`);
  w(path.join(root, "docs", ".gitkeep"), "");
  w(path.join(root, "tests", ".gitkeep"), "");
  console.log("generated: " + nome);
};

casa(
  "vault",
  "deployable clone of storage only (the network DB): keeps every site database and receives the data backups",
  ["api.ts", "db.ts", "utils.ts"],
);
casa(
  "forge",
  "deployable clone of execution only (the sandbox): runs any binary with the Saddle engine and stores nothing",
  ["api.ts", "runner.ts", "utils.ts"],
);
casa("foundry", "complete deployable clone (sandbox + DB): runs, is the sandbox and keeps the network databases", [
  "api.ts",
  "db.ts",
  "runner.ts",
  "utils.ts",
]);
}

/* ------------------------------------------------------------------ */
/* section: scriptssignedlanding.ts — the github signed landing        */
/* ------------------------------------------------------------------ */
if (scriptslane === "signedlanding") {
// signedlanding.ts — the github signed landing vehicle of the family: every
// wave the owner lands through this script reaches main as a commit github
// itself created through the squash merge of a dated pull request, so the
// commit carries the official github web flow signature — the verified badge
// the 2.0.118 era answered and the direct git pushes of the later eras lost,
// because a pushed local commit can never carry it: the repository token owns
// no signing key registered on the account, the contents api answers unsigned
// commits, and only the commits github creates server side (the squash merge
// among them) receive the web flow key. the vehicle respects the staging the
// operator already carries (a non empty index lands exactly what it holds),
// stages the whole tree only when the index answers empty (the ignore file
// keeps the sandbox artifacts out), commits the net state of the index
// against origin main on a dated automation branch, pushes the
// branch beside its archive tag, opens the pull request, squashes it onto
// main with the owner token (the admin merge the maintenance ladder rides —
// enforce admins stays off, so the squash never waits for the review policy),
// deletes the branch the archive tag already preserves, advances local main to
// the landed head without rewriting a single file on disk and refuses to
// answer success until the github api itself
// confirms the landed commit verified true. file modes ride the branch
// verbatim (the graphql file addition lane would flatten the executable tree
// the house keeps), and the vehicle verifies the landed tree equals the
// staged tree before it answers. the optional wait flag holds the squash until
// every check run of the pull request answers complete and green, the way the
// maintenance rungs walk their pipeline before they land.
// usage: bun devthink/scriptssignedlanding.ts "<headline>" ["<body>"] [--name <label>] [--wait] [--dry]

interface GitResult {
  ok: boolean;
  out: string;
  err: string;
}

interface Verification {
  verified: boolean;
  reason: string;
}

interface CommitView {
  sha: string;
  commit: {
    message: string;
    verification: Verification;
    committer: { name: string } | null;
  };
}

interface PullView {
  number: number;
  html_url: string;
  head: { sha: string };
  mergeable_state?: string;
}

interface CheckRunsView {
  total_count: number;
  check_runs: Array<{ status: string; conclusion: string | null; name: string }>;
}

interface MergeResponse {
  sha: string | null;
  merged: boolean;
  message: string;
}

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const wait = args.includes("--wait");
const nameFlagAt = args.indexOf("--name");
const labelArg = nameFlagAt >= 0 ? args[nameFlagAt + 1] : undefined;
const positional = args.filter((a, i) => a && !a.startsWith("--") && (i !== nameFlagAt + 1 || nameFlagAt < 0));
const headline = positional[0];
const body = positional[1] ?? "";
if (!headline) {
  console.error(
    'usage: bun devthink/scriptssignedlanding.ts "<headline>" ["<body>"] [--name <label>] [--wait] [--dry]',
  );
  process.exit(1);
}

const git = (cmdArgs: string[]): GitResult => {
  const r = spawnSync("git", cmdArgs, { cwd: process.cwd(), encoding: "utf8", maxBuffer: 1024 * 1024 * 1024 });
  return { ok: r.status === 0, out: (r.stdout ?? "").trim(), err: (r.stderr ?? "").trim() };
};
const must = (cmdArgs: string[], context: string): string => {
  const r = git(cmdArgs);
  if (!r.ok) throw new Error(`${context} refused: git ${cmdArgs.join(" ")} answered ${r.err || r.out}`);
  return r.out;
};

const root = must(["rev-parse", "--show-toplevel"], "the root resolve");
const gitCwd = { cwd: root } as { cwd: string };
const gitAt = (cmdArgs: string[]): GitResult => {
  const r = spawnSync("git", cmdArgs, { ...gitCwd, encoding: "utf8", maxBuffer: 1024 * 1024 * 1024 });
  return { ok: r.status === 0, out: (r.stdout ?? "").trim(), err: (r.stderr ?? "").trim() };
};
const mustAt = (cmdArgs: string[], context: string): string => {
  const r = gitAt(cmdArgs);
  if (!r.ok) throw new Error(`${context} refused: git ${cmdArgs.join(" ")} answered ${r.err || r.out}`);
  return r.out;
};

const remote = mustAt(["config", "--get", "remote.origin.url"], "the remote read");
const tokenMatch = remote.match(/x-access-token:([^@]+)@github\.com/) ?? null;
const token = process.env.OWNER_PAT ?? (tokenMatch ? tokenMatch[1] : "");
const slugMatch = remote.match(/github\.com[:/]([^/]+\/[^/.]+)(?:\.git)?$/);
if (!slugMatch) throw new Error("the remote url carries no github owner repo slug");
const slug = slugMatch[1];
if (!token) throw new Error("no token answers: neither the OWNER_PAT environment nor the remote url carries one");

const api = async (method: string, path: string, payload?: unknown): Promise<Record<string, unknown>> => {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
      "user-agent": "devthink signed landing",
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const text = await res.text();
  const json: Record<string, unknown> = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  if (!res.ok) {
    const err = new Error(`github api ${method} ${path} answered ${res.status}: ${text.slice(0, 600)}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return json;
};

const labelRaw = (labelArg ?? "signedlanding").toLowerCase();
const label = labelRaw.replace(/[^a-z0-9.]/g, ".");
const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
const branch = `automation/${label}-${stamp}`;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const walk = async (): Promise<void> => {
  // the fetch and sync first doctrine: the vehicle never lands over a stale
  // view of the remote head.
  mustAt(["fetch", "--prune", "origin"], "the fetch");
  const current = mustAt(["symbolic-ref", "--short", "HEAD"], "the branch read");
  if (current !== "main") throw new Error(`the vehicle lands from main only and the tree answers ${current}`);
  const remoteHead = mustAt(["rev-parse", "origin/main"], "the remote head read");
  const ahead = mustAt(["rev-list", "--count", `origin/main..HEAD`], "the ahead count");
  if (Number(ahead) > 0) {
    console.log(`local main is ahead by ${ahead} commits: their net tree effect folds into the signed landing`);
  }
  console.log(`the landing walks from ${remoteHead.slice(0, 8)} on ${slug}`);
  const preStaged = gitAt(["diff", "--cached", "--name-only"]).out;
  if (preStaged.length > 0) {
    console.log(
      `the index already carries ${preStaged.split("\n").length} staged paths: the landing respects the operator staging`,
    );
  } else {
    mustAt(["add", "-A"], "the stage");
  }

  const rawDiff = gitAt(["diff", "--cached", "--no-renames", "--name-status", "-z", "origin/main"]);
  if (!rawDiff.ok) throw new Error(`the changeset read refused: ${rawDiff.err}`);
  const pieces = rawDiff.out.split("\0").filter((p) => p.length > 0);
  const changed: Array<{ status: string; path: string }> = [];
  for (let i = 0; i < pieces.length; i += 2) {
    changed.push({ status: pieces[i], path: pieces[i + 1] ?? "" });
  }
  if (changed.length === 0 && Number(ahead) === 0) {
    console.log("nothing to land: the index answers no change against origin main");
    process.exit(0);
  }
  const added = changed.filter((c) => c.status !== "D").length;
  const removed = changed.filter((c) => c.status === "D").length;
  console.log(`the wave carries ${changed.length} paths (${added} added or modified, ${removed} removed)`);
  if (dry) {
    for (const c of changed) console.log(`  ${c.status}\t${c.path}`);
    console.log("dry walk: nothing landed");
    process.exit(0);
  }

  mustAt(["switch", "-c", branch], "the branch cut");
  const message = body ? `${headline}\n\n${body}` : headline;
  mustAt(["commit", "-m", message], "the wave commit");
  const branchSha = mustAt(["rev-parse", "HEAD"], "the branch head read");
  const branchTree = mustAt(["rev-parse", `${branch}^{tree}`], "the branch tree read");
  mustAt(["tag", `archive/${branch}`], "the archive tag");
  mustAt(["push", "origin", `refs/heads/${branch}`, `refs/tags/archive/${branch}`], "the branch push");
  console.log(`the branch ${branch} answers ${branchSha} beside its archive tag`);

  const prBody =
    (body ? `${body}\n\n` : "") +
    "The signed landing vehicle opens this pull request so the squash merge answers the official github signature: the landed commit is created server side, carries the web flow key and shows the verified badge. The archive tag preserves the branch after the squash deletes it.";
  const pr = (await api("POST", `/repos/${slug}/pulls`, {
    title: headline,
    head: branch,
    base: "main",
    body: prBody,
  })) as unknown as PullView;
  console.log(`the pull request ${pr.number} answers ${pr.html_url}`);

  if (wait) {
    let waited = 0;
    for (;;) {
      const checks = (await api("GET", `/repos/${slug}/commits/${branchSha}/check-runs`)) as unknown as CheckRunsView;
      const running = checks.check_runs.filter((c) => c.status !== "completed").length;
      const failed = checks.check_runs.filter(
        (c) =>
          c.status === "completed" &&
          c.conclusion !== null &&
          c.conclusion !== "success" &&
          c.conclusion !== "skipped" &&
          c.conclusion !== "neutral",
      );
      if (checks.total_count > 0 && running === 0) {
        if (failed.length > 0) {
          throw new Error(
            `the pull request pipeline answered red: ${failed.map((f) => `${f.name} (${f.conclusion})`).join(", ")}`,
          );
        }
        break;
      }
      if (waited >= 40 * 60 * 1000)
        throw new Error("the pull request pipeline never answered complete within the wait window");
      await sleep(30000);
      waited += 30000;
    }
    console.log("the pull request pipeline answered green");
  }

  const mergePayload = {
    merge_method: "squash",
    commit_title: headline,
    commit_message: body,
  };
  let landed = "";
  try {
    const merged = (await api(
      "PUT",
      `/repos/${slug}/pulls/${pr.number}/merge`,
      mergePayload,
    )) as unknown as MergeResponse;
    if (!merged.merged || !merged.sha) throw new Error(`the squash merge answered ${merged.message}`);
    landed = merged.sha;
  } catch (mergeError) {
    const status = (mergeError as Error & { status?: number }).status;
    if (status === 405) {
      // the base moved under the pull request or the policy refused the
      // merge: one rebase walk answers the diverged case, a second refusal
      // surfaces the policy message untouched.
      mustAt(["fetch", "origin", "main"], "the refetch");
      mustAt(["rebase", "origin/main"], "the rebase walk");
      mustAt(["push", "--force-with-lease", "origin", `refs/heads/${branch}`], "the rebase push");
      const retry = (await api(
        "PUT",
        `/repos/${slug}/pulls/${pr.number}/merge`,
        mergePayload,
      )) as unknown as MergeResponse;
      if (!retry.merged || !retry.sha) throw new Error(`the squash merge retry answered ${retry.message}`);
      landed = retry.sha;
    } else {
      throw mergeError;
    }
  }
  console.log(`the squash landed ${landed} on main`);

  await api("DELETE", `/repos/${slug}/git/refs/heads/${encodeURIComponent(branch)}`).catch((deleteError: unknown) => {
    console.log(`the branch delete answered soft: ${(deleteError as Error).message}`);
  });
  mustAt(["fetch", "--prune", "origin"], "the landed fetch");
  // the main ref moves while the tree still answers the branch (the trees
  // equal, so the switch that follows never rewrites a file on disk), and
  // the mixed reset never runs: a switch to a moved ref with the same tree
  // keeps the landed content and the unstaged leftovers untouched.
  mustAt(["branch", "-f", "main", "origin/main"], "the main advance");
  mustAt(["switch", "main"], "the main switch");
  mustAt(["branch", "-D", branch], "the local branch clear");
  const landedTree = mustAt(["rev-parse", `${landed}^{tree}`], "the landed tree read");
  if (landedTree !== branchTree) {
    throw new Error(`the landed tree ${landedTree} does not equal the staged tree ${branchTree}`);
  }

  const landedView = (await api("GET", `/repos/${slug}/commits/${landed}`)) as unknown as CommitView;
  const verification = landedView.commit.verification;
  if (!verification.verified) {
    throw new Error(`the landed commit ${landed} answers no verified signature: reason ${verification.reason}`);
  }
  console.log(
    `the landing ${landed} carries the github signature: verified ${verification.verified}, reason ${verification.reason}, committer ${landedView.commit.committer?.name ?? "unknown"}`,
  );
  console.log(`the wave is live: https://github.com/${slug}/commit/${landed}`);
};

try {
  await walk();
} catch (landError) {
  console.error(`the signed landing refused: ${(landError as Error).message}`);
  process.exit(1);
}
}
