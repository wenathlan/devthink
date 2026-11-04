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
 * The devfold wave folded the last two riders of the family into their own
 * lanes: the next conversion (the release workflow now runs
 * `node devthink/scripts.ts nextconvert` and tests/publishlanes.test.ts
 * reads this file for the conversion grammar) and the repo.case build each
 * answer the lane check below, which stands in for the direct-entry guard
 * of their standalone era the way the section guard always has.
 *
 * Sections (one banner per source file):
 *   scriptschatbrowserprobe · scriptschatoptinprobe · scriptsdesktopprobe ·
 *   scriptsghauth · nextconvert · repocasebuild ·
 *   scriptsrepocaseharvest · scriptsrepocasemetadata ·
 *   scriptsscaffoldtemplates · scriptssignedlanding
 */
import { execFileSync, spawn, spawnSync } from "node:child_process";
import fs, { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { open } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { pathToFileURL } from "node:url";
import { brotliCompressSync, constants as zlibconstants } from "node:zlib";

/** The lane word every merged script answers: argv[2] names the lane and the
 * dispatcher retires the word before the section runs (the gh auth daemon
 * worker re-enters this file with its own worker mark instead of a lane —
 * the mark never trips the usage gate). */
const scriptslanes = new Set([
  "chatbrowserprobe",
  "chatoptinprobe",
  "desktopprobe",
  "ghauth",
  "nextconvert",
  "repocasebuild",
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
/* section: nextconvert.ts — the automatic Next conversion             */
/* ------------------------------------------------------------------ */
if (scriptslane === "nextconvert") {
// nextconvert.ts — the automatic Next conversion of the family (no app duplicates
// a folder to get a Next version): every site follows the house pattern (no src)
// and this generator publishes in the release assets the complete site archive
// (tar.xz at the maximum xz level with a Brotli quality 11 overlay) plus the FOUR
// Next shapes the owner doctrine fixes: the next normal (the standard template
// with no folder blocking), the next zai (the standard template the Z.AI platform
// accepts, riding the gateway skill and the prisma kit), the next fifty (the same
// standard shape with the forbidden folders blocked and the deploy at the root)
// and the next personalized (no src, the app/ bridge at the root next to the house
// tree). Every shape carries the platform file set at its root (.npmrc, .nvmrc,
// biome, tsconfig, vercel, netlify, wrangler, the dev vars example, the manifest).
// The archives exist only in the release assets; the repository carries only the
// original folder of each application — the tree itself never carries a src/ or
// a Next scaffold for any app, the gateway included.
// Usage: node devthink/scripts.ts nextconvert [version]   (at the monorepo root)
// The version is optional: every application answers its own package.json
// version when the argument is absent (the Family Release lane calls it
// without one), and the explicit argument pins one version for all assets.

const ROOT = process.cwd();
const version: string = process.argv[2] || process.env.VERSION || "";
if (process.argv[2] && !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error("usage: node devthink/scripts.ts nextconvert [version]");
  process.exit(1);
}

// root limit: every resolved path must stay inside the monorepo
const INSIDE = (target: string): string => {
  const r = path.resolve(target);
  if (r !== ROOT && !r.startsWith(ROOT + path.sep)) throw new Error("path outside the monorepo root: " + r);
  return r;
};

// the version of each asset answers the application own package.json (the
// per-application release lines), falling back to the explicit argument
const versionof = (app: string): string => {
  try {
    const answered = String(
      JSON.parse(readFileSync(path.join(INSIDE(path.join(ROOT, app)), "package.json"), "utf8")).version,
    );
    if (/^\d+\.\d+\.\d+$/.test(answered)) return answered;
  } catch {
    /* the fallback below answers */
  }
  if (!version) throw new Error("no version for " + app + ": pass one as the argument");
  return version;
};

// sites in the house pattern (no src): they get the complete archive + the four next shapes
const CONVERT = [
  "devthink",
  "vault",
  "forge",
  "foundry",
  "argan",
  "cadria",
  "cobaia",
  "debonair",
  "saddle",
  "stealthhead",
  "getry",
];

const SKIP = new Set([
  "node_modules",
  ".git",
  "build",
  "release",
  ".next",
  "build",
  "docs",
  "tests",
  ".github",
  "coverage",
]);

const copytree = (from: string, to: string, comlock: boolean) =>
  cpSync(INSIDE(from), INSIDE(to), {
    recursive: true,
    filter: (src: string) => {
      const base = path.basename(src);
      if (SKIP.has(base)) return false;
      if (
        !comlock &&
        ["bun.lock", "bun.lockb", "package-lock.json", "pnpm-lock.yaml", "dev.log", "server.log"].includes(base)
      )
        return false;
      return true;
    },
  });

const themefolder = (root: string): string => {
  const base = path.join(INSIDE(root), "App.tsx");
  if (existsSync(base)) return ".";
  return (
    readdirSync(INSIDE(root)).filter((n: string) => {
      if (!/^[A-Za-z0-9.]+$/.test(n)) return false;
      const p = path.join(INSIDE(root), n);
      return statSync(p).isDirectory() && existsSync(path.join(p, "App.tsx"));
    })[0] || ""
  );
};

const packxz = (dir: string, outxz: string) => {
  const srcdir = INSIDE(dir);
  const dest = INSIDE(outxz);
  const rel = path.relative(srcdir, dest).split(path.sep).join("/");
  // the maximum xz level rides inside the tar: level 9 with --extreme
  execFileSync("tar", ["-cJf", rel, "."], { cwd: srcdir, stdio: "pipe", env: { ...process.env, XZ_OPT: "-9e -T0" } });
  if (!existsSync(dest)) throw new Error("the archive was not generated: " + dest);
  const head = readFileSync(dest).subarray(0, 6).toString("latin1");
  if (!head.startsWith("\u00FD7zXZ\u0000")) throw new Error("the archive is not a valid xz: " + dest);
};

const overlay = (archive: string) => {
  const dest = INSIDE(archive);
  // the Brotli overlay rides on top of the compressed archive, quality 11 (the maximum)
  writeFileSync(
    dest + ".br",
    brotliCompressSync(readFileSync(dest), { params: { [zlibconstants.BROTLI_PARAM_QUALITY]: 11 } }),
  );
};

const platformset = (dir: string, appdir: string) => {
  // the platform file set every next template carries at its root: the registry
  // and engine envelopes (npm, node), the house tooling (biome) and the deploy
  // platform copies (vercel, netlify, cloudflare/wrangler, the dev vars example)
  const sourcenpmrc = path.join(INSIDE(path.join(ROOT, appdir)), ".npmrc");
  if (existsSync(sourcenpmrc)) writeFileSync(path.join(dir, ".npmrc"), readFileSync(sourcenpmrc));
  else
    writeFileSync(
      path.join(dir, ".npmrc"),
      "# the family registry surface\n@wenathlan:registry=https://npm.pkg.github.com\n",
    );
  const sourcenvmrc = path.join(INSIDE(path.join(ROOT, appdir)), ".nvmrc");
  if (existsSync(sourcenvmrc)) writeFileSync(path.join(dir, ".nvmrc"), readFileSync(sourcenvmrc));
  else writeFileSync(path.join(dir, ".nvmrc"), "26.10.0\n");
  writeFileSync(
    path.join(dir, "biome.json"),
    JSON.stringify(
      {
        $schema: "https://biomejs.dev/schemas/2.5.15/schema.json",
        linter: { enabled: true, rules: { recommended: true } },
        organizeImports: { enabled: true },
      },
      null,
      2,
    ),
  );
  writeFileSync(path.join(dir, "vercel.json"), '{\n  "cleanUrls": true\n}\n');
  writeFileSync(path.join(dir, "netlify.toml"), '[build]\n  command = "npm run build"\n  publish = "."\n');
  writeFileSync(
    path.join(dir, "wrangler.toml"),
    `# Cloudflare/Workers config (deploy, bindings, domain routes)\nname = "${appdir}"\ncompatibility_date = "2026-09-01"\n\n[assets]\ndirectory = "."\n`,
  );
  writeFileSync(
    path.join(dir, ".dev.vars.example"),
    "# local wrangler dev secrets (never committed; copy to .dev.vars)\nDEVTHINK_DB_URL=placeholder\nDEVTHINK_RUNNER_TOKEN=placeholder\n",
  );
  writeFileSync(
    path.join(dir, "manifest.json"),
    `{\n  "name": "${appdir}",\n  "short_name": "${appdir}",\n  "start_url": ".",\n  "display": "standalone"\n}\n`,
  );
  writeFileSync(path.join(dir, "robots.txt"), "User-agent: *\nAllow: /\n");
};

const scaffold = (
  appdir: string,
  staging: string,
  theme: string,
  variant: "normal" | "zai" | "fifty" | "personalized",
) => {
  const dir = INSIDE(staging);
  const comsrc = variant !== "personalized";
  const blocked = variant === "fifty" || variant === "personalized";
  const appfolder = comsrc ? INSIDE(path.join(dir, "src", "app")) : INSIDE(path.join(dir, "app"));
  const spec = theme === "." ? (comsrc ? "../../App" : "../App") : comsrc ? `../../${theme}/App` : `../${theme}/App`;
  const deps: Record<string, string> = { next: "^16.0.0", react: "^19.2.0", "react-dom": "^19.2.0" };
  if (variant === "zai") {
    // the zai shape rides the working gateway stack (the getry reference: the
    // database push and the compiled surface the platform button expects)
    deps.prisma = "^7.10.0";
    deps["@prisma/client"] = "^7.10.0";
    deps["@libsql/client"] = "^0.17.4";
  }
  writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify(
      {
        name: `@wenathlan/${appdir}.next.${variant}`,
        private: true,
        version: versionof(appdir),
        scripts: { dev: "next dev", build: "next build", start: "next start" },
        dependencies: deps,
        devDependencies: {
          typescript: "^5.9.0",
          "@types/node": "^26.0.0",
          "@types/react": "^19.2.0",
          "@types/react-dom": "^19.2.0",
        },
      },
      null,
      2,
    ),
  );
  if (blocked) {
    // the blocked shapes answer the house doctrine: no public folder, no dist
    // folder, the build lands at the root and the deploy reads the root
    writeFileSync(
      path.join(dir, "next.config.ts"),
      "import type { NextConfig } from 'next';\n\n// house customizations: no public folder, no dist folder, the build lands at the root\nconst config: NextConfig = {\n  distDir: 'build',\n};\n\nexport default config;\n",
    );
  } else {
    // the unblocked shapes answer the Next defaults: the standard template the
    // platforms accept with no folder blocking at all
    writeFileSync(
      path.join(dir, "next.config.ts"),
      "import type { NextConfig } from 'next';\n\n// the standard template: the Next defaults answer every platform with no folder blocking\nconst config: NextConfig = {};\n\nexport default config;\n",
    );
  }
  writeFileSync(
    path.join(dir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "es2022",
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
          plugins: [{ name: "next" }],
          paths: { "@/*": ["./src/*"] },
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        exclude: ["node_modules"],
      },
      null,
      2,
    ),
  );
  writeFileSync(
    path.join(dir, "next-env.d.ts"),
    '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n',
  );
  writeFileSync(path.join(dir, ".gitignore"), "node_modules/\n.next/\nbuild/\nout/\n.dev.vars\n");
  mkdirSync(appfolder, { recursive: true });
  writeFileSync(
    path.join(appfolder, "layout.tsx"),
    `import type { ReactNode } from 'react';\n\nexport const metadata = { title: '${appdir}', description: '${appdir} — DevThink family' };\n\nexport default function RootLayout({ children }: { children: ReactNode }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}\n`,
  );
  const bridge = `import dynamic from 'next/dynamic';\n\n// the app global anchor (router) lives ${theme === "." ? "at the root" : `in the theme folder ${theme}`}; Next only mounts it\nconst App = dynamic(() => import('${spec}'), { ssr: false });\n\nexport default function Page() {\n  return <App />;\n}\n`;
  writeFileSync(path.join(appfolder, "page.tsx"), bridge);
  const icon =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#g)"/></svg>\n';
  if (blocked) {
    // the blocked shapes keep the icons at the root: no public folder exists
    writeFileSync(path.join(dir, "icon.svg"), icon);
    writeFileSync(
      path.join(dir, "favicon.svg"),
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#7c3aed"/></svg>\n',
    );
  } else {
    // the unblocked shapes carry the standard public folder the platforms expect
    mkdirSync(INSIDE(path.join(dir, "public")), { recursive: true });
    writeFileSync(path.join(dir, "public", "icon.svg"), icon);
    writeFileSync(
      path.join(dir, "public", "favicon.svg"),
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#7c3aed"/></svg>\n',
    );
  }
  if (variant === "zai") {
    // the zai shape rides the working deploy kit: the gateway skill, the prisma
    // schema and the deploy map (the getry reference the platform already deploys);
    // the skill text rides the consolidated docs home since the skills folder
    // left getry docs (the structure law)
    const skilldir = INSIDE(path.join(dir, "skills", "gateway"));
    mkdirSync(skilldir, { recursive: true });
    writeFileSync(
      path.join(skilldir, "SKILL.md"),
      readFileSync(INSIDE(path.join(ROOT, "devthink", "docs", "gateway.md"))),
    );
    mkdirSync(INSIDE(path.join(dir, "prisma")), { recursive: true });
    writeFileSync(
      path.join(dir, "prisma", "schema.prisma"),
      'generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "libsql"\n  url      = env("DEVTHINK_DB_URL")\n}\n',
    );
    writeFileSync(
      path.join(dir, "DEPLOY.md"),
      `# ${appdir} — the four next shapes and the deploy flow\n\nThe release assets carry four next archives of this application. Try them in this order: the next personalized first (the house tree one hundred percent personalized, already in the assets), then this next zai (the standard template the platform accepts with the gateway skill and the prisma kit), then the next fifty (the same shape with the forbidden folders blocked and the deploy at the root) and finally the next normal (the plain standard template). The flow inside the platform: download the archive, extract it with the package.json at the root, push the schema with prisma db push, run the build and press the publish button.\n`,
    );
  }
  const shapedesc: Record<string, string> = {
    normal: "the plain standard template with no folder blocking: the Next defaults answer every platform",
    zai: "the standard template the Z.AI platform accepts, riding the gateway skill and the prisma kit",
    fifty:
      "the standard shape with the forbidden folders blocked (no public, no dist, no assets, no build, no deploy) and the deploy reading the root",
    personalized:
      "the house tree one hundred percent personalized: no src, the app/ bridge at the root beside the theme folder",
  };
  writeFileSync(
    path.join(dir, "README.md"),
    `# ${appdir} — next ${variant}\n\n${shapedesc[variant]}. The whole web surface ${comsrc ? "moves into src/" : "stays at the root"} (the theme folder ${theme === "." ? "at the root" : theme} with its pages and components stays untouched) and the Next scaffold (App Router) mounts the app global anchor. The complete site archive, in the house pattern, travels along in the release assets as ${appdir}.${versionof(appdir)}.tar.xz.\n`,
  );
  platformset(dir, appdir);
};

const out = INSIDE(path.join(ROOT, "release"));
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const workroot = INSIDE(path.join(ROOT, ".nextzips"));
mkdirSync(workroot, { recursive: true });

for (const app of CONVERT) {
  const appdir = INSIDE(path.join(ROOT, app));
  if (!existsSync(appdir)) {
    console.error("missing app: " + app);
    process.exit(1);
  }
  const work = INSIDE(path.join(workroot, app));
  rmSync(work, { recursive: true, force: true });

  // 1. the complete site in the house pattern
  const raw = INSIDE(path.join(work, "site"));
  copytree(appdir, raw, false);
  packxz(raw, INSIDE(path.join(out, `${app}.${versionof(app)}.tar.xz`)));

  // 2. the next normal: the plain standard template with no folder blocking
  const themeof = (stage: string) => themefolder(INSIDE(path.join(stage, "src")));
  const normal = INSIDE(path.join(work, "nextnormal"));
  copytree(appdir, INSIDE(path.join(normal, "src")), false);
  scaffold(app, normal, themeof(normal), "normal");
  packxz(normal, INSIDE(path.join(out, `${app}.next.normal.${versionof(app)}.tar.xz`)));

  // 3. the next zai: the standard template the platform accepts + the deploy kit
  const zai = INSIDE(path.join(work, "nextzai"));
  copytree(appdir, INSIDE(path.join(zai, "src")), false);
  scaffold(app, zai, themeof(zai), "zai");
  packxz(zai, INSIDE(path.join(out, `${app}.next.zai.${versionof(app)}.tar.xz`)));

  // 4. the next fifty: the blocked shape with the deploy reading the root
  const fifty = INSIDE(path.join(work, "nextfifty"));
  copytree(appdir, INSIDE(path.join(fifty, "src")), false);
  scaffold(app, fifty, themeof(fifty), "fifty");
  packxz(fifty, INSIDE(path.join(out, `${app}.next.fifty.${versionof(app)}.tar.xz`)));

  // 5. the next personalized: no src, app/ sits at the root next to the house tree
  const personal = INSIDE(path.join(work, "personalized"));
  copytree(appdir, personal, false);
  scaffold(app, personal, themefolder(personal), "personalized");
  packxz(personal, INSIDE(path.join(out, `${app}.next.personalized.${versionof(app)}.tar.xz`)));
  console.log(
    `${app}: site + next.normal + next.zai + next.fifty + next.personalized (theme: ${themeof(normal) || "none"})`,
  );
}

// the Brotli overlay rides on top of every compressed archive
for (const file of readdirSync(out)) if (file.endsWith(".tar.xz")) overlay(INSIDE(path.join(out, file)));

rmSync(workroot, { recursive: true, force: true });
console.log("conversion complete: " + readdirSync(out).join(", "));
}

/* ------------------------------------------------------------------ */
/* section: repocasebuild.ts — the repo.case build                     */
/* ------------------------------------------------------------------ */
if (scriptslane === "repocasebuild") {
// repocasebuild.ts — repo.case build. categorizes every harvested package
// with a scored keyword ruleset, merges the sub agent review fixes and
// assembles the repo.case.md document. two modes: review emits the batches
// for the sub agent waves, build writes the final document. plain esm
// typescript on node, zero external dependencies.
// usage: node devthink/scripts.ts repocasebuild --mode review|build --meta meta.json --out repo.case.md [--outdir dir] [--fixdir dir]

/** One parsed registry or harvest json value: the documents carry arbitrary shapes. */
type jsonrecord = Record<string, any>;

/** The command line options the argv walk answers, keyed by its flag name. */
function parseArgs(argv: string[]): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (let i = 2; i < argv.length; i += 2) {
    const key = String(argv[i]).replace(/^--/, '');
    out[key] = argv[i + 1];
  }
  return out;
}

const opts = parseArgs(process.argv);
const mode = opts.mode || 'build';

const CATEGORIES: Record<string, string> = {
  'ai and llm': 'packages for models, agents, inference, embeddings and prompt work.',
  'api and graphql': 'packages for api schemas, graphql, grpc and rpc contracts.',
  'audio and music': 'packages for audio, speech, synthesis and music work.',
  'build and bundlers': 'packages that bundle, transpile for output and serve the development loop.',
  'ci and deployment': 'packages for pipelines, containers, packaging and deploy targets.',
  'cli and dev tools': 'packages for command line tooling and the developer experience.',
  'cloud and infrastructure': 'packages for cloud platforms, edge runtimes and hosted services.',
  'crypto': 'packages for hashing, signing and cryptographic primitives.',
  'database and orm': 'packages for storage engines, sql, orm and query building.',
  'documents and text': 'packages for markdown, pdf, docx, i18n and text processing.',
  '3d and graphics': 'packages for webgl, three dimensional scenes and game graphics.',
  'git and release': 'packages for version control, changelogs and release automation.',
  'go and systems': 'go modules for systems work and tooling.',
  'images and media': 'packages for image and video processing.',
  'language and compile': 'packages for languages, types, transpilers, wasm and native binding.',
  'monitoring and logging': 'packages for logs, traces, metrics and error tracking.',
  'networking and http': 'packages for http clients, websockets, dns and proxying.',
  'python tooling': 'packages for the python runtime, packaging and environments.',
  'rust and systems': 'crates for systems work, memory, async runtime and native binding.',
  'science and data': 'packages for math, statistics, plotting and dataframe work.',
  'security and auth': 'packages for authentication, authorization and secrets.',
  'state and data': 'packages for state management and data fetching.',
  'styling and design': 'packages for css engines, fonts and visual systems.',
  'test and quality': 'packages for testing, linting, formatting and coverage.',
  'ui components': 'packages of interface components, icons and widgets.',
  'uncategorized': 'entries kept for completeness, classification still pending.',
  'utilities': 'general purpose helpers and small libraries.',
  'validation and schema': 'packages for schema validation, parsing and coercion.',
  'web framework and server': 'packages that render pages or serve http.'
};

const CAT_ALIASES: Record<string, string> = {
  ai: 'ai and llm', llm: 'ai and llm', 'ai and llm': 'ai and llm',
  db: 'database and orm', database: 'database and orm', 'database and orm': 'database and orm',
  ui: 'ui components', components: 'ui components', 'ui components': 'ui components',
  styling: 'styling and design', css: 'styling and design', 'styling and design': 'styling and design',
  state: 'state and data', 'state and data': 'state and data',
  web: 'web framework and server', server: 'web framework and server', 'web framework and server': 'web framework and server',
  api: 'api and graphql', graphql: 'api and graphql', 'api and graphql': 'api and graphql',
  network: 'networking and http', networking: 'networking and http', 'networking and http': 'networking and http',
  build: 'build and bundlers', bundler: 'build and bundlers', 'build and bundlers': 'build and bundlers',
  language: 'language and compile', compile: 'language and compile', 'language and compile': 'language and compile',
  test: 'test and quality', quality: 'test and quality', 'test and quality': 'test and quality',
  cli: 'cli and dev tools', devtools: 'cli and dev tools', 'cli and dev tools': 'cli and dev tools',
  git: 'git and release', release: 'git and release', 'git and release': 'git and release',
  ci: 'ci and deployment', deploy: 'ci and deployment', 'ci and deployment': 'ci and deployment',
  cloud: 'cloud and infrastructure', infra: 'cloud and infrastructure', 'cloud and infrastructure': 'cloud and infrastructure',
  auth: 'security and auth', security: 'security and auth', 'security and auth': 'security and auth',
  crypto: 'crypto',
  validation: 'validation and schema', schema: 'validation and schema', 'validation and schema': 'validation and schema',
  docs: 'documents and text', text: 'documents and text', 'documents and text': 'documents and text',
  media: 'images and media', images: 'images and media', video: 'images and media', 'images and media': 'images and media',
  audio: 'audio and music', 'audio and music': 'audio and music',
  graphics: '3d and graphics', '3d': '3d and graphics', game: '3d and graphics', '3d and graphics': '3d and graphics',
  science: 'science and data', math: 'science and data', data: 'science and data', 'science and data': 'science and data',
  monitoring: 'monitoring and logging', logging: 'monitoring and logging', 'monitoring and logging': 'monitoring and logging',
  python: 'python tooling', 'python tooling': 'python tooling',
  rust: 'rust and systems', 'rust and systems': 'rust and systems',
  go: 'go and systems', 'go and systems': 'go and systems',
  utils: 'utilities', utility: 'utilities', utilities: 'utilities',
  uncategorized: 'uncategorized', unknown: 'uncategorized', none: 'uncategorized'
};

/** Canonicalizes one raw category answer onto its catalog category, or null when no alias matches. */
function canonCat(raw: unknown): string | null {
  if (!raw) return null;
  const k = String(raw).trim().toLowerCase().replace(/\s+/g, ' ');
  if (CAT_ALIASES[k]) return CAT_ALIASES[k];
  for (const [alias, cat] of Object.entries(CAT_ALIASES)) {
    if (k === alias || k.includes(alias)) return cat;
  }
  return null;
}

/* scored rules. name regex hits weigh 3, use and keyword hits weigh 2. */
const SCOPE_OVERRIDES: Array<{ cat: string; res: RegExp[] }> = [
  { cat: 'cloud and infrastructure', res: [/^@azure\//, /^@azure-rest\//, /^@aws-amplify\//, /^@aws-crypto\//, /^@aws-sdk\//, /^@aws-amplify/, /^@google-cloud\//, /^@googleapis\//, /^@grpc\//, /^@stripe\//, /^@paypal\//, /^@square\//, /^@braintree\//, /^@plaid\//, /^@dwolla\//, /^@razorpay\//, /^@checkout\//, /^@twilio\//, /^@sendgrid\//, /^@mailgun\//, /^@vonage\//, /^@bandwidth\//, /^@plivo\//, /^@messagebird\//, /^@resend\//, /^@shopify\//, /^@contentful\//, /^@sanity\//, /^@strapi\//, /^@algolia\//, /^@typesense\//, /^@meilisearch\//, /^@uploadcare\//, /^@imgix\//, /^@cloudinary\//, /^@fastly\//, /^@sentry\//, /^@opentelemetry\//, /^@datadog\//, /^@newrelic\//, /^@launchdarkly\//, /^@statsig\//, /^@posthog\//, /^@amplitude\//, /^@mux\//, /^@mux-stats\//, /^@mux-node\//, /^@cloudflare\//, /^@netlify\//, /^@vercel\//, /^@railway\//, /^@flydotio\//, /^@temporalio\//, /^@upstash\//, /^@neondatabase\//, /^@planetscale\//, /^@supabase\//, /^@xata\//, /^@cofeenet\//, /^@devcycle\//] },
  { cat: 'test and quality', res: [/^@ava\//, /^@vitest\//, /^@jest\//, /^@testing-library\//, /^@playwright\//, /^@cypress\//, /^@puppeteer\//, /^@testing-library$/, /^@testing-library\b/, /^@vitest\b/, /^@biomejs\//, /^@eslint\//, /^@typescript-eslint\//, /^@commitlint\//, /^@semantic-release\//, /^@sinonjs\//, /^@faker-js\//, /^@mswjs\//, /^@happy-dom\//, /^@testing-library\//] },
  { cat: 'ci and deployment', res: [/^@bazel\//, /^@electron-forge\//, /^@electron\/get/, /^@electron\/notarize/, /^@electron\/osx-sign/, /^@capacitor\//, /^@tauri-apps\//, /^@tauri-apps\/cli/, /^@nx\//, /^@lerna\//, /^@electron\//, /^@sentry-?electron/, /^@electron-builder$/, /^@appimage/, /^@github\/actions/, /^@actions\//] },
  { cat: 'ai and llm', res: [/^@ai-sdk\//, /^@anthropic-ai\//, /^@langchain\//, /^@langchain-core\//, /^@huggingface\//, /^@mistralai\//, /^@google\/generative/, /^@google-ai\//, /^@xenova\//, /^@coze\//, /^@llamaindex\//, /^@openrouter\//, /^@litellm\//, /^@vercel\/ai/, /^@lifi\//, /^@portkey-ai\//, /^@helicone\//, /^@langfuse\//, /^@braintrust\//, /^@wundergraph\//] },
  { cat: 'database and orm', res: [/^@prisma\//, /^@libsql\//, /^@mongodb\//, /^@mongodb-js\//, /^@ redis\//, /^@nestjs\//, /^@trpc\//, /^@comp3064\//, /^@electric-sql\//, /^@sqlite\//, /^@ng-stack\//, /^@storeon\//, /^@data-proxy\//, /^@xata\//, /^@directus\//, /^@apollo\//] },
  { cat: 'ui components', res: [/^@radix-ui\//, /^@base-ui\//, /^@headlessui\//, /^@ark-ui\//, /^@kobalte\//, /^@zag-js\//, /^@react-aria\//, /^@fluentui\//, /^@heroui\//, /^@nextui\//, /^@mui\//, /^@chakra-ui\//, /^@ark-?ui\//, /^@mantine\//, /^@arkins\//, /^@reka\//, /^@shadcn\//, /^@base-ui-components\//, /^@ant-design\//, /^@ant-designicons\//, /^@wordpress\//, /^@shopify\/polaris\//, /^@carbon\//, /^@primer\//, /^@primer-?react\//, /^@dnd-kit\//, /^@floating-ui\//, /^@radix-ui\//, /^@fontawesome\//, /^@fortawesome\//, /^@tabler\//, /^@lucide\//, /^@phosphor\//, /^@heroicons\//, /^@iconify\//, /^@walletconnect\//, /^@dnd-kit\b/, /^@react-three\//, /^@tanstack\/table/, /^@tanstack\/table-devtools/, /^@tanstack\/virtual/, /^@tanstack\/form/, /^@ark-ui\//, /^@sveltejs\//, /^@melt-ui\//, /^bits-ui\//, /^@stackblitz\//, /^@codesandbox\//, /^@rrwatch\//] },
  { cat: 'styling and design', res: [/^@tailwindcss\//, /^@fontsource\//, /^@emotion\//, /^@vanilla-extract\//, /^@stitches\//, /^@pandacss\//, /^@stylelint\//, /^@unocss\//, /^@windicss\//, /^@twind\//, /^@linaria\//, /^@griffel\//] },
  { cat: 'state and data', res: [/^@tanstack\//, /^@reduxjs\//, /^@effector\//, /^@xstate\//, /^@vueuse\//, /^@tanstack\/query/, /^@tanstack\/store/, /^@signal\//, /^@preact\/signals/, /^@vue\/reactivity/, /^@builder.io\/qwik/, /^@nx\//] },
  { cat: 'web framework and server', res: [/^@sveltejs\//, /^@remix-run\//, /^@nestjs\//, /^@adonisjs\//, /^@nuxt\//, /^@vue\//, /^@angular\//, /^@angular\//, /^@solidjs\//, /^@preact\//, /^@hono\//, /^@fastify\//, /^@koa\//, /^@hapi\//, /^@nestjs\//, /^@builder.io\//, /^@qwik\//, /^@marko\//, /^@malloydata\//, /^@gatsbyjs\//, /^@remix-run\//] },
  { cat: 'api and graphql', res: [/^@graphql\//, /^@graphql-codegen\//, /^@apollo\//, /^@urql\//, /^@bufbuild\//, /^@protobufs\//, /^@buf\//, /^@protobuf-ts\//, /^@grpc\//, /^@trpc\//, /^@openapitools\//, /^@smithy\//, /^@swagger-api\//, /^@rtk-query\//] },
  { cat: 'language and compile', res: [/^@types\//, /^@tsconfig\//, /^@swc\//, /^@swc-node\//, /^@babel\//, /^@babeljs\//, /^@jridgewell\//, /^@napi-rs\//, /^@node-rs\//, /^@emnapi\//, /^@rollup\//, /^@rollupplugin\//, /^@rollup\//, /^@wasm-tool\//, /^@wasmer\//, /^@as-?emscripten\//, /^@assemblyscript\//, /^@rspack\//, /^@rsbuild\//, /^@vitejs\//, /^@vitest\//, /^@oxc\//, /^@typhonius\//] },
  { cat: 'build and bundlers', res: [/^@vitejs\//, /^@rspack\//, /^@rsbuild\//, /^@rollup\//, /^@webpack\//, /^@parcel\//, /^@web\//, /^@pmmmwh\//, /^@craco\//, /^@react-native-community\//, /^@docusaurus\//, /^@farmfe\//, /^@rslib\//, /^@module-federation\//] },
  { cat: 'monitoring and logging', res: [/^@sentry\//, /^@opentelemetry\//, /^@logtail\//, /^@datadog\//, /^@newrelic\//, /^@honeycomb\//, /^@posthog\//, /^@wessberg\//, /^@uiw\//, /^@highlight-?io\//, /^@logrocket\//, /^@highlight\//, /^@sentry-?browser/, /^@sentry-?node/, /^@sentry-?react/, /^@sentry-?nextjs/, /^@grafana\//, /^@prometheus\//] },
  { cat: 'security and auth', res: [/^@auth\//, /^@auth0\//, /^@nextauth\//, /^@lucia-auth\//, /^@better-auth\//, /^@clerk\//, /^@workos\//, /^@stytch\//, /^@privy-io\//, /^@casl\//, /^@casbin\//, /^@permitio\//, /^@cerbos\//, /^@spruceid\//, /^@web3-?auth\//, /^@walletconnect\//, /^@magic-sdk\//] },
  { cat: 'crypto', res: [/^@noble\//, /^@ethers\//, /^@metamask\//, /^@wagmi\//, /^@wagmi\/core/, /^@rainbow-me\//, /^@solana\//, /^@solana-web3\//, /^@cosmostation\//, /^@keplr\//, /^@ledgerhq\//, /^@trezor\//, /^@taquito\//, /^@elrond\//, /^@harmony\//, /^@avalanche\//, /^@polkadot\//, /^@cosmos\//, /^@binance\//, /^@coinbase\//, /^@0x\//, /^@uniswap\//, /^@airswap\//, /^@0xcert\//, /^@zkprotocol\//] },
  { cat: 'cli and dev tools', res: [/^@clack\//, /^@inquirer\//, /^@npmcli\//, /^@yarnpkg\//, /^@pnpm\//, /^@sindresorhus\//, /^@commitlint\//, /^@electron\//, /^@vue\//, /^@angular\//, /^@ionic\//, /^@expo\//, /^@nx\//, /^@moonrepo\//, /^@turbo\//, /^@vercel\//, /^@remix-run\//, /^@storybook\//, /^@ladle\//, /^@histoire\//, /^@vitest\//, /^@playwright\//, /^@testing-library\//, /^@npmcli\//] },
  { cat: 'git and release', res: [/^@octokit\//, /^@github\//, /^@gitbeaker\//, /^@changesets\//, /^@changeset\//, /^@semantic-release\//, /^@commitlint\//, /^@npmcli\//, /^@evocateur\//, /^@novnc\//] },
  { cat: 'documents and text', res: [/^@mdx-js\//, /^@remix-run\//, /^@wooorm\//, /^@micromark\//, /^@syntax-tree\//, /^@unifiedjs\//, /^@rehypejs\//, /^@remarkjs\//, /^@textlint\//, /^@cspell\//, /^@microsoft\/tsdoc/, /^@discordjs\//, /^@discordjs\/docgen/, /^@lisanjs\//, /^@formatjs\//, /^@lingui\//, /^@fluent\//, /^@i18next\//, /^@vue-i18n\//, /^@tolgee\//, /^@tolgee\//, /^@locize\//] }
];

/** Answers the scope override category one scoped package name hits, or null. */
function scopeCategory(name: string): string | null {
  for (const o of SCOPE_OVERRIDES) {
    for (const re of o.res) {
      if (re.test(name)) return o.cat;
    }
  }
  return null;
}

const RULES: Array<{ cat: string; name: RegExp[]; text: RegExp[] }> = [
  { cat: 'ai and llm', name: [/^@ai-sdk\//, /^@anthropic-ai\//, /^@langchain\//, /^@huggingface\//, /^@mistralio\//, /^@xenova\//, /^@google\/generative/, /^@google-ai/, /^llamaindex/i, /^langchain/i, /^ollama/i, /^openai/i, /^tiktoken/i, /^onnx/i, /^transformers/i, /^tokenizers\b/i, /llm/i, /\bgpt\b/i, /embedding/i, /huggingface/i, /stable-diffusion/i, /whisper\b/i, /text-to-speech/i, /\bspeech\b/i, /machine-learning/i, /^ai\b/i, /(^|[-_.])ai([-_.]|$)/i, /autogen/i, /crewai/i, /llama-cpp/i, /vllm/i, /agent-?memory/i, /react-?agent/i, /browser-?use/i, /semantic-?kernel/i, /haystack/i, /diffusers/i, /pytorch/i, /^torch\b/i, /tensorflow/i, /^keras\b/i, /scikit-learn/i, /sklearn/i, /jupyter/i, /ipython/i, /kubernetes-ai/i, /copilot/i, /chatbot/i, /chat-?ui/i, /ai-?sdk/i, /ai-?cli/i, /openrouter/i, /litellm/i, /portkey/i, /helicone/i, /langfuse/i, /braintrust/i, /weaviate/i, /qdrant/i, /pinecone/i, /chromadb/i, /milvus/i, /faiss/i, /pgvector/i, /sqlchat/i, /guardrails/i, /ragflow/i, /dify/i, /flowise/i, /comfyui/i, /fooocus/i, /automatic1111/i],
    text: [/large language model/i, /\bllm\b/i, /\bopenai\b/i, /anthropic/i, /machine learning/i, /artificial intelligence/i, /neural network/i, /inference/i, /embedding/i, /vector (search|database|store)/i, /chatbot/i, /text.to.speech/i, /speech recognition/i, /image generation/i, /transformer model/i, /question answering/i, /hugging face/i, /diffusion model/i, /agent framework/i, /language model/i, /prompt/i, /tokeniz/i] },
  { cat: 'database and orm', name: [/^@prisma\//, /^@libsql\//, /^@neondatabase\//, /^@supabase\//, /^@mongodb\//, /prisma/i, /drizzle/i, /^knex\b/i, /kysely/i, /typeorm/i, /sequelize/i, /mongoose\b/i, /^sqlite/i, /sqlite/i, /postgres/i, /^pg\b/i, /^mysql/i, /mariadb/i, /^redis/i, /^ioredis/i, /mongodb/i, /influxdb/i, /clickhouse/i, /couchdb/i, /duckdb/i, /^realm\b/i, /slick\b/i, /exposed\b/i, /sqlx\b/i, /diesel\b/i, /sea-?orm/i, /tiberius\b/i, /odbc/i, /^db\b/i, /database/i, /migrations?\b/i, /^umzug\b/i, /knex/i, /schema-?push/i, /pglite/i, /postgres\.js/i, /postgres-js/i, /slonik/i, /massive\.js/i, /bookshelf/i, /objection/i, /waterline/i, /lowdb/i, /^nedb\b/i, /rxdb/i, /pouchdb/i, /memsql/i, /timescale/i, /yugabyte/i, /vitess/i, /cassandra/i, /scylla/i, /neo4j/i, /arangodb/i, /foundationdb/i, /rocksdb/i, /leveldb/i, /lmdb\b/i, /^h2\b/i, /^hsql/i, /^derby\b/i, /^firebird/i, /^sqlcipher/i, /linq2db/i, /quill\b/i, /areldb/i],
    text: [/object relational mapping/i, /\borm\b/i, /sql (driver|query|database|client)/i, /database (driver|client|migration)/i, /sqlite/i, /postgres/i, /mysql/i, /mongodb/i, /redis client/i, /query builder/i, /migration tool/i, /connection pool/i] },
  { cat: 'ui components', name: [/^@radix-ui\//, /^@base-ui\//, /^@headlessui\//, /^@ark-ui\//, /^@kobalte\//, /^zag-js\//, /^react-aria\//, /^@react-aria\//, /^fluentui/i, /^winui/i, /^@heroui\//, /^@nextui\//, /^ant-?design/i, /^@mui\//, /^material-ui/i, /^@chakra-ui\//, /^mantine/i, /^@ark-ui/i, /-icons?$/i, /^lucide/i, /^heroicons/i, /^phosphor/i, /^tabler-?icons/i, /^feather-?icons/i, /^remixicon/i, /^iconify/i, /^@fontawesome/i, /^@fortawesome/i, /icons\b/i, /^shadcn/i, /^reka/i, /^@arkins/i, /component/i, /components\b/i, /^@dnd-kit\//, /^react-?window/i, /^react-?virtualized/i, /^react-?virtual/i, /^react-?table/i, /^@tanstack\/.*table/i, /^react-?calendar/i, /^react-?-datepicker/i, /^react-?select/i, /^react-?modal/i, /^react-?toast/i, /^react-?tooltip/i, /^react-?tabs/i, /^react-?accordion/i, /^react-?carousel/i, /^react-?flow/i, /^reactflow/i, /^react-?dropzone/i, /^react-?color/i, /^react-?colorful/i, /^react-?spinner/i, /^react-?pagination/i, /^react-?rating/i, /^react-?avatar/i, /^react-?hook-?form/i, /^@hookform\//, /^floating-ui/i, /^popper\.js/i, /^tippy/i, /^sweetalert/i, /^notiflix/i, /^react-hot-toast/i, /^sonner\b/i, /^vaul\b/i, /^cmdk\b/i, /^react-?cmdk/i, /^embla/i, /^swiper\b/i, /^keen-slider/i, /^glide\b/i, /^slick-?carousel/i, /^flickity/i, /^lottie/i, /^rive\b/i, /^framer-?motion/i, /^motion\b/i, /^react-spring/i, /^react-?transition/i, /^auto-?animate/i, /^animat/i, /^gsap/i, /^animejs/i, /^velocity-?js/i, /^scrollreveal/i, /^aos\b/i, /^react-?focus/i, /^react-?rangepicker/i, /^react-?day/i, /^react-?big/i, /^react-?calendar/i, /^fullcalendar/i, /^tui-?calendar/i, /^devextreme/i, /^devexpress/i, /^syncfusion/i, /^kendo/i, /^ag-grid/i, /^handsontable/i, /^tabulator/i, /^datagrid/i, /^data-?grid/i, /^react-?data-?grid/i, /^virtual-?grid/i, /^window-?manager/i, /^dockview/i, /^react-?resizable/i, /^react-?rnd/i, /^re-resizable/i, /^react-grid/i, /^golden-?layout/i, /^react-?dock/i, /^rc-?-/i, /^resize-?observer/i, /^react-?split/i, /^allotment/i, /^react-?pannable/i, /^react-zoom/i, /^react-?crop/i, /^react-?image-?crop/i, /^react-?photoswipe/i, /^photoswipe/i, /^yet-another-react-lightbox/i, /^react-?viewer/i, /^react-?lightbox/i, /^react-?carousel/i, /^keen-ui/i, /^vue-?datepicker/i, /^svelte-?ui/i, /^bits-ui/i, /^shadcn-?svelte/i, /^carbon-?components/i, /^@carbon/i, /^patternfly/i, /^primer-?react/i, /^@primer\//, /^evergreen/i, /^grommet/i, /^rebass/i, /^reakit/i, /^radix\b/i, /^react-?strap/i, /^reactstrap/i, /^bootstrap/i, /^bulma/i, /^tailwindcss-?ui/i, /^headlessui/i, /^react-?aria/i, /^react-?scroll-?area/i, /^cmdk/i, /^react-?combobox/i, /^react-?autocomplete/i, /^downshift/i, /^react-?select/i, /^virtua\b/i, /^tanstack\/virtual/i],
    text: [/react component/i, /ui component/i, /headless ui/i, /component library/i, /icon (set|library|pack)/i, /accessible component/i, /design system component/i, /date ?picker component/i, /carousel/i, /tooltip/i, /modal component/i, /drag and drop/i, /virtual (list|scroll|grid)/i, /virtualized list/i] },
  { cat: 'styling and design', name: [/tailwind/i, /^postcss/i, /^postcss-/i, /^sass\b/i, /^node-sass/i, /^less\b/i, /^stylus/i, /^css-?nano/i, /^css-?what/i, /^css-?tree/i, /^css-?select/i, /^css-?declarations/i, /^css-?loader/i, /^css-?modules/i, /^css-?types/i, /^@emotion/i, /^styled-components/i, /^stitches/i, /^vanilla-extract/i, /^linaria/i, /^goober/i, /^treat\b/i, /^fontsource/i, /^@fontsource/i, /-font$/i, /font\b/i, /^typeface/i, /^google-?fonts/i, /^mdi-?font/i, /^modern-?font/i, /^css-/i, /^autoprefixer/i, /^pleeease/i, /^clean-css/i, /^optimize-css/i, /^css-hot/i, /^mini-css/i, /^ purgecss/i, /^purgecss/i, /^uncss/i, /^ CriticalCSS/i, /^critters\b/i, /^bezier-?easing/i, /^easing-/i, /^@react-spring/i, /^spring-?fn/i, /^stylelint/i, /^style-?lint/i, /^csstype/i, /^tw-?merge/i, /^tailwind-merge/i, /^clsx\b/i, /^classnames\b/i, /^class-?names/i, /^cva\b/i, /^class-variance-authority/i, /^radix-?colors/i, /^open-?color/i, /^color-?palette/i, /^palettable/i, /^chroma-?js/i, /^tinycolor/i, /^color-?convert/i, /^color-?string/i, /^color-?name/i, /^randomcolor/i, /^nice-color/i, /^colorthief/i, /^gradient/i, /^css-?gradient/i, /^loading-?css/i, /^modern-?css/i, /^winbox/i, /^@\w+\/tailwind/i, /^spectre/i, /^milligram/i, /^picnic/i, /^water.css/i, /^normalize.css/i, /^modern-normalize/i, /^ress\b/i, /^sanitize.css/i, /^flexboxgrid/i, /^bulma/i, /^picnic.css/i, /^pico/i, /^tacit/i, /^water.css/i, /^spcss/i, /^axist/i, /^yles\b/i, /^figma-?css/i, /^cssfg/i],
    text: [/tailwind/i, /css (pre)?processor/i, /css-in-js/i, /styling/i, /web font/i, /font family/i, /color (palette|picker|conversion)/i, /design tokens/i, /media queries/i] },
  { cat: 'state and data', name: [/^zustand\b/i, /^redux\b/i, /^react-redux/i, /^@reduxjs/i, /^mobx\b/i, /^mobx-?react/i, /^jotai\b/i, /^valtio\b/i, /^immer\b/i, /^final-?form/i, /^react-?query/i, /^@tanstack\/.*query/i, /^swr\b/i, /^apollo-?client/i, /^urql\b/i, /^@urql\//i, /^react-?relay/i, /^relay-?runtime/i, /^overmind/i, /^effector/i, /^atom/i, /^xstate/i, /^@xstate\//i, /^mobx-state-tree/i, /^immerable/i, /^zustand/i, /^react-?hooks/i, /^ahooks\b/i, /^@uidotdev\/usehooks/i, /^usehooks/i, /^react-use/i, /^beautiful-react-hooks/i, /^react-hook-/i, /^recoil\b/i, /^flux\b/i, /^reflux\b/i, /^veaux\b/i, /^react-?context/i, /^unstated/i, /^easy-peasy/i, /^rematch/i, /^dva\b/i, /^k-redux-factory/i, /^redux-?saga/i, /^redux-?observable/i, /^redux-?toolkit/i, /^react-?fetching-library/i, /^@tanstack\/query/i, /^@tanstack\/react-query/i, /^@tanstack\/solid-query/i, /^@tanstack\/svelte-query/i, /^@tanstack\/vue-query/i, /^@tanstack\/angular-query/i, /^svelte-?store/i, /^valoo\b/i, /^nanostores/i, /^@nanostores/i, /^pinia\b/i, /^vuex\b/i, /^valtico/i, /^reactive/i, /^vue-?use/i, /^@vueuse/i, /^rxjs\b/i, /^@reactivex/i, /^rxjs-?observables/i, /^baconjs/i, /^kefir/i, /^most\b/i, /^xstream/i, /^cycle-?js/i, /^wonka\b/i, /^effection/i],
    text: [/state management/i, /data fetching/i, /react hooks/i, /observable stream/i, /reactive state/i, /form state/i, /client cache/i, /server state/i] },
  { cat: 'web framework and server', name: [/^next\b/i, /^next-?/i, /^react\b/i, /^react-dom$/i, /^react-?dom/i, /^react-?server/i, /^react-?error/i, /^vue\b/i, /^@vue\//i, /^svelte\b/i, /^solid-?js/i, /^solid-js$/i, /^preact\b/i, /^preact-?/i, /^angular\b/i, /^@angular\//i, /^@sveltejs\//i, /^astro\b/i, /^nuxt\b/i, /^nuxt-?/i, /^remix\b/i, /^@remix-run\//i, /^gatsby\b/i, /^docusaurus\b/i, /^vitepress/i, /^rspress\b/i, /^press-?kit/i, /^express\b/i, /^@hono\//i, /^hono\b/i, /^fastify\b/i, /^fastify-?/i, /^koa\b/i, /^koa-?/i, /^@fastify\//i, /^@koa\//i, /^hapi\b/i, /^@hapi\//i, /^restify\b/i, /^polka\b/i, /^tinyhttp/i, /^wundergraph/i, /^trpc\b/i, /^@trpc\//i, /^socket-?app/i, /^bun-?serve/i, /^srvx\b/i, /^@tanstack\/start/i, /^hattip/i, /^@hattip/i, /^itty-?router/i, /^h3\b/i, /^unjs\//i, /^ofetch\b/i, /^ohmyfetch/i, /^nitropack/i, /^nitro-?/i, /^sirv\b/i, /^serve-?static/i, /^finalhandler/i, /^connect\b/i, /^compression\b/i, /^cors\b/i, /^body-?parser/i, /^multer\b/i, /^cookie-?parser/i, /^cookie\b/i, /^cookies\b/i, /^session\b/i, /^express-?session/i, /^@nestjs\//i, /^nest-?/i, /^adonis/i, /^@adonisjs\//i, /^lumen/i, /^laravel/i, /^symfony/i, /^django/i, /^flask/i, /^fastapi/i, /^starlette/i, /^uvicorn/i, /^gunicorn/i, /^sanic\b/i, /^tornado/i, /^bottle\b/i, /^cherrypy/i, /^pyramid/i, /^rails\b/i, /^rack\b/i, /^sinatra/i, /^roda\b/i, /^hanami/i, /^phoenix\b/i, /^plug\b/i, /^cowboy\b/i, /^actix/i, /^axum\b/i, /^rocket\b/i, /^warp\b/i, /^poem-?openapi/i, /^salvo\b/i, /^ntex\b/i, /^tide\b/i, /^go-?chi/i, /^chi\b/i, /^gin-?gonic/i, /^echo\b/i, /^fiber\b/i, /^iris\b/i, /^beego/i, /^mux\b/i, /^gorilla\//i, /^uadmin/i, /^ WOW/i],
    text: [/web framework/i, /http server/i, /react runtime/i, /ui framework/i, /application framework/i, /server framework/i, /minimalist web/i, /node.js framework/i, /micro (web )?framework/i] },
  { cat: 'api and graphql', name: [/graphql/i, /^apollo-?server/i, /^@apollo\//i, /^graphql-?/i, /^graphiql/i, /^relay-?compiler/i, /^@graphql\//i, /^gql\b/i, /^urql\b/i, /^openapi/i, /^swagger/i, /^@openapi/i, /^grpc\b/i, /^@grpc\//i, /^protobuf/i, /^proto-loader/i, /^jsonrpc/i, /^json-?rpc/i, /^xmlrpc/i, /^soap\b/i, /^wsdl/i, /^tsoa\b/i, /^routing-?controllers/i, /^openapi-?types/i, /^zod-?to-?openapi/i, /^@anatine\//i, /^trpc\b/i, /^@trpc\//i, /^merge-?graphql/i, /^graphql-tools/i, /^envelop\b/i, /^pothos\b/i, /^giraphql/i, /^nexus\b/i, /^graphql-?codegen/i, /^@graphql-codegen\//i, /^hasura\b/i, /^postgraphile/i, /^pg-?graphql/i, /^supergraph/i, /^federation/i, /^@apollo\/federation/i, /^typer/i, /^fastapi-?/i, /^flask-?rest/i, /^django-?rest/i, /^djangorestframework/i, /^marshmallow/i, /^flask-smorest/i, /^apispec/i, /^hug\b/i, /^falcon\b/i, /^eve\b/i, /^connexion/i, /^openapi-core/i, /^spectree/i, /^fastapi-?utils/i],
    text: [/graphql/i, /openapi/i, /swagger/i, /json-?rpc/i, /api schema/i, /schema-first api/i, /rest api framework/i, /rpc framework/i, /protocol buffers/i] },
  { cat: 'networking and http', name: [/^axios\b/i, /^node-fetch/i, /^got\b/i, /^request\b/i, /^undici\b/i, /^@ whatwg/i, /^cross-fetch/i, /^isomorphic-(fetch|git)/i, /^fetch-?/i, /^make-fetch-happen/i, /^cacheable-?request/i, /^http-?proxy/i, /^https-?proxy/i, /^proxy-?agent/i, /^tunnel-?agent/i, /^socks/i, /^socks-proxy/i, /^ws\b/i, /^websocket/i, /^websocket-?/i, /^@websockets\//i, /^socket-?io/i, /^engine-?io/i, /^socket\.io/i, /^dns\b/i, /^dns-?/i, /^@grpc\//i, /^net\b/i, /^tcp-?/i, /^udp-?/i, /^mqtt/i, /^amqp/i, /^kafkajs/i, /^kafka\b/i, /^nats\b/i, /^zeromq/i, /^zmq\b/i, /^rabbitmq/i, /^bullmq/i, /^bull\b/i, /^bee-?queue/i, /^ioredis/i, /^redis\b/i, /^form-data/i, /^follow-redirects/i, /^retry-?/i, /^p-retry/i, /^got-?retry/i, /^superagent/i, /^bent\b/i, /^needle\b/i, /^urllib\b/i, /^hyperquest/i, /^httpie/i, /^wreck\b/i, /^http-?client/i, /^ip\b/i, /^ipaddr/i, /^netmask/i, /^macaddress/i, /^public-?ip/i, /^internal-?ip/i, /^network-?/i, /^net-?/i, /^ping\b/i, /^traceroute/i, /^whois\b/i, /^portfinder/i, /^get-port/i, /^tcp-?ping/i, /^sticky-?session/i, /^round-?robin/i, /^load-?balanc/i, /^haproxy/i, /^nginx\b/i, /^caddy\b/i, /^envoy/i, /^linkerd/i, /^curl-?impersonate/i, /^curl-?converter/i, /^tough-?cookie/i, /^http-?signature/i, /^oauth-?sign/i, /^querystring/i, /^qs\b/i, /^url-?/i, /^parse-?url/i, /^whatwg-?url/i, /^normalize-?url/i, /^tiny-?url/i, /^short-?url/i, /^http-?header/i, /^header-?case/i, /^mime-?/i, /^content-?type/i, /^range-?parser/i, /^accept-?/i, /^useragent/i, /^ua-?parser/i, /^device-?detector/i, /^connect-?timeout/i, /^http-?cache/i, /^etag\b/i, /^vary\b/i, /^fresh\b/i, /^on-?headers/i, /^destroy\b/i, /^end-?of-?stream/i, /^stream-?finished/i],
    text: [/http client/i, /websocket/i, /socket/i, /dns resol/i, /network/i, /proxy/i, /message queue/i, /tcp/i, /http request/i, /fetch implementation/i] },
  { cat: 'build and bundlers', name: [/^webpack\b/i, /^webpack-?/i, /^@webpack\//i, /^esbuild\b/i, /^rollup\b/i, /^rollup-?/i, /^vite\b/i, /^vite-?/i, /^@vitejs\//i, /^parcel\b/i, /^@parcel\//i, /^rspack\b/i, /^rsbuild\b/i, /^@rspack\//i, /^@rsbuild\//i, /^turbo\b/i, /^turbopack/i, /^@turbo\//i, /^swc\b/i, /^@swc\//i, /^babel\b/i, /^@babel\//i, /^babel-?/i, /^browserify/i, /^brunch\b/i, /^fuse-box/i, /^microbundle/i, /^tsup\b/i, /^tsdx\b/i, /^ts-cli/i, /^unbuild\b/i, /^rolldown/i, /^farmfe/i, /^@farmfe\//i, /^wmr\b/i, /^preact-?cli/i, /^create-?react-?app/i, /^react-?scripts/i, /^ng-packagr/i, /^@gcp-?/i, /^metalsmith/i, /^brunch/i, /^ Snowpack/i, /^snowpack/i, /^wmr\b/i, /^wmr-?/i, /^pluggable/i, /^gulp\b/i, /^gulp-?/i, /^grunt\b/i, /^grunt-?/i, /^@gridsome\//i, /^hexo\b/i, /^metalsmith/i, /^assemble\b/i, /^yeoman/i, /^yo\b/i, /^generator-?/i, /^plop\b/i, /^hygen\b/i, /^npm-?run-?all/i, /^concurrently/i, /^nodemon/i, /^forever\b/i, /^pm2\b/i, /^node-?dev/i, /^watchify/i, /^chokidar/i, /^watchpack/i, /^auto-?reload/i, /^livereload/i, /^tiny-lr/i, /^css-?hot/i, /^error-?overlay/i, /^fast-refresh/i, /^react-refresh/i, /^@pmmmwh\//i, /^source-?map-?/i, /^source-map$/i, /^sourcemap/i, /^magic-string/i, /^@jridgewell\//i, /^terser\b/i, /^terser-?/i, /^uglify/i, /^uglifyjs/i, /^esmangle/i, /^escodegen/i, /^astring\b/i, /^merge-?source/i, /^gulp-?sourcemaps/i, /^workbox/i, /^@swc-node\//i, /^es-module-?shims/i, /^import-?maps/i, /^systemjs/i, /^requirejs/i, /^amd-?loader/i, /^cjs-?to-?esm/i, /^commonjs-?/i, /^esm-?/i, /^fix-?esm/i, /^dual-?package/i, /^is-?esm/i, /^publint/i, /^attw\b/i, /^arethetypeswrong/i, /^knip\b/i, /^depcheck/i, /^dpdm\b/i, /^madge\b/i, /^circular-?dependency/i, /^dependency-?cruiser/i, /^ts-?prune/i, /^unused-?/i, /^bundle-?/i, /^size-?limit/i, /^bundlesize/i, /^gzip-?size/i, /^pkgs/i, /^package-?size/i, /^cross-?env/i, /^dotenv-?/i, /^load-?env/i, /^env-?/i, /^config-?loader/i],
    text: [/bundler/i, /bundler for/i, /build tool/i, /javascript bundler/i, /module bundler/i, /dev server/i, /hot reload/i, /source map/i, /javascript minif/i, /minifier/i, /task runner/i, /scaffolding/i, /file watcher/i] },
  { cat: 'language and compile', name: [/^typescript\b/i, /^@types\//i, /^tslib\b/i, /^ts-?utils/i, /^ts-?node/i, /^tsx\b/i, /^@swc-node\//i, /^coffeescript/i, /^livescript/i, /^dart-?sdk/i, /^kotlin\b/i, /^scala\b/i, /^scala\.js/i, /^elms\b/i, /^elm\b/i, /^purescript/i, /^reason\b/i, /^rescript/i, /^gleam\b/i, /^roc\b/i, /^wasm\b/i, /^wasm-?/i, /^@wasmer\//i, /^wasmer\b/i, /^wasmtime/i, /^wasm-pack/i, /^wasm-bindgen/i, /^emscripten/i, /^assemblyscript/i, /^@as-?emscripten/i, /^napi-rs/i, /^neon-?bindings/i, /^node-?gyp/i, /^node-?pre-?gyp/i, /^prebuild/i, /^cmake-?js/i, /^node-?api/i, /^ffi-?napi/i, /^ref-?napi/i, /^ref-?struct/i, /^dts-?/i, /^type-?/i, /^types-?/i, /^typed-?/i, /^typedef/i, /^@types/i, /^json-?schema-?to-?typescript/i, /^json2ts/i, /^quicktype/i, /^type-?gen/i, /^typia\b/i, /^@ts-?/, /^ts-json/i, /^zod-?ts/i, /^babel-?standalone/i, /^sucrase/i, /^traceur/i, /^esprima/i, /^acorn\b/i, /^acorn-?/i, /^espree\b/i, /^@babel\/parser/i, /^meriyah/i, /^cherow/i, /^ast-?/i, /^@typescript-eslint\//i, /^ts-?eslint/i, /^memfs/i, /^unionfs/i, /^fs-?monsta/i],
    text: [/typescript types/i, /type definitions/i, /type safe/i, /type checking/i, /webassembly/i, /\bwasm\b/i, /compiler for/i, /parser for javascript/i, /abstract syntax tree/i, /\bast\b generator/i, /native addon/i, /node.js addon/i] },
  { cat: 'test and quality', name: [/^jest\b/i, /^jest-?/i, /^@jest\//i, /^vitest\b/i, /^@vitest\//i, /^mocha\b/i, /^chai\b/i, /^chai-?/i, /^karma\b/i, /^jasmine\b/i, /^jasmine-?/i, /^ava\b/i, /^tap\b/i, /^tape\b/i, /^node-?test/i, /^uvu\b/i, /^teal-?test/i, /^qunit\b/i, /^cypress\b/i, /^@cypress\//i, /^cypress-?/i, /^playwright\b/i, /^@playwright\//i, /^playwright-?/i, /^puppeteer\b/i, /^puppeteer-?/i, /^@puppeteer\//i, /^selenium/i, /^webdriver/i, /^webdriverio/i, /^nightwatch/i, /^testcafe/i, /^protractor/i, /^@testing-library\//i, /^testing-library/i, /^@testing-library\b/i, /^happy-?dom/i, /^jsdom\b/i, /^linkedom/i, /^@sinonjs\//i, /^sinon\b/i, /^sinon-?/i, /^testdouble/i, /^nock\b/i, /^msw\b/i, /^@mswjs\//i, /^pretend/i, /^sinon-?chrome/i, /^chance\b/i, /^faker\b/i, /^@faker-js\//i, /^faker-js/i, /^fake-?timers/i, /^@sinonjs\/fake-timers/i, /^lolex\b/i, /^nyc\b/i, /^istanbul/i, /^c8\b/i, /^@badeball\//i, /^coverage-?/i, /^junit-?/i, /^mocha-?/i, /^supertest/i, /^test-?/i, /^snap-?test/i, /^enzyme\b/i, /^@testing-library\/dom/i, /^dom-?test/i, /^react-?test/i, /^vue-?test/i, /^svelte-?test/i, /^eslint\b/i, /^eslint-?/i, /^@eslint\//i, /^typescript-eslint/i, /^@typescript-eslint\b/i, /^prettier\b/i, /^prettier-?/i, /^biome\b/i, /^@biomejs\//i, /^oxlint/i, /^clippy/i, /^rustfmt/i, /^flake8/i, /^pylint/i, /^pycodestyle/i, /^pyflakes/i, /^autopep8/i, /^black\b/i, /^isort\b/i, /^yapf\b/i, /^rubocop/i, /^standard\b/i, /^semistandard/i, /^xo\b/i, /^html-?hint/i, /^htmllint/i, /^csslint/i, /^stylelint/i, /^markdownlint/i, /^remark-?lint/i, /^commitlint/i, /^@commitlint\//i, /^commit-?lint/i, /^alex\b/i, /^retext\b/i, /^npm-?audit/i, /^better-?doctor/i, /^madge\b/i, /^depcheck/i, /^npm-check/i, /^knip\b/i, /^ts-?prune/i, /^lslint/i, /^depcruise/i, /^dependency-?cruiser/i, /^depcruise/i],
    text: [/\btest/i, /testing framework/i, /unit test/i, /end.to.end/i, /\be2e\b/i, /mock/i, /assertion/i, /lint/i, /formatter for/i, /code formatter/i, /static analysis/i, /coverage/i, /test runner/i, /headless browser/i, /browser automation/i, /code quality/i] },
  { cat: 'cli and dev tools', name: [/^cli\b/i, /-cli$/i, /^commander\b/i, /^yargs\b/i, /^yargs-?/i, /^inquirer\b/i, /^@inquirer\//i, /^prompts\b/i, /^@clack\//i, /^clack\b/i, /^enquirer\b/i, /^ora\b/i, /^chalk\b/i, /^picocolors/i, /^kleur\b/i, /^ansi-?/i, /^ansi-?styles/i, /^wrap-?ansi/i, /^wide-?align/i, /^boxen\b/i, /^figures\b/i, /^log-symbols/i, /^log-update/i, /^listr\b/i, /^ora-?/i, /^nprogress/i, /^progress\b/i, /^blessed\b/i, /^blessed-?/i, /^ink\b/i, /^react-?ink/i, /^@inkjs\//i, /^terminal-?/i, /^term-?/i, /^tty-?/i, /^readline/i, /^@xterm\//i, /^xterm\b/i, /^chafa\b/i, /^figlet\b/i, /^ascii-?/i, /^asciinema/i, /^node-?cli/i, /^meow\b/i, /^yargs-parser/i, /^cac\b/i, /^mri\b/i, /^minimist/i, /^minimist-?/i, /^optimist/i, /^nopt\b/i, /^command-line-?/i, /^get-?stdin/i, /^stdin\b/i, /^open\b/i, /^opn\b/i, /^better-?opn/i, /^update-?notifier/i, /^boxen-?/i, /^configstore/i, /^env-?paths/i, /^xdg-?/i, /^xdg-basedir/i, /^npm-?/i, /^@npmcli\//i, /^npm-?check-?updates/i, /^npx\b/i, /^pnpm\b/i, /^@pnpm\//i, /^pnpm-?/i, /^yarn\b/i, /^@yarnpkg\//i, /^yarn-?/i, /^@evocateur\//i, /^lerna\b/i, /^nx\b/i, /^@nx\//i, /^lage\b/i, /^moonrepo/i, /^@moonrepo\//i, /^turborepo/i, /^mask\b/i, /^just\b/i, /^task-?file/i, /^foreman\b/i, /^@vue\/cli/i, /^@angular\/cli/i, /^ng\b/i, /^react-native-cli/i, /^expo\b/i, /^@expo\//i, /^electron\b/i, /^electron-?/i, /^@electron\//i, /^electron-builder/i, /^electron-packager/i, /^electron-forge/i, /^@electron-forge\//i, /^@electron\/get/i, /^electron-vite/i, /^tauri\b/i, /^@tauri-apps\//i, /^tauri-?/i, /^wails\b/i, /^nwjs\b/i, /^nodegui/i, /^@nodegui\//i, /^neutralino/i, /^webview\b/i, /^@webview\//i, /^xcode-?/i, /^fastlane/i, /^gradle\b/i, /^maven\b/i, /^bazel\b/i, /^buck\b/i, /^cmake\b/i, /^make\b/i, /^ninja\b/i, /^nasm\b/i, /^yasm\b/i, /^fasm\b/i, /^cargo\b/i, /^cargo-?/i, /^rustup/i, /^rust-?/i, /^go-?tools/i, /^golang/i, /^gopls\b/i, /^delve\b/i, /^mockery\b/i, /^fd-find/i, /^ripgrep/i, /^bat\b/i, /^exa\b/i, /^eza\b/i, /^zoxide/i, /^fzf\b/i, /^starship/i, /^alacritty/i, /^wezterm/i, /^kitty\b/i, /^tmux\b/i, /^screen\b/i, /^zsh\b/i, /^oh-my-?zsh/i, /^fish\b/i, /^bash-?/i, /^dash\b/i, /^nushell/i, /^murex\b/i, /^oil\b/i, /^hh\b/i, /^httpie/i, /^curl\b/i, /^wget\b/i, /^aria2\b/i, /^yt-?dlp/i, /^youtube-?dl/i, /^ffmpeg-?cli/i, /^imagemagick/i, /^magick\b/i, /^jq\b/i, /^yq\b/i, /^xmlstarlet/i, /^pandoc\b/i, /^ripgrep-?/i, /^sd\b/i, /^sad\b/i, /^choose\b/i],
    text: [/command line/i, /\bcli\b/i, /terminal/i, /developer experience/i, / scaffolding/i, /package manager/i] },
  { cat: 'git and release', name: [/^git\b/i, /^git-?/i, /^simple-git/i, /^isomorphic-git/i, /^@isomorphic-git\//i, /^nodegit/i, /^libgit2/i, /^husky\b/i, /^@husky\//i, /^lint-staged/i, /^@linted\//i, /^pre-?commit/i, /^precommit/i, /^semantic-?release/i, /^@semantic-release\//i, /^semantic-?release-?/i, /^conventional-?changelog/i, /^conventional-?commits/i, /^conventional-?recommended/i, /^@commitlint\//i, /^commitizen/i, /^cz\b/i, /^cz-?/i, /^commit-?/i, /^gitmoji/i, /^standard-version/i, /^release-?it/i, /^np\b/i, /^@sindresorhus\/np/i, /^publish-?/i, /^changesets/i, /^@changesets\//i, /^@changeset\//i, /^beachball/i, /^raqb\b/i, /^lerna-?publish/i, /^gitlog\b/i, /^git-?log-?/i, /^git-?history/i, /^gitgraph/i, /^diff\b/i, /^diff2html/i, /^diff-?/i, /^patch\b/i, /^patch-?/i, /^apply-?patch/i, /^three-?way-?merge/i, /^node-diff/i, /^jsdiff\b/i, /^difflib/i, /^merge\b/i, /^deepmerge/i, /^chokidar-?git/i, /^gitea\b/i, /^gogs\b/i, /^gerrit\b/i, /^gitlab\b/i, /^@gitbeaker\//i, /^gitbeaker/i, /^@octokit\//i, /^@octokit\b/i, /^octokit\b/i, /^@actions\//i, /^gh\b/i, /^gh-?/i, /^hub\b/i, /^github\b/i, /^@github\//i, /^github-?/i, /^git-?host/i, /^svgo-?git/i, /^git-lfs/i, /^dulwich/i, /^pygit2/i],
    text: [/git (client|hook|library|wrapper)/i, /version control/i, /changelog/i, /release automation/i, /semantic versioning/i, /github api/i, /octokit/i] },
  { cat: 'ci and deployment', name: [/^docker\b/i, /^docker-?/i, /^@docker\//i, /^dockerode/i, /^kubernetes/i, /^k8s\b/i, /^@kubernetes\//i, /^helm\b/i, /^helm-?/i, /^terraform/i, /^@terraform\//i, /^pulumi\b/i, /^@pulumi\//i, /^ansible/i, /^salt-?stack/i, /^chef\b/i, /^puppet\b/i, /^vagrant\b/i, /^capistrano/i, /^moby\b/i, /^containerd/i, /^podman\b/i, /^buildah\b/i, /^skopeo\b/i, /^kaniko\b/i, /^buildkit/i, /^@docker\//i, /^compose-?/i, /^docker-compose/i, /^cross-?compile/i, /^zig-?cc/i, /^zigbuild/i, /^cargo-?zig/i, /^cargo-?ndk/i, /^cargo-?apk/i, /^android-?/i, /^gradle-?/i, /^@capacitor\//i, /^capacitor\b/i, /^@capacitor/i, /^cordova\b/i, /^cordova-?/i, /^phonegap/i, /^ionic\b/i, /^@ionic\//i, /^react-native\b/i, /^react-native-/i, /^nativescript/i, /^@nativescript\//i, /^xcode-?/i, /^fastlane/i, /^appimage/i, /^snapcraft/i, /^flatpak\b/i, /^deb-?/i, /^rpm-?/i, /^pkg\b/i, /^@vercel\/pkg/i, /^nexe\b/i, /^caxa\b/i, /^boxednode/i, /^node-?sea/i, /^serverless\b/i, /^@serverless\//i, /^serverless-?/i, /^@sls\//i, /^architect\b/i, /^@architect\//i, /^begin\b/i, /^sst\b/i, /^@sst\//i, /^flightcontrol/i, /^@flightcontrol\//i, /^railway\b/i, /^@railway\//i, /^fly\b/i, /^@flydotio\//i, /^flyctl\b/i, /^deno-?deploy/i, /^gh-?action/i, /^@actions\//i, /^act\b/i, /^nektos\//i, /^workflow-?/i, /^github-?actions/i, /^ci-?/i, /^circleci/i, /^travis/i, /^@travis\//i, /^jenkins\b/i, /^teamcity/i, /^bitrise/i, /^appveyor/i, /^drone\b/i, /^woodpecker/i, /^gitea-?actions/i, /^watchtower/i, /^portainer/i, /^traefik/i, /^crossbeam/i, /^netlify\b/i, /^@netlify\//i, /^netlify-?/i, /^vercel\b/i, /^@vercel\//i, /^@vercel\b/i, /^cloudflare\b/i, /^@cloudflare\//i, /^wrangler\b/i, /^pages-?/i, /^deploy\b/i, /^@app-?directory/i, /^electron-?builder/i, /^electron-?packager/i, /^electron-?forge/i, /^@electron-forge\//i, /^@electron\/get/i, /^auto-?update/i, /^update-?electron/i, /^squirrel\b/i, /^nsis\b/i, /^wix\b/i, /^msi\b/i, /^dmg\b/i, /^pkg-?build/i, /^notarize\b/i, /^@electron\/notarize/i],
    text: [/continuous integration/i, /\bci\b pipeline/i, /deployment/i, /docker/i, /container/i, /kubernetes/i, /mobile packaging/i, /desktop packaging/i, /installer/i] },
  { cat: 'cloud and infrastructure', name: [/^aws\b/i, /^aws-?sdk/i, /^@aws-sdk\//i, /^@aws-?/i, /^aws-?/i, /^@aws-cdk\//i, /^aws-cdk/i, /^cdk\b/i, /^@google-cloud\//i, /^google-cloud/i, /^@googleapis\//i, /^googleapis/i, /^firebase\b/i, /^@firebase\//i, /^firebase-?/i, /^@supabase\//i, /^supabase\b/i, /^@supabase-?/i, /^supabase-?/i, /^@neondatabase\//i, /^neon\b/i, /^planetscale/i, /^@planetscale\//i, /^@upstash\//i, /^upstash\b/i, /^xata\b/i, /^@xata\//i, /^cockroach/i, /^@cockroachlabs\//i, /^tidb\b/i, /^@pingcap\//i, /^@sentry\//i, /^sentry\b/i, /^@sentry-?/i, /^datadog\b/i, /^@datadog\//i, /^datadog-?/i, /^newrelic/i, /^appdynamics/i, /^dynatrace/i, /^@honeycomb\//i, /^honeycomb/i, /^grafana\b/i, /^@grafana\//i, /^prometheus/i, /^@prometheus\//i, /^@opentelemetry\//i, /^opentelemetry/i, /^otel\b/i, /^lightstep/i, /^instana\b/i, /^io-?pipe/i, /^thundra/i, /^lumigo/i, /^epsagon/i, /^@lumigo\//i, /^cypress-?dashboard/i, /^@cloudflare\//i, /^wrangler\b/i, /^miniflare/i, /^workerd\b/i, /^@workerize\//i, /^workerize/i, /^comlink\b/i, /^@comlink\//i, /^partykit/i, /^@partykit\//i, /^@vercel\//i, /^@vercel-?/i, /^edge-?/i, /^@edge-?/i, /^cloudflare-?/i, /^pages-?/i, /^@netlify\//i, /^fastly\b/i, /^@fastly\//i, /^akamai\b/i, /^bunny\b/i, /^bunnycdn/i, /^@bunny-drive\//i, /^quantil/i, /^keycdn/i, /^cloudinary/i, /^@cloudinary\//i, /^imgix\b/i, /^filestack/i, /^uploadcare/i, /^@uploadcare\//i, /^imagekit/i, /^gumlet\b/i, /^baseten\b/i, /^@baseten\//i, /^replicate\b/i, /^@replicate\//i, /^modal\b/i, /^@modal-?/i, /^@modal-labs\//i, /^runpod\b/i, /^@runpod\//i, /^beam\b/i, /^@beam-?/i, /^@fixie\//i, /^fixie\b/i, /^anyscale/i, /^@anyscale\//i, /^@ray-?io\//i, /^ray-?/i, /^bentoml/i, /^cortex\b/i, /^@cortex-?/i, /^prefect\b/i, /^dagster\b/i, /^@dagster-?/i, /^airflow\b/i, /^apache-airflow/i, /^flyte\b/i, /^@flyte\//i, /^temporal\b/i, /^@temporalio\//i, /^windmill\b/i, /^n8n\b/i, /^node-?red/i, /^@n8n\//i, /^trigger\.dev/i, /^@trigger\.dev\//i, /^inngest\b/i, /^@inngest\//i, /^quirrel\b/i, /^@quirrel\//i, /^gcp-?/i, /^digitalocean/i, /^@do-?/i, /^linode\b/i, /^hetzner\b/i, /^ovh\b/i, /^scaleway/i, /^vultr\b/i, /^@vultr\//i, /^ec2\b/i, /^s3\b/i, /^@s3\//i, /^@aws-sdk\/client-s3/i, /^dynamodb/i, /^@aws-sdk\/client-dynamodb/i, /^sqldb\b/i, /^cloudrun/i, /^gke\b/i, /^eks\b/i, /^aks\b/i, /^fargate/i, /^lambda\b/i, /^@aws-lambda\//i, /^serverless-?framework/i, /^@sst\//i],
    text: [/cloud (sdk|platform|api)/i, /serverless/i, /edge (runtime|function)/i, /hosted (service|api)/i, /observability/i, /infrastructure as code/i, /workflow orchestration/i, /job queue service/i] },
  { cat: 'security and auth', name: [/^auth\b/i, /^auth-?/i, /^@auth\//i, /^nextauth/i, /^next-?auth/i, /^@nextauth\//i, /^lucia\b/i, /^@lucia-auth\//i, /^lucia-?/i, /^better-auth/i, /^@better-auth\//i, /^authjs\b/i, /^@auth0\//i, /^auth0\b/i, /^jsonwebtoken/i, /^jwt\b/i, /^jwt-?/i, /^jose\b/i, /^panva\//i, /^oauth\b/i, /^oauth-?/i, /^oidc\b/i, /^openid/i, /^passport\b/i, /^passport-?/i, /^@node-saml\//i, /^saml\b/i, /^saml2\b/i, /^@saml\//i, /^keycloak/i, /^@keycloak\//i, /^fief\b/i, /^@fief\//i, /^workos\b/i, /^@workos\//i, /^clerk\b/i, /^@clerk\//i, /^clerk-?/i, /^stytch\b/i, /^@stytch\//i, /^magic-?link/i, /^@magic-sdk\//i, /^magic\b/i, /^privy\b/i, /^@privy-io\//i, /^siwt\b/i, /^web3-?auth/i, /^siwe\b/i, /^@spruceid\//i, /^casa\b/i, /^permit\b/i, /^@permitio\//i, /^cerbos\b/i, /^@cerbos\//i, /^pdp\b/i, /^@authorizer\//i, /^authorizer/i, /^casbin/i, /^@casbin\//i, /^acl\b/i, /^rbac\b/i, /^can\b/i, /^ability\b/i, /^policy\b/i, /^permission\b/i, /^@casl\//i, /^casl\b/i, /^sanitize\b/i, /^sanitize-?/i, /^xss\b/i, /^xss-?/i, /^dompurify/i, /^isomorphic-dompurify/i, /^escape-?html/i, /^helmet\b/i, /^helmet-?/i, /^cors\b/i, /^rate-?limit/i, /^express-rate-?limit/i, /^brute-?force/i, /^secure-?/i, /^security-?/i, /^crypto-?js/i, /^secret\b/i, /^secrets\b/i, /^vault\b/i, /^dotenv-vault/i, /^@dotenv-vault\//i, /^keyv\b/i, /^@keyv\//i, /^secure-compare/i, /^timing-safe/i, /^csurf\b/i, /^csrf\b/i, /^csrf-?/i, /^@edgefirst\//i, /^owasp\b/i, /^nsp\b/i, /^audit-?/i, /^snyk\b/i, /^@snyk\//i, /^socket\b/i, /^@socketsecurity\//i, /^phylum\b/i, /^@phylum\//i, /^osv-scanner/i, /^@osv\//i, /^grype\b/i, /^trivy\b/i, /^syft\b/i, /^nuclei\b/i, /^metasploit/i, /^burp\b/i, /^zap\b/i, /^nmap\b/i, /^masscan/i, /^hydra\b/i, /^john-?the-?ripper/i, /^hashcat/i, /^aircrack/i, /^wireshark/i, /^tcpdump/i, /^ettercap/i, /^bettercap/i, /^responder\b/i, /^mimikatz/i, /^pupy\b/i, /^beacon\b/i, /^veil\b/i, /^shells\b/i, /^shellcode/i, /^exploit\b/i, /^payload-?generator/i, /^msfvenom/i, /^rogue\b/i, /^honeypot/i, /^snort\b/i, /^suricata/i, /^zeek\b/i, /^bro\b/i, /^fail2ban/i, /^crowdsec/i, /^ossec\b/i, /^wazuh\b/i, /^clamav/i, /^yara\b/i, /^virustotal/i, /^malware\b/i, /^ransomware/i, /^phishing/i, /^cve-?/i, /^cwe-?/i, /^cve\b/i, /^nvd\b/i, /^advisory\b/i, /^sbom\b/i, /^cyclonedx/i, /^spdx\b/i, /^ossbom\b/i, /^sigstore/i, /^@sigstore\//i, /^cosign\b/i, /^fulcio\b/i, /^rekor\b/i, /^gpg\b/i, /^openpgp/i, /^@openpgp\//i, /^pgp\b/i, /^keybase/i, /^age\b/i, /^sops\b/i, /^mozilla-?sops/i, /^sealed-?secrets/i, /^vault-?unsealer/i, /^tink\b/i, /^@tink-crypto\//i],
    text: [/authentication/i, /authorization/i, /\boauth\b/i, /openid connect/i, /json web token/i, /session management/i, /security/i, /vulnerability/i, /penetration testing/i, /secret (management|storage)/i] },
  { cat: 'crypto', name: [/^crypto\b/i, /^node-?crypto/i, /^@noble\//i, /^noble-?/i, /^secp256k1/i, /^elliptic\b/i, /^elliptic-?/i, /^bn\.js/i, /^bignumber\.js/i, /^big-?int/i, /^bigint-?/i, /^hash\.js/i, /^hash-?/i, /^md5\b/i, /^sha\b/i, /^sha-?/i, /^sha1\b/i, /^sha256\b/i, /^sha3\b/i, /^blake\b/i, /^blake2/i, /^blake3/i, /^keccak/i, /^ripemd/i, /^crc32\b/i, /^crc-?/i, /^bcrypt\b/i, /^bcryptjs/i, /^bcrypt-?/i, /^scrypt\b/i, /^scrypt-?/i, /^argon2\b/i, /^argon2-?/i, /^pbkdf2\b/i, /^pbkdf2-?/i, /^hmac\b/i, /^hmac-?/i, /^aes\b/i, /^aes-?/i, /^des\b/i, /^3des\b/i, /^rc4\b/i, /^chacha/i, /^chacha20/i, /^poly1305/i, /^salsa20/i, /^nacl\b/i, /^tweetnacl/i, /^libsodium/i, /^sodium-?/i, /^sodium/i, /^ed25519/i, /^x25519/i, /^curve25519/i, /^srp\b/i, /^srp-?/i, /^o1js\b/i, /^snarkjs/i, /^circom/i, /^arkworks/i, /^gnark\b/i, /^halo2/i, /^plonk\b/i, /^groth16/i, /^bulletproof/i, /^zk-?snark/i, /^zero-?knowledge/i, /^zksync/i, /^@zk-?/i, /^merkle\b/i, /^merkle-?tree/i, /^mina-?signer/i, /^viem\b/i, /^@noble\/curves/i, /^@noble\/hashes/i, /^@noble\/ed25519/i, /^@noble\/secp256k1/i, /^@noble\/ciphers/i, /^paillier/i, /^bbs\+\b/i, /^okamoto/i, /^fhe\b/i, /^fully-?homomorphic/i, /^tfhe\b/i, /^concrete-?ml/i, /^heaa\b/i, /^seal\b/i, /^bfv\b/i, /^ckks\b/i],
    text: [/cryptograph/i, /hashing/i, /digital signature/i, /zero knowledge/i, /encryption/i, /elliptic curve/i] },
  { cat: 'validation and schema', name: [/^zod\b/i, /^zod-?/i, /^@hookform\/resolvers/i, /^ajv\b/i, /^ajv-?/i, /^yup\b/i, /^joi\b/i, /^@hapi\/joi/i, /^io-ts\b/i, /^io-ts-?/i, /^superstruct/i, /^valibot/i, /^@standard-schema\//i, /^standard-schema/i, /^runtypes\b/i, /^purify-ts/i, /^arktype\b/i, /^@sinclair\//i, /^typebox\b/i, /^@sinclair\/typebox/i, /^spectypes\b/i, /^compi-ioc/i, /^json-schema\b/i, /^json-schema-?/i, /^@json-schema\//i, /^jsonschema/i, /^json-schema-faker/i, /^@faker-js\//i, /^swaggger-?validation/i, /^openapi-?enforcer/i, /^openapi-?framework/i, /^openapi-?request/i, /^openapi-?response/i, /^openapi-?schema/i, /^schema-?/i, /^schemas\b/i, /^@schematics\//i, /^prop-?types/i, /^class-?validator/i, /^class-validator/i, /^validation/i, /^validate\b/i, /^validator\b/i, /^validators\b/i, /^@ validators/i, /^is\b/i, /^is-?/i, /^@sindresorhus\/is/i, /^ow\b/i, /^@sindresorhus\/ow/i, /^guard-?/i, /^checks\b/i, /^check-?/i, /^assert\b/i, /^assert-?/i, /^expect\b/i, /^expect-?/i, /^ts-?validators/i, /^decoders\b/i, /^parse-?don/i, /^@effect\/schema/i, /^effect-?schema/i, /^fastest-validator/i, /^@fastify\/validation/i, /^schema-dts/i, /^normalizr/i, /^validate.js/i],
    text: [/schema validat/i, /data validation/i, /runtime (type|schema)/i, /json schema/i, /type validation/i, /input validation/i] },
  { cat: 'documents and text', name: [/^markdown/i, /^markdown-?/i, /^marked\b/i, /^remark\b/i, /^remark-?/i, /^unified\b/i, /^@mdx-js\//i, /^mdx\b/i, /^mdx-?/i, /^micromark/i, /^mdast-?/i, /^hast-?/i, /^rehype\b/i, /^rehype-?/i, /^@rehypejs\//i, /^mdx-?loader/i, /^frontmatter/i, /^gray-matter/i, /^front-?matter/i, /^@github\/markdown/i, /^@github\/text/i, /^pdf\b/i, /^pdf-?/i, /^pdfjs/i, /^pdfkit\b/i, /^jspdf\b/i, /^pdf-lib/i, /^@react-pdf\//i, /^react-pdf/i, /^pdf-parse/i, /^pdf2json/i, /^pdf-?text/i, /^pdf-?extract/i, /^docx\b/i, /^docx-?/i, /^@docx\//i, /^doc\b/i, /^doc-?/i, /^xlsx\b/i, /^xlsx-?/i, /^exceljs/i, /^sheetjs/i, /^@e965\//i, /^papaparse/i, /^ PapaParse/i, /^csv\b/i, /^csv-?/i, /^papaparse/i, /^@usercontent/i, /^textract/i, /^@extract/i, /^doc-?templater/i, /^handlebars\b/i, /^handlebars-?/i, /^mustache\b/i, /^ejs\b/i, /^eta\b/i, /^nunjucks\b/i, /^pug\b/i, /^jade\b/i, /^hbs\b/i, /^liquidjs/i, /^liquid\b/i, /^twig\b/i, /^dot\b/i, /^dust\b/i, /^swig\b/i, /^lodash.template/i, /^underscore.template/i, /^i18n\b/i, /^i18next\b/i, /^@lingui\//i, /^lingui\b/i, /^@formatjs\//i, /^formatjs\b/i, /^intl\b/i, /^@intl\//i, /^globalize\b/i, /^messageformat/i, /^polyglot/i, /^vue-i18n/i, /^react-intl/i, /^@fluent\//i, /^fluent\b/i, /^@lingui\/macro/i, /^Rosetta/i, /^translate/i, /^translation/i, /^l10n\b/i, /^sentence-?piece/i, /^@sindresorhus\/slugify/i, /^slugify\b/i, /^slug\b/i, /^@sindresorhus\/transliterate/i, /^transliterate/i, /^strip-?/i, /^truncate\b/i, /^truncate-?/i, /^word-?wrap/i, /^wrap\b/i, /^text\b/i, /^text-?/i, /^string\b/i, /^string-?/i, /^camelcase\b/i, /^@sindresorhus\/camelcase/i, /^decamelize/i, /^@sindresorhus\/decamelize/i, /^humanize-?string/i, /^@sindresorhus\/humanize/i, /^change-case/i, /^title-case/i, /^upper-case/i, /^lower-case/i, /^sentence-case/i, /^dot-case/i, /^param-case/i, /^header-case/i, /^constant-case/i, /^pascal-case/i, /^snake-case/i, /^kebab-case/i, /^sentence\b/i, /^word\b/i, /^wordnet/i, /^nlp\b/i, /^compromise/i, /^wink-?nlp/i, /^natural\b/i, /^node-?icu/i, /^iconv\b/i, /^iconv-?/i, /^iconv-lite/i, /^encoding\b/i, /^encoding-?/i, /^@vscode\/iconv/i, /^punycode/i, /^entities\b/i, /^he\b/i, /^html-?entities/i, /^escape-?/i, /^unescape\b/i, /^@htmlbars/i, /^sanitize-html/i, /^html-?parser/i, /^@types\/htmlparser2/i, /^cheerio\b/i, /^@cheerio\//i, /^cheerio-?/i, /^node-html-parser/i, /^htmlparser2/i, /^parse5\b/i, /^parse-?/i, /^jsdom\b/i, /^linkedom/i, /^diff-?html/i, /^jsbarcode/i, /^@zxing\//i, /^zxing\b/i, /^bwip-js/i, /^qrcode\b/i, /^qrcode-?/i, /^@zxing\/library/i, /^libphonenumber/i, /^@google\/libphonenumber/i, /^phone-?/i, /^@sindresorhus\/match-?keywords/i, /^lexer\b/i, /^@cspell/i, /^cspell\b/i, /^dictionary\b/i, /^@types/i, /^@napi-rs/i, /^hunspell/i, /^@wooorm\//i, /^nlcst/i, /^parse-?lang/i, /^@textlint\//i, /^textlint/i, /^proselint/i, /^write-?good/i, /^alex\b/i, /^retext\b/i, /^retext-?/i, /^@retextjs\//i, /^@styleguidesource/i, /^ vale\b/i, /^remark-?stringify/i, /^mdast/i, /^@microsoft\/tsdoc/i, /^tsdoc\b/i, /^@microsoft\/api-extractor/i, /^typedoc\b/i, /^typedoc-?/i, /^@mtsmtparser/i, /^docgen/i, /^@microsoft\/tsdoc-config/i, /^@discordjs\/docgen/i, /^documentation\b/i, /^@documentation\//i, /^apidoc\b/i, /^docma\b/i, /^jsdoc\b/i, /^jsdoc-?/i, /^@jsdoc\//i, /^docstrap/i, /^minami\b/i, /^ink-docstrap/i, /^tui-doc/i, /^esdoc\b/i, /^esdoc-?/i],
    text: [/markdown/i, /\bpdf\b/i, /docx/i, /spreadsheet/i, /template engine/i, /internationalization/i, /i18n/i, /text processing/i, /natural language/i, /html parser/i, /syntax highlight/i, /documentation generator/i, /word (segment|token)/i] },
  { cat: 'images and media', name: [/^sharp\b/i, /^@squoosh\//i, /^squoosh\b/i, /^jimp\b/i, /^@jimp\//i, /^jimp-?/i, /^imagemagick/i, /^gm\b/i, /^graphicsmagick/i, /^canvas\b/i, /^node-canvas/i, /^@napi-rs\/canvas/i, /^skia\b/i, /^@skia\//i, /^resvg\b/i, /^@resvg\//i, /^svg\b/i, /^svg-?/i, /^svgo\b/i, /^svgo-?/i, /^svgson\b/i, /^svg2png/i, /^svg-?to-?/i, /^librsvg/i, /^cairo\b/i, /^cairosvg/i, /^pango\b/i, /^gif\b/i, /^gif-?/i, /^gifski/i, /^gifenc\b/i, /^apng\b/i, /^png\b/i, /^png-?/i, /^jpeg\b/i, /^jpeg-?/i, /^jpg\b/i, /^webp\b/i, /^webp-?/i, /^avif\b/i, /^avif-?/i, /^tiff\b/i, /^tiff-?/i, /^bmp\b/i, /^bmp-?/i, /^ico\b/i, /^ico-?/i, /^exif\b/i, /^exif-?/i, /^image-?/i, /^img\b/i, /^img-?/i, /^pictures\b/i, /^photo\b/i, /^photo-?/i, /^photon\b/i, /^fotos\b/i, /^imagor\b/i, /^thumbor/i, /^imgproxy/i, /^imageproxy/i, /^ffmpeg\b/i, /^ffmpeg-?/i, /^fluent-?ffmpeg/i, /^@ffmpeg\//i, /^ffmpeg-static/i, /^ffprobe\b/i, /^libav\b/i, /^video\b/i, /^video-?/i, /^mp4\b/i, /^mkv\b/i, /^webm\b/i, /^mov\b/i, /^h264\b/i, /^h265\b/i, /^hevc\b/i, /^vp8\b/i, /^vp9\b/i, /^av1\b/i, /^av1-?/i, /^codec\b/i, /^codecs\b/i, /^transcode/i, /^transcoding/i, /^mux\b/i, /^demux\b/i, /^remux\b/i, /^container\b/i, /^fragmented-?mp4/i, /^smooth-?streaming/i, /^hls\b/i, /^hls-?/i, /^dash\b/i, /^m3u8\b/i, /^mpegts\b/i, /^mpeg-?/i, /^flv\b/i, /^rtmp\b/i, /^rtsp\b/i, /^srt\b/i, /^vtt\b/i, /^subtitle/i, /^caption/i, /^closed-?caption/i, /^ass\b/i, /^subrip/i, /^youtube\b/i, /^yt-?/i, /^ytdl/i, /^@distube\//i, /^distube\b/i, /^play\b/i, /^@playframework/i, /^player\b/i, /^player-?/i, /^video-?player/i, /^shaka\b/i, /^shaka-?player/i, /^videojs/i, /^video\.js/i, /^@videojs\//i, /^vidstack/i, /^@vidstack\//i, /^hls\.js/i, /^dashjs\b/i, /^clappr\b/i, /^flowplayer/i, /^jwplayer/i, /^bitmovin/i, /^brightcove/i, /^mux-?stats/i, /^@mux\//i, /^mux\b/i, /^peer-?tube/i, /^mediasoup/i, /^janus\b/i, /^mediaserver/i, /^rtcmulticonnection/i, /^webrtc-?/i, /^@webrtc\//i, /^simple-peer/i, /^peerjs\b/i, /^datachannel/i, /^getusermedia/i, /^screen-?capture/i, /^@dyc3\//i, /^figma\b/i, /^@figma\//i, /^figma-?/i, /^sketch\b/i, /^sketch-?/i, /^xd\b/i, /^photoshop/i, /^psd\b/i, /^psd-?/i, /^affinity/i, /^gimp\b/i, /^krita\b/i, /^inkscape/i, /^blender\b/i, /^davinci/i, /^resolve-?studio/i, /^obs\b/i, /^obs-?/i, /^openbroadcast/i, /^screen-?record/i, /^recorder\b/i, /^media-?recorder/i, /^getDisplayMedia/i],
    text: [/image (processing|manipulation|conversion|optimization)/i, /resize image/i, /video (processing|encoding|transcoding)/i, /ffmpeg/i, /screen record/i, /webrtc/i, /media stream/i] },
  { cat: 'audio and music', name: [/^audio\b/i, /^audio-?/i, /^@audioworklet/i, /^sound\b/i, /^sound-?/i, /^sounds\b/i, /^sfx\b/i, /^music\b/i, /^music-?/i, /^musical\b/i, /^daw\b/i, /^digital-?audio-?workstation/i, /^midi\b/i, /^midi-?/i, /^@tonejs\//i, /^tone\b/i, /^tone-?/i, /^howler\b/i, /^howler-?/i, /^howlerjs/i, /^webaudio/i, /^web-?audio/i, /^audio-?context/i, /^audiobuffer/i, /^offline-?audio-?context/i, /^pianoroll/i, /^piano\b/i, /^synth\b/i, /^synth-?/i, /^synthesizer/i, /^oscillator/i, /^envelope\b/i, /^lfo\b/i, /^filter\b/i, /^reverb\b/i, /^delay\b/i, /^chorus\b/i, /^flanger/i, /^distortion/i, /^compressor/i, /^limiter\b/i, /^equalizer/i, /^eq\b/i, /^gain\b/i, /^mixer\b/i, /^mixing-?console/i, /^mastering/i, /^daw-?plugin/i, /^vst\b/i, /^vst3\b/i, /^au\b/i, /^aax\b/i, /^clap\b/i, /^lv2\b/i, /^ladspa/i, /^jsynth\b/i, /^dsp\b/i, /^dsp-?/i, /^signal-?processing/i, /^fft\b/i, /^dft\b/i, /^waveform/i, /^spectrum\b/i, /^spectrogram/i, /^wav\b/i, /^wave\b/i, /^mp3\b/i, /^aac\b/i, /^ogg\b/i, /^opus\b/i, /^flac\b/i, /^alac\b/i, /^wma\b/i, /^aiff\b/i, /^mp3-?/i, /^lame\b/i, /^lamejs/i, /^shine\b/i, /^mp3lame/i, /^vorbis\b/i, /^vorbis-?/i, /^libvorbis/i, /^speex\b/i, /^speex-?/i, /^g711\b/i, /^pcm\b/i, /^pcm-?/i, /^ulaw\b/i, /^alaw\b/i, /^resample/i, /^resampling/i, /^pitch-?shift/i, /^time-?stretch/i, /^autotune/i, /^vocoder/i, /^denoiser/i, /^noise-?suppression/i, /^rnnoise/i, /^speex-?dsp/i, /^web-?speech/i, /^speech\b/i, /^speech-?/i, /^tts\b/i, /^text-?to-?speech/i, /^@coqui\//i, /^coqui\b/i, /^piper\b/i, /^@rhasspy\//i, /^rhasspy\b/i, /^espeak\b/i, /^espeak-?/i, /^festival\b/i, /^flite\b/i, /^@bytedance\//i, /^fish-?speech/i, /^xtts\b/i, /^voice\b/i, /^voice-?/i, /^voicemail/i, /^asr\b/i, /^whisper-?/i, /^@xenova\/transformers/i, /^@speechify\//i, /^speechify/i, /^podcast\b/i, /^podcast-?/i, /^itunes\b/i, /^musicbrainz/i, /^@acoustid\//i, /^acoustid\b/i, /^echoprint/i, /^fpcalc\b/i, /^chromaprint/i, /^shazam\b/i, /^soundcloud/i, /^@soundcloud\//i, /^spotify\b/i, /^@spotify\//i, /^spotify-?/i, /^lastfm\b/i, /^@lastfm\//i, /^last-?fm/i, /^discogs\b/i, /^@dotenv\//i, /^genius\b/i, /^lyrics\b/i, /^lyric-?/i, /^karaoke/i, /^beats\b/i, /^beat-?/i, /^onset\b/i, /^tempo\b/i, /^bpm\b/i, /^key-?detection/i, /^chord\b/i, /^chord-?/i, /^scale\b/i,/^note\b/i,/^guitar\b/i,/^piano-?/i,/^drum\b/i,/^drum-?/i,/^tablature/i,/^abc-?notation/i,/^musicxml/i,/^music21\b/i,/^music-?theory/i,/^aubio\b/i,/^portaudio/i,/^@pedalboard\//i,/^pedalboard/i,/^rubberband/i,/^soundtouch/i,/^zita\b/i,/^calf\b/i,/^ zam\b/i,/^x42\b/i,/^siren\b/i,/^krad\b/i,/^jack\b/i,/^jack-?/i,/^alsa\b/i,/^pulse-?audio/i,/^pulseaudio/i,/^pipewire/i,/^coreaudio/i,/^wasapi\b/i,/^asio\b/i,/^oboe\b/i,/^aaudio/i,/^miniaudio/i,/^sdl-?audio/i, /^openal\b/i,/^sfml-?audio/i,/^raylib-?audio/i,/^soloud\b/i,/^librosa\b/i,/^pyaudio/i,/^pydub\b/i,/^soundfile/i,/^audioread/i,/^pedalboard-?python/i],
    text: [/audio/i, /music (player|library|theory|production)/i, /\bmidi\b/i, /speech synthesis/i, /digital audio workstation/i, /sound effect/i, /podcast/i] },
  { cat: '3d and graphics', name: [/^three\b/i, /^three-?/i, /^@react-three\//i, /^react-three-fiber/i, /^drei\b/i, /^@react-three\/drei/i, /^babylonjs/i, /^babylon-?/i, /^@babylonjs\//i, /^webgl\b/i, /^webgl-?/i, /^@react-three\/fiber/i, /^ogl\b/i, /^regl\b/i, /^gl-matrix/i, /^glmatrix\b/i, /^vec\b/i, /^vec2\b/i, /^vec3\b/i, /^vec4\b/i, /^mat4\b/i, /^mat3\b/i, /^quaternion/i, /^@types\/three/i, /^three-stdlib/i, /^three-mesh-bvh/i, /^three-?examples/i, /^three-?sprite/i, /^three-?css/i, /^three-?loader/i, /^three-?gltf/i, /^gltf\b/i, /^gltf-?/i, /^@gltf\//i, /^collada\b/i, /^fbx\b/i, /^obj\b/i, /^stl\b/i, /^ply\b/i, /^obj-?loader/i, /^dae\b/i, /^3ds\b/i, /^blend\b/i, /^blender-?exporter/i, /^unity\b/i, /^@unity\//i, /^unity-?/i, /^godot\b/i, /^godot-?/i, /^unreal\b/i, /^udk\b/i, /^cocos\b/i, /^cocos2d/i, /^cocos-?creator/i, /^laya\b/i, /^layaair/i, /^egret\b/i, /^phaser\b/i, /^phaser-?/i, /^pixi\b/i, /^pixi-?/i, /^@pixi\//i, /^konva\b/i, /^konva-?/i, /^fabric\b/i, /^fabric-?/i, /^fabricjs/i, /^p5\b/i, /^p5-?/i, /^processing/i, /^paper\b/i, /^paper-?/i, /^paperjs/i, /^two-?/i, /^two\.js/i, /^matter-?/i, /^matterjs/i, /^planck\b/i, /^planckjs/i, /^box2d\b/i, /^box2d-?/i, /^@box2d\//i, /^cannon\b/i, /^cannon-?/i, /^cannon-es/i, /^ammo\b/i, /^ammo-?/i, /^rapier\b/i, /^@dimforge\//i, /^ovphysics/i, /^physx\b/i, /^jolt\b/i, /^jolt-?/i, /^nvidia-?physx/i, /^havok\b/i, /^@bullet-?/i, /^bullet-?/i, /^ode\b/i, /^newton-?/i, /^liquidfun/i, /^bevy\b/i, /^bevy-?/i, /^macroquad/i, /^ggez\b/i, /^wgpu\b/i, /^wgpu-?/i, /^@webgpu\//i, /^webgpu\b/i, /^vulkan\b/i, /^vulkan-?/i, /^@gfx-rs\//i, /^luminance/i, /^sokol\b/i, /^@sokra\//i, /^metal\b/i, /^metallib/i, /^opengl\b/i, /^opengl-?/i, /^gles\b/i, /^egl\b/i, /^glsl\b/i, /^glsl-?/i, /^shader/i, /^shaders?\b/i, /^wgsl\b/i, /^spirv\b/i, /^spirv-?/i, /^naga\b/i, /^@gfx-rs\/naga/i, /^hlsl\b/i, /^cg\b/i, /^msl\b/i, /^raytracer/i, /^ray-?tracing/i, /^path-?tracing/i, /^rasteriz/i, /^voxel\b/i, /^voxel-?/i, /^terrain\b/i, /^lod\b/i, /^mesh\b/i, /^mesh-?/i, /^navmesh/i, /^nav-?mesh/i, /^collision/i, /^physics\b/i, /^physics-?/i, /^rigid-?body/i, /^particle/i, /^particles\b/i, /^particle-?/i, /^sprite\b/i, /^sprite-?/i, /^skeleton/i, /^animation-?rig/i, /^skinning/i, /^morph-?target/i, /^frustum/i, /^octree\b/i, /^bvh\b/i, /^bvh-?/i, /^kd-?tree/i, /^quadtree/i, /^spatial-?/i, /^scene-?graph/i, /^camera\b/i, /^camera-?/i, /^light\b/i, /^lighting/i, /^shadow/i, /^shadow-?/i, /^pbr\b/i, /^hdr\b/i, /^exr\b/i, /^envmap/i, /^cubemap/i, /^skybox/i, /^fog\b/i, /^bloom\b/i, /^ssao\b/i, /^bilinear/i, /^antialias/i, /^msaa\b/i, /^postprocessing/i, /^post-?processing/i, /^@pmndrs\//i, /^pmndrs\b/i, /^maath\b/i, /^troika-?/i, /^camera-controls/i, /^gsap-?three/i, /^cannon-?debug/i, /^@react-three\/rapier/i, /^@react-three\/cannon/i, /^@react-three\/physics/i, /^@react-three\/postprocessing/i, /^@react-three\/fiber/i, /^@react-three\/drei/i, /^@react-three\/xrf/i, /^model-viewer/i, /^@google\/model-viewer/i, /^view360\b/i, /^panolens\b/i, /^panorama/i, /^360\b/i, /^instanced/i, /^instancing/i, /^batching/i, /^skinned-?mesh/i, /^webxr\b/i, /^web-?xr/i, /^@webxr\//i, /^ar\b/i, /^ar-?/i, /^@ar-js\//i, /^arjs\b/i, /^vuforia/i, /^@zappar\//i, /^zappar\b/i, /^8thwall/i, /^mind-?ar/i, /^model-viewer-?/i, /^@vuejs\//i],
    text: [/webgl/i, /3d (render|engine|model|graphic)/i, /three\.js/i, /game engine/i, /physics engine/i, /shader/i, /virtual reality/i, /augmented reality/i, /ray tracing/i, /spatial/i] },
  { cat: 'science and math', name: [/^math\b/i, /^mathjs/i, /^math-?/i, /^@sindresorhus\/math/i, /^big\.js/i, /^decimal\.js/i, /^bignumber\b/i, /^@types\/bignum/i, /^fraction\.js/i, /^complex\.js/i, /^algebra\b/i, /^calculus/i, /^@fingerprintjs/i, /^stat\b/i, /^stats\b/i, /^stats-?/i, /^statistics/i, /^probability/i, /^statistical/i, /^distributions?\b/i, /^bayes\b/i, /^regression/i, /^correlation/i, /^variance\b/i, /^stddev/i, /^moment\b/i, /^@stdlib\//i, /^stdlib\b/i, /^scientific\b/i, /^science\b/i, /^sci-?/i, /^numpy\b/i, /^scipy\b/i, /^pandas\b/i, /^polars\b/i, /^pyarrow/i, /^modin\b/i, /^dask\b/i, /^vaex\b/i, /^koalas\b/i, /^cudf\b/i, /^cuml\b/i, /^cupy\b/i, /^numba\b/i, /^cython\b/i, /^sympy\b/i, /^mpmath/i, /^scikit/i, /^sklearn/i, /^statsmodels/i, /^theano\b/i, /^theanets/i, /^matplotlib/i, /^seaborn\b/i, /^plotly\b/i, /^@plotly\//i, /^bokeh\b/i, /^altair\b/i, /^holoviews/i, /^hvplot\b/i, /^datashader/i, /^ggplot\b/i, /^lets-?plot/i, /^chart-?/i, /^charts?\b/i, /^@chartjs\//i, /^chartjs\b/i, /^chart\.js/i, /^d3\b/i, /^d3-?/i, /^@observable\//i, /^observable/i, /^vega\b/i, /^vega-?lite/i, /^@vega\//i, /^@visx\//i, /^visx\b/i, /^recharts\b/i, /^victory\b/i, /^nivo\b/i, /^@nivo\//i, /^echarts\b/i, /^@visactor\//i, /^visactor/i, /^highcharts/i, /^apexcharts/i, /^@sgratzl\//i, /^@carbon\//i, /^uplot\b/i, /^uPlot\b/i, /^dygraphs/i, /^flot\b/i, /^amcharts/i, /^@amcharts\//i, /^fusioncharts/i, /^canvasjs/i, /^billboard/i, /^billboard-?/i, /^c3\b/i, /^c3-?/i, /^plottable/i, /^taucharts/i, /^k3d\b/i, /^pyqtgraph/i, /^mayavi\b/i, /^vispy\b/i, /^pyvista/i, /^open3d\b/i, /^trimesh\b/i, /^vtk\b/i, /^paraview/i, /^blender-?python/i, /^networkx/i, /^igraph\b/i, /^graph-tool/i, /^snap-?graphs/i, /^graphviz/i, /^pydot\b/i, /^dot\b/i, /^cytoscape\b/i, /^@cytoscape\//i, /^cytoscape-?/i, /^gephi\b/i, /^sigma\b/i, /^@react-sigma/i, /^react-?flow/i, /^reactflow\b/i, /^@xyflow\//i, /^xyflow\b/i, /^litegraph/i, /^rete\b/i, /^retejs\b/i, /^drawflow/i, /^jsplumb\b/i, /^@jsplumb\//i, /^gojs\b/i, /^jointjs/i, /^@clientio\//i, /^mxgraph\b/i, /^maxgraph/i, /^dagre\b/i, /^dagre-?/i, /^@dagrejs\//i, /^elkjs\b/i, /^elk-?/i, /^d3-dag/i, /^graphlib/i, /^@graphprotocol\//i, /^cytoscape.js/i, /^vis\b/i, /^vis-?network/i, /^@vis-?network\//i, /^@antv\//i, /^antv\b/i, /^g6\b/i, /^@antv\/g6/i, /^@antv\/g2/i, /^@antv\/l7/i, /^l7\b/i, /^@antv\/s2/i, /^leaflet\b/i, /^react-?leaflet/i, /^@react-leaflet\//i, /^mapbox\b/i, /^mapbox-?gl/i, /^@mapbox\//i, /^maplibre/i, /^@maplibre\//i, /^openlayers/i, /^ol\b/i, /^cesium\b/i, /^@cesium\//i, /^cesium-?/i, /^three-?geo/i, /^d3-?geo/i, /^@turfjs\//i, /^turf\b/i, /^proj4\b/i, /^proj4js/i, /^geotiff\b/i, /^gdal\b/i, /^shapely\b/i, /^fiona\b/i, /^rasterio/i, /^geopandas/i, /^pyproj\b/i, /^pyshp\b/i, /^geojson/i, /^topojson/i, /^simplestatistics/i, /^simple-statistics/i, /^@mljs\//i, /^ml\b/i, /^ml-?/i, /^brain\b/i, /^brainjs\b/i, /^synaptic/i, /^neuroevolution/i, /^genetic-?algorithm/i, /^genetic\b/i, /^optimization/i, /^optimizer/i, /^lp-?solve/i, /^glpk\b/i, /^cbc\b/i, /^ortools/i, /^pulp\b/i, /^cvxpy\b/i, /^optuna\b/i, /^hyperopt/i, /^ray-?tune/i, /^ax\b/i, /^nevergrad/i, /^scikit-?optimize/i, /^simulated-?annealing/i, /^metropolis/i, /^monte-?carlo/i, /^markov\b/i, /^hmm\b/i, /^kalman\b/i, /^particle-?filter/i, /^control-?theory/i, /^pid\b/i, /^fuzzy\b/i, /^chaos\b/i, /^fractal/i, /^mandelbrot/i, /^julia-?set/i, /^noise\b/i, /^simplex-?noise/i, /^perlin\b/i, /^opensimplex/i, /^pnpm-?noise/i, /^rng\b/i, /^seedrandom/i, /^random\b/i, /^random-?/i, /^@sindresorhus\/random/i, /^uuid\b/i, /^nanoid\b/i, /^shortid\b/i, /^cuid\b/i, /^ulid\b/i, /^ksuid\b/i, /^hashids\b/i, /^sqids\b/i, /^@paralleldrive\/cuid2/i],
    text: [/math (library|util)/i, /statistic/i, /dataframe/i, /scientific computing/i, /machine learning/i, /chart (library|render)/i, /data visualization/i, /graph (layout|visualiz)/i, /geospatial/i, /random number/i] },
  { cat: 'monitoring and logging', name: [/^pino\b/i, /^pino-?/i, /^winston\b/i, /^winston-?/i, /^bunyan\b/i, /^bunyan-?/i, /^morgan\b/i, /^@logtail\//i, /^logtail\b/i, /^@logfire\//i, /^logfire\b/i, /^@datadog\//i, /^dd-trace/i, /^loglevel\b/i, /^debug\b/i, /^@sentry\//i, /^sentry\b/i, /^sentry-?/i, /^@opentelemetry\//i, /^opentelemetry/i, /^otel\b/i, /^@opencensus\//i, /^opencensus/i, /^prom-client/i, /^prometheus/i, /^@prometheus\//i, /^node-prometheus/i, /^grafana\b/i, /^@grafana\//i, /^grafana-?/i, /^influx/i, /^@influxdata\//i, /^signalfx/i, /^wavefront/i, /^@wavefront\//i, /^newrelic/i, /^@newrelic\//i, /^appmetrics/i, /^@appmetrics\//i, /^clinic\b/i, /^clinicjs/i, /^0x\b/i, /^@davidmarkclements\//i, /^node-?clinic/i, /^flamegraph/i, /^flame-?graph/i, /^@jonahgolden\//i, /^cpuprofile/i, /^heapdump/i, /^@indutny\//i, /^node-?report/i, /^diagnostics\b/i, /^@hapi\//i, /^good\b/i, /^@hapi\/good/i, /^roarr\b/i, /^@roarr\//i, /^@lokalise\//i, /^logform\b/i, /^logfmt\b/i, /^loggly\b/i, /^@loggly\//i, /^logentries/i, /^papertrail/i, /^logz-io/i, /^logzio/i, /^@logzio\//i, /^coralogix/i, /^@coralogix\//i, /^sumologic/i, /^@sumologic\//i, /^sumo-?logic/i, /^splunk\b/i, /^@splunk\//i, /^elastic\b/i, /^@elastic\//i, /^elasticsearch/i, /^@elastic\/elasticsearch/i, /^@elastic\/ecs/i, /^ecs-?logging/i, /^@google-cloud\/logging/i, /^@google-cloud\/trace/i, /^gcp-?logging/i, /^@aws-sdk\/client-cloudwatch/i, /^@aws-cloudwatch/i, /^cloudwatch/i, /^@sentry-?browser/i, /^@sentry-?node/i, /^@sentry-?react/i, /^@sentry-?vue/i, /^@sentry-?angular/i, /^@sentry-?svelte/i, /^@sentry-?nextjs/i, /^@sentry-?remix/i, /^@sentry-?astro/i, /^@sentry-?expo/i, /^@sentry-?react-native/i, /^@sentry-?electron/i, /^@sentry-?webpack-plugin/i, /^@sentry-?vite-plugin/i, /^sentry-?cli/i, /^sentry-?utils/i, /^@spotlightjs\//i, /^spotlight\b/i, /^@highlight-?io\//i, /^highlight-?io/i, /^highlight\b/i, /^logrocket/i, /^@logrocket\//i, /^logrocket-?/i, /^fullstory/i, /^@fullstory\//i, /^fullstory-?/i, /^hotjar\b/i, /^@hotjar\//i, /^posthog\b/i, /^posthog-?/i, /^@posthog\//i, /^amplitude\b/i, /^@amplitude\//i, /^amplitude-?js/i, /^segment\b/i, /^@segment\//i, /^analytics-?js/i, /^@analytics\//i, /^analytics\b/i, /^mixpanel\b/i, /^@mixpanel\//i, /^mixpanel-?/i, /^plausible/i, /^@plausible\//i, /^plausible-?/i, /^fathom\b/i, /^@fathom\//i, /^usefathom/i, /^matomo\b/i, /^@matomo\//i, /^piwik\b/i, /^piwik-?/i, /^umami\b/i, /^@umami\//i, /^umami-?/i, /^goatcounter/i, /^@vercel\/analytics/i, /^@vercel\/web-analytics/i, /^vercel-?analytics/i, /^@unjs\//i, /^statsig\b/i, /^@statsig\//i, /^statsig-?/i, /^growthbook/i, /^@growthbook\//i, /^growthbook-?/i, /^launchdarkly/i, /^@launchdarkly\//i, /^launchdarkly-?/i, /^optimizely/i, /^@optimizely\//i, /^unleash\b/i, /^@unleash\//i, /^unleash-?/i, /^flagsmith/i, /^@flagsmith\//i, /^flagsmith-?/i, /^openfeature/i, /^@openfeature\//i, /^statsig-js/i, /^@tailflow/i],
    text: [/logging/i, /log (collector|aggregat|shipp)/i, /error tracking/i, /application monitoring/i, /performance monitoring/i, /observability/i, /analytics/i, /feature flag/i, /\btracing\b/i, /\bmetrics\b/i, /\btelemetry\b/i] },
  { cat: 'python tooling', name: [/^pip\b/i, /^pip-?/i, /^pipenv\b/i, /^pipenv-?/i, /^poetry\b/i, /^python-?poetry/i, /^setuptools\b/i, /^setuptools-?/i, /^wheel\b/i, /^wheel-?/i, /^virtualenv/i, /^virtualenv-?/i, /^@virtualenv/i, /^venv\b/i, /^uv\b/i, /^uv-?/i, /^astral-?uv/i, /^hatch\b/i, /^hatchling/i, /^hatch-?/i, /^flit\b/i, /^flit-?/i, /^pdm\b/i, /^pdm-?/i, /^pip-?tools/i, /^pip-?compile/i, /^twine\b/i, /^twine-?/i, /^build\b/i, /^python-?build/i, /^pyproject-?/i, /^@pyproject/i, /^tox\b/i, /^tox-?/i, /^nox\b/i, /^nox-?/i, /^pre-?commit/i, /^pre-commit/i, /^conda\b/i, /^conda-?/i, /^mamba\b/i, /^micromamba/i, /^@mamba\//i, /^pyenv\b/i, /^pyenv-?/i, /^pyenv-?virtualenv/i, /^pyenv-virtualenv/i, /^python-?dotenv/i, /^@python/i, /^isort\b/i, /^black\b/i, /^@psf\/black/i, /^ruff\b/i, /^@astral-?/i, /^mypy\b/i, /^mypy-?/i, /^pyright\b/i, /^@pyright\//i, /^pyright-?/i, /^pylance/i, /^pylsp\b/i, /^python-?lsp/i, /^python-lsp-server/i, /^rope\b/i, /^jedi\b/i, /^parso\b/i, /^@davidhalter/i, /^autopep8/i, /^yapf\b/i, /^flake8\b/i, /^flake8-?/i, /^pycodestyle/i, /^pydocstyle/i, /^pyflakes/i, /^pylint\b/i, /^pylint-?/i, /^bandit\b/i, /^bandit-?/i, /^semgrep\b/i, /^semgrep-?/i, /^sourcery/i, /^pyre\b/i, /^pyre-?check/i, /^vulture\b/i, /^radon\b/i, /^prospector/i, /^pylint-celery/i, /^python-?template/i, /^cookiecutter/i, /^cookiecutter-?/i, /^cruft\b/i, /^cruft-?/i, /^pyscaffold/i, /^@pyscaffold/i, /^pipx\b/i, /^pipx-?/i, /^pythonbrew/i, /^pyflow\b/i, /^pypa\b/i, /^@pypa\//i, /^pyvec\b/i, /^cython\b/i, /^Cython/i, /^nuitka\b/i, /^Nuitka/i, /^mypyc\b/i, /^pyinstaller/i, /^py2app\b/i, /^cx-?Freeze/i, /^cx_Freeze/i, /^shiv\b/i, /^pex\b/i, /^pants\b/i, /^@pantsbuild\//i, /^pantsbuild/i, /^buck-?python/i, /^buck2\b/i, /^waf\b/i, /^meson\b/i, /^mesonbuild/i, /^@mesonbuild/i, /^scikit-build/i, /^@scikit-build/i, /^cmake-?python/i, /^ninja-?python/i, /^distutils\b/i, /^python-?distutils/i, /^egg-?info/i, /^sdist\b/i, /^bdist\b/i, /^wheel-inspect/i, /^auditwheel/i, /^repairwheel/i, /^abi3\b/i, /^@abi3/i, /^ limited/i],
    text: [/python (package|build|environment|virtual)/i, /pip /i, /python tooling/i, /python packaging/i, /pep [0-9]/i] },
  { cat: 'rust and systems', name: [/^tokio\b/i, /^tokio-?/i, /^@tokio-rs\//i, /^async-?std/i, /^smol\b/i, /^@smol-rs\//i, /^futures\b/i, /^futures-?/i, /^@rust-fuzz\//i, /^libc\b/i, /^@rust-lang\//i, /^nix\b/i, /^@nix-rs\//i, /^nix-rs/i, /^errno\b/i, /^cfg-?if/i, /^bitflags/i, /^bytes\b/i, /^@tokio-rs\/bytes/i, /^memchr\b/i, /^@BurntSushi\//i, /^regex\b/i, /^regex-?/i, /^@rust-lang\/regex/i, /^regex-syntax/i, /^aho-corasick/i, /^serde\b/i, /^serde-?/i, /^@serde-rs\//i, /^serde_json/i, /^serde_yaml/i, /^toml\b/i, /^@toml-rs\//i, /^toml_edit/i, /^@ =/i, /^winapi\b/i, /^windows\b/i, /^@microsoft\//i, /^windows-sys/i, /^windows-?core/i, /^@windows-rs\//i, /^cc\b/i, /^@rust-cc/i, /^cmake\b/i, /^@rust-lang\/cmake-rs/i, /^pkg-config/i, /^vcpkg\b/i, /^autocfg\b/i, /^proc-macro2/i, /^quote\b/i, /^syn\b/i, /^@dtolnay\//i, /^proc-macro/i, /^@crossbeam\//i, /^crossbeam/i, /^parking_lot/i, /^lock_api/i, /^once_cell/i, /^lazy_static/i, /^rayon\b/i, /^@rayon-rs\//i, /^num\b/i, /^num-?/i, /^@rust-num\//i, /^num_cpus/i, /^chrono\b/i, /^@chronotope\//i, /^time\b/i, /^@time-rs\//i, /^uuid\b/i, /^@uuid-rs\//i, /^rand\b/i, /^rand-?/i, /^@rust-random\//i, /^getrandom/i, /^anyhow\b/i, /^thiserror/i, /^eyre\b/i, /^color-eyre/i, /^tracing\b/i, /^tracing-?/i, /^@tokio-rs\/tracing/i, /^log\b/i, /^@rust-lang\/log/i, /^env_logger/i, /^indicatif/i, /^console\b/i, /^@console-rs\//i, /^dialoguer/i, /^clap\b/i, /^clap-?/i, /^@clap-rs\//i, /^structopt/i, /^argh\b/i, /^pico-?args/i, /^xshell\b/i, /^duct\b/i, /^cargo\b/i, /^cargo-?/i, /^@cargo-?/i, /^@marin-?self/i, /^@embedrs/i, /^smol-?/i, /^mio\b/i, /^@tokio-rs\/mio/i, /^socket2/i, /^hyper\b/i, /^hyper-?/i, /^@hyperium\//i, /^http\b/i, /^http-?/i, /^@hyperium\/http/i, /^http-body/i, /^h2\b/i, /^@hyperium\/h2/i, /^tower\b/i, /^tower-?/i, /^@tower-rs\//i, /^tonic\b/i, /^tonic-?/i, /^@hyperium\/tonic/i, /^prost\b/i, /^prost-?/i, /^@tokio-rs\/prost/i, /^warp\b/i, /^axum\b/i, /^axum-?/i, /^@tokio-rs\/axum/i, /^actix\b/i, /^actix-?/i, /^@actix\//i, /^rocket\b/i, /^@SergioBenitez/i, /^poem\b/i, /^poem-?/i, /^@poem-web\//i, /^salvo\b/i, /^@salvo-rs\//i, /^ntex\b/i, /^@ntex-rs\//i, /^tide\b/i, /^surf\b/i, /^reqwest\b/i, /^reqwest-?/i, /^@seanmonstar\//i, /^ureq\b/i, /^@algesten\//i, /^isahc\b/i, /^attohttpc/i, /^curl\b/i, /^@curl-rs\//i, /^curl-?rust/i, /^hyper-rustls/i, /^rustls\b/i, /^@rustls\//i, /^rustls-?/i, /^native-tls/i, /^@rust-embedded/i, /^openssl\b/i, /^@sfackler\//i, /^tokio-?openssl/i, /^webpki\b/i, /^@briansmith\//i, /^ring\b/i, /^@briansmith\/ring/i, /^aes-?/i, /^@RustCrypto\//i, /^chacha20poly1305/i, /^argon2\b/i, /^@RustCrypto\/password-hash/i, /^bcrypt\b/i, /^sha2\b/i, /^@RustCrypto\/hashes/i, /^hmac\b/i, /^@RustCrypto\/macs/i, /^base64\b/i, /^@marraksa/i, /^hex\b/i, /^@Koka\//i, /^data-encoding/i, /^url\b/i, /^@servo\//i, /^idna\b/i, /^@servo\/idna/i, /^percent-encoding/i, /^form_urlencoded/i, /^mime\b/i, /^mime_guess/i, /^headers\b/i, /^@hyperium\/headers/i, /^cookie\b/i, /^@alexcrichton\//i, /^tar\b/i, /^flate2\b/i, /^zip\b/i, /^@zip-rs\//i, /^xz2\b/i, /^brotli\b/i, /^@dropbox\//i, /^zstd\b/i, /^@gyscos\//i, /^lz4\b/i, /^lz4-?/i, /^compress\b/i, /^miniz_oxide/i, /^bytemuck\b/i, /^byteorder/i, /^heapless\b/i, /^static_alloc/i, /^bumpalo\b/i, /^@fitzgen\//i, /^wasm-bindgen/i, /^wasm-bindgen-?/i, /^@rustwasm\//i, /^js-sys/i, /^web-sys/i, /^wasmtime/i, /^@bytecodealliance\//i, /^wasmer\b/i, /^@wasmerio\//i, /^wizer\b/i, /^@Adobe-?/i, /^cargo-wasi/i, /^wasi\b/i, /^@bytecodealliance\/wasi/i, /^cranelift/i, /^@CraneStation/i, /^wasm-?encoder/i, /^wasmi\b/i, /^@paritytech\//i, /^polkavm/i, /^llvm\b/i, /^llvm-sys/i, /^inkwell\b/i, /^@TheDan64/i, /^melior\b/i, /^codegen/i, /^@crlf0710/i, /^lightgbm/i, /^maturin\b/i, /^@PyO3\//i, /^pyo3\b/i, /^pyo3-?/i, /^rust-numpy/i, /^@PyO3\/rust-numpy/i, /^neon\b/i, /^neon-?serd/i, /^napi-?rs/i, /^@napi-rs\//i, /^napi-?/i, /^dlopen/i, /^libloading/i, /^ffi\b/i, /^cfg-?eval/i, /^bindgen\b/i, /^@rust-lang\/rust-bindgen/i, /^cbindgen/i, /^sccache/i, /^@mozilla\/sccache/i],
    text: [/rust (crate|library|binding)/i, /async runtime/i, /memory (allocat|safety)/i, /systems programming/i, /foreign function interface/i, /native binding/i] },
  { cat: 'go and systems', name: [/^github\.com\//, /^golang\.org\//, /^google\.golang\.org\//, /^gopkg\.in\//, /^gotest\./i, /^go\.uber\.org\//i, /^k8s\.io\//, /^sigs\.k8s\.io\//, /^cloud\.google\.com\//, /^go\.mongodb\.org\//, /^ent\.go\.io\//, /^go\.text\.dev\//i, /^modernc\.org\//, /^gioui\.org\//, /^fyne\.io\//i, /^gorm\.io\//, /^go-?/i],
    text: [/go (module|package|library)/i, /\bgolang\b/i] },
  { cat: 'utilities', name: [/^lodash\b/i, /^lodash-?/i, /^underscore\b/i, /^ramda\b/i, /^ramda-?/i, /^@sindresorhus\//i, /^date-fns/i, /^date-?/i, /^dayjs\b/i, /^day-?/i, /^moment\b/i, /^moment-?/i, /^luxon\b/i, /^js-joda/i, /^chrono-?node/i, /^ms\b/i, /^pretty-ms/i, /^@sindresorhus\/ms/i, /^chalk\b/i, /^@sindresorhus\//i, /^p-map/i, /^p-?/i, /^delay\b/i, /^pify\b/i, /^arr-?/i, /^array-?/i, /^@arr\//i, /^object-?/i, /^obj-?/i, /^deep-?/i, /^shallow-?/i, /^flatten\b/i, /^uniq\b/i, /^unique\b/i, /^@sindresorhus\/uniq/i, /^dedupe\b/i, /^@sindresorhus\/dedupe/i, /^group-?/i, /^sort-?/i, /^@sindresorhus\/sort/i, /^filter\b/i, /^map-?obj/i, /^@sindresorhus\/map-obj/i, /^invert-?kv/i, /^@sindresorhus\/invert-kv/i, /^dot-?prop/i, /^@sindresorhus\/dot-prop/i, /^get-?/i, /^set-?/i, /^has-?/i, /^is\b/i, /^@sindresorhus\/is/i, /^kind-?of/i, /^@sindresorhus\/kind-of/i, /^type-?/i, /^assert-?/i, /^@sindresorhus\/assert/i, /^humanize-?/i, /^pretty-?/i, /^@sindresorhus\/pretty/i, /^pretty-bytes/i, /^@sindresorhus\/pretty-bytes/i, /^pretty-error/i, /^figures\b/i, /^log-symbols/i, /^indent-string/i, /^trim-?/i, /^repeat-?/i, /^pad\b/i, /^left-?pad/i, /^right-?pad/i, /^@sindresorhus\/pad/i, /^word-?/i, /^number-?/i, /^to-?/i, /^from-?/i, /^convert-?/i, /^parse-?/i, /^stringify/i, /^string-?/i, /^strip-?/i, /^@sindresorhus\/strip/i, /^camel-?case/i, /^@sindresorhus\/camelcase/i, /^title-?case/i, /^upper-?/i, /^lower-?/i, /^kebab-?case/i, /^snake-?case/i, /^pascal-?case/i, /^constant-?case/i, /^dot-?case/i, /^param-?case/i, /^header-?case/i, /^sentence-?case/i, /^swap-?case/i, /^change-?case/i, /^decamelize/i, /^@sindresorhus\/decamelize/i, /^escape-?/i, /^unescape-?/i, /^encode-?/i, /^decode-?/i, /^base64\b/i, /^base64-?/i, /^@sindresorhus\/base64/i, /^hex-?/i, /^binary-?/i, /^bit-?/i, /^bits\b/i, /^@sindresorhus\/bits/i, /^bytes\b/i, /^bytes-?/i, /^byte-?/i, /^buffer\b/i, /^buffer-?/i, /^stream\b/i, /^stream-?/i, /^@ streams/i, /^readable-?/i, /^writable-?/i, /^duplex\b/i, /^through\b/i, /^through2/i, /^@ streams/i, /^pipeline\b/i, /^pump\b/i, /^end-?of-?/i, /^@sindresorhus\/end-of/i, /^event\b/i, /^event-?/i, /^events\b/i, /^@ snyk/i, /^ee\b/i, /^@ training/i, /^emitter\b/i, /^@ emitter/i, /^promise\b/i, /^promise-?/i, /^@sindresorhus\/promise/i, /^bluebird/i, /^q\b/i, /^when\b/i, /^rsvp\b/i, /^co\b/i, /^async\b/i, /^async-?/i, /^ne-?async/i, /^await\b/i, /^await-?/i, /^@await/i, /^deasync/i, /^then\b/i, /^then-?/i, /^finally\b/i, /^queue\b/i, /^queue-?/i, /^p-?queue/i, /^@sindresorhus\/p-queue/i, /^stack\b/i, /^stack-?/i, /^list\b/i, /^list-?/i, /^linked-?list/i, /^doubly/i, /^circular\b/i, /^circular-?/i, /^cuckoo\b/i, /^bloom-?filter/i, /^lru\b/i, /^lru-?/i, /^ttl\b/i, /^ttl-?/i, /^expire\b/i, /^expiry\b/i, /^cache\b/i, /^cache-?/i, /^@caching/i, /^memoize\b/i, /^memoize-?/i, /^@sindresorhus\/memoize/i, /^weak\b/i, /^weak-?/i, /^@weakmap/i, /^ref\b/i, /^ref-?/i, /^pointer\b/i, /^pointer-?/i, /^arena\b/i, /^pool\b/i, /^pool-?/i, /^worker\b/i, /^worker-?/i, /^@ workers/i, /^thread\b/i, /^thread-?/i, /^threads\b/i, /^@ threads/i, /^parallel\b/i, /^parallel-?/i, /^concurrent/i, /^concurrent-?/i, /^mutex\b/i, /^semaphore/i, /^lock\b/i, /^lock-?/i, /^rwlock\b/i, /^once\b/i, /^once-?/i, /^@ once/i, /^debounce/i, /^debounced/i, /^throttle\b/i, /^throttled/i, /^timers?\b/i, /^timer-?/i, /^@ timers/i, /^interval\b/i, /^interval-?/i, /^timeout\b/i, /^timeout-?/i, /^@ timeouts/i, /^clock\b/i, /^clock-?/i, /^@ clock/i, /^hrtime\b/i, /^performance-?/i, /^perf-?/i, /^nanosecond/i, /^microtime/i, /^now\b/i, /^@sindresorhus\/now/i, /^sleep\b/i, /^usleep\b/i, /^retry\b/i, /^retry-?/i, /^@sindresorhus\/retry/i, /^backoff\b/i, /^back-?off/i, /^jitter\b/i, /^random\b/i, /^random-?/i, /^@sindresorhus\/random/i, /^@sindresorhus\/random-int/i, /^@sindresorhus\/random-float/i, /^@sindresorhus\/random-item/i, /^@sindresorhus\/random-object/i, /^chance\b/i, /^@chancejs\//i, /^@chancejs/i, /^chancejs/i, /^seedrandom/i, /^@sindresorhus\/seedrandom/i, /^uuid\b/i, /^@sindresorhus\/uuid/i, /^nanoid\b/i, /^@sindresorhus\/nanoid/i, /^shortid\b/i, /^cuid\b/i, /^ulid\b/i, /^ksuid\b/i, /^@sindresorhus\/hash/i, /^hash\b/i, /^hash-?/i, /^@sindresorhus\/hash/i, /^object-hash/i, /^@sindresorhus\/object-hash/i, /^checksum\b/i, /^crc\b/i, /^crc-?/i, /^@sindresorhus\/crc/i, /^md5\b/i, /^@sindresorhus\/md5/i, /^sha\b/i, /^@sindresorhus\/sha/i, /^encode-?url/i, /^decode-?url/i, /^query-?/i, /^qs\b/i, /^@sindresorhus\/qs/i, /^param\b/i, /^param-?/i, /^@sindresorhus\/param/i, /^cookie\b/i, /^cookie-?/i, /^@sindresorhus\/cookie/i, /^storage\b/i, /^storage-?/i, /^localstorage/i, /^sessionstorage/i, /^@sindresorhus\/storage/i, /^fs\b/i, /^fs-?/i, /^@sindresorhus\/fs/i, /^graceful-fs/i, /^@sindresorhus\/graceful-fs/i, /^file\b/i, /^file-?/i, /^@sindresorhus\/file/i, /^filepath\b/i, /^path\b/i, /^path-?/i, /^@sindresorhus\/path/i, /^glob\b/i, /^glob-?/i, /^@sindresorhus\/glob/i, /^minimatch/i, /^@sindresorhus\/minimatch/i, /^micromatch/i, /^@sindresorhus\/micromatch/i, /^matcher\b/i, /^matcher-?/i, /^@sindresorhus\/matcher/i, /^wildcard/i, /^@sindresorhus\/wildcard/i, /^find\b/i, /^find-?/i, /^@sindresorhus\/find/i, /^walk\b/i, /^walk-?/i, /^@sindresorhus\/walk/i, /^traverse\b/i, /^@sindresorhus\/traverse/i, /^dir\b/i, /^dir-?/i, /^directory\b/i, /^@sindresorhus\/directory/i, /^mkdir\b/i, /^@sindresorhus\/mkdir/i, /^rmdir\b/i, /^rm\b/i, /^@sindresorhus\/rm/i, /^cp\b/i, /^@sindresorhus\/cp/i, /^mv\b/i, /^@sindresorhus\/mv/i, /^rename\b/i, /^@sindresorhus\/rename/i, /^copy\b/i, /^copy-?/i, /^@sindresorhus\/copy/i, /^move\b/i, /^move-?/i, /^@sindresorhus\/move/i, /^@sindresorhus\/move-file/i, /^@sindresorhus\/move-files/i, /^temp\b/i, /^temp-?/i, /^tmp\b/i, /^tmp-?/i, /^@sindresorhus\/tmp/i, /^os\b/i, /^os-?/i, /^@sindresorhus\/os/i, /^platform\b/i, /^@sindresorhus\/platform/i, /^arch\b/i, /^@sindresorhus\/arch/i, /^cpu\b/i, /^@sindresorhus\/cpu/i, /^memory\b/i, /^@sindresorhus\/memory/i, /^disk\b/i, /^@sindresorhus\/disk/i, /^network\b/i, /^@sindresorhus\/network/i, /^ip\b/i, /^@sindresorhus\/ip/i, /^port\b/i, /^@sindresorhus\/port/i, /^process\b/i, /^process-?/i, /^@sindresorhus\/process/i, /^signal\b/i, /^signal-?/i, /^@sindresorhus\/signal/i, /^execa\b/i, /^@sindresorhus\/execa/i, /^@sindresorhus\/exec/i, /^spawn\b/i, /^@sindresorhus\/spawn/i, /^child-?process/i, /^@sindresorhus\/child-process/i, /^shell\b/i, /^shell-?/i, /^@sindresorhus\/shell/i, /^bash\b/i, /^@sindresorhus\/bash/i, /^sudo\b/i, /^@sindresorhus\/sudo/i, /^env\b/i, /^env-?/i, /^@sindresorhus\/env/i, /^dotenv\b/i, /^@sindresorhus\/dotenv/i, /^config\b/i, /^config-?/i, /^@sindresorhus\/config/i, /^rc\b/i, /^@sindresorhus\/rc/i, /^ini\b/i, /^@sindresorhus\/ini/i, /^yaml\b/i, /^@sindresorhus\/yaml/i, /^yml\b/i, /^json\b/i, /^json-?/i, /^@sindresorhus\/json/i, /^json5\b/i, /^@sindresorhus\/json5/i, /^hjson\b/i, /^jsonc\b/i, /^cson\b/i, /^toml\b/i, /^@sindresorhus\/toml/i, /^xml\b/i, /^xml-?/i, /^@sindresorhus\/xml/i, /^csv\b/i, /^@sindresorhus\/csv/i, /^tsv\b/i, /^@sindresorhus\/tsv/i, /^debug\b/i, /^@sindresorhus\/debug/i, /^error\b/i, /^error-?/i, /^@sindresorhus\/error/i, /^@sindresorhus\/pretty-error/i, /^stack-?trace/i, /^@sindresorhus\/stack-trace/i, /^@sindresorhus\/clean-stack/i, /^serialize\b/i, /^serialize-?/i, /^@sindresorhus\/serialize/i, /^deserialize/i, /^@sindresorhus\/deserialize/i, /^clone\b/i, /^clone-?/i, /^@sindresorhus\/clone/i, /^copy\b/i, /^extend\b/i, /^merge\b/i, /^mixin\b/i, /^assign\b/i, /^defaults\b/i, /^omit\b/i, /^pick\b/i, /^@sindresorhus\/omit/i, /^@sindresorhus\/pick/i, /^get-?by/i, /^@sindresorhus\/get-by/i, /^dot-?get/i, /^dot-?set/i, /^@sindresorhus\/dot/i],
    text: [/utility/i, /helper (function|library)/i, /small (library|module)/i, /general purpose/i] }
];

/* ecosystem default fallback */
const ECO_DEFAULT: Record<string, string | null> = {
  cargo: 'rust and systems',
  go: 'go and systems',
  gem: 'utilities',
  python: 'utilities',
  deno: 'utilities',
  composer: 'web framework and server',
  npm: null
};

/** Categorizes one package with the scored keyword ruleset, the scope overrides and the ecosystem default. */
function autoCategory(name: string, meta: jsonrecord): string {
  const use = (meta.use || '').toLowerCase();
  const kws = (meta.keywords || []).join(' ').toLowerCase();
  const text = use + ' ' + kws;
  const eco = meta.ecosystem || 'npm';
  let best = null;
  let bestScore = 0;
  for (const rule of RULES) {
    let score = 0;
    for (const re of rule.name) {
      if (re.test(name)) { score += 3; break; }
    }
    for (const re of rule.text) {
      if (re.test(text)) { score += 2; break; }
    }
    if (score > bestScore) { bestScore = score; best = rule.cat; }
  }
  if (bestScore >= 2 && best) return best;
  const scoped = scopeCategory(name);
  if (scoped) return scoped;
  return ECO_DEFAULT[eco] || 'uncategorized';
}

/* ---------------- review mode: emit sub agent batches ---------------- */
if (mode === 'review') {
  if (!opts.meta) throw new Error('the tool needs --meta <file>');
  const meta: jsonrecord = JSON.parse(fs.readFileSync(opts.meta, 'utf8'));
  const outdir = opts.outdir || '/home/z/work/repocase/review';
  fs.mkdirSync(outdir, { recursive: true });
  const fixdir = opts.fixdir || '/home/z/work/repocase/fixes';
  const fixes: Record<string, jsonrecord> = {};
  if (fs.existsSync(fixdir)) {
    for (const f of fs.readdirSync(fixdir).filter((x) => x.endsWith('.json'))) {
      try {
        const one = JSON.parse(fs.readFileSync(path.join(fixdir, f), 'utf8'));
        for (const [k, v] of Object.entries(one)) {
          if (typeof v === 'string') fixes[k] = { category: v };
          else if (v && typeof v === 'object') fixes[k] = v;
        }
      } catch (e) { /* skip malformed */ }
    }
  }
  const rows: Array<{ name: string; cat: string; use: string | null; link: string; ecosystem?: string; origins?: string[] }> = [];
  for (const [name, m] of Object.entries(meta.packages) as Array<[string, jsonrecord]>) {
    const fix = fixes[name] || {};
    const cat = fix.category ? canonCat(fix.category) ?? 'uncategorized' : autoCategory(name, m);
    rows.push({ name, cat, use: fix.use || m.use || null, link: m.link, ecosystem: m.ecosystem, origins: m.origins });
  }
  const byCat: Record<string, Array<{ name: string; cat: string; use: string | null; link: string; ecosystem?: string; origins?: string[] }>> = {};
  for (const r of rows) (byCat[r.cat] = byCat[r.cat] || []).push(r);

  /* batch a: uncategorized and missing use, priority for research */
  const needResearch = rows.filter((r) => r.cat === 'uncategorized' || !r.use).sort((a, b) => (a.cat === 'uncategorized' ? -1 : 1) - (b.cat === 'uncategorized' ? -1 : 1));
  const batchFiles = [];
  let n = 0;
  for (let i = 0; i < needResearch.length; i += 150) {
    n += 1;
    const batch = needResearch.slice(i, i + 150);
    const file = path.join(outdir, 'batch.' + String(n).padStart(2, '0') + '.json');
    fs.writeFileSync(file, batch.map((r) => JSON.stringify(r)).join('\n') + '\n');
    batchFiles.push(file);
  }
  /* batch b: verification samples from each populated category */
  let v = 0;
  for (const [cat, list] of Object.entries(byCat)) {
    if (cat === 'uncategorized' || list.length < 12) continue;
    const sample = list.slice(0, 60);
    v += 1;
    const file = path.join(outdir, 'verify.' + String(v).padStart(2, '0') + '.' + cat.replace(/[^a-z0-9]+/g, '-') + '.json');
    fs.writeFileSync(file, sample.map((r) => JSON.stringify({ name: r.name, cat: r.cat, use: r.use, link: r.link })).join('\n') + '\n');
    batchFiles.push(file);
  }
  console.log('categories:');
  for (const [cat, list] of Object.entries(byCat).sort((a, b) => b[1].length - a[1].length)) {
    console.log('  ' + cat + ': ' + list.length);
  }
  console.log('research entries: ' + needResearch.length + ' in ' + n + ' batches');
  console.log('verify batches: ' + v);
  console.log('outdir: ' + outdir);
  process.exit(0);
}

/* ---------------- build mode: assemble the document ---------------- */
if (!opts.meta) throw new Error('the tool needs --meta <file>');
const meta: jsonrecord = JSON.parse(fs.readFileSync(opts.meta, 'utf8'));
const fixdir = opts.fixdir || '/home/z/work/repocase/fixes';
const fixes: Record<string, jsonrecord> = {};
if (fs.existsSync(fixdir)) {
  for (const f of fs.readdirSync(fixdir).filter((x) => x.endsWith('.json'))) {
    try {
      const one = JSON.parse(fs.readFileSync(path.join(fixdir, f), 'utf8'));
      for (const [k, v] of Object.entries(one)) {
        if (typeof v === 'string') fixes[k] = { category: v };
        else if (v && typeof v === 'object') fixes[k] = v;
      }
    } catch (e) { /* skip malformed */ }
  }
}
const overrides: Record<string, { cat: string; use: string | null }> = {};
for (const [name, raw] of Object.entries(fixes)) {
  const fix = typeof raw === 'string' ? { category: raw } : raw;
  if (!fix) continue;
  const cat = canonCat(fix.category);
  if (cat) overrides[name] = { cat, use: fix.use || null };
}

const rows: Array<{ name: string; cat: string; use: string | null; link: string; ecosystem?: string; origins?: string[] }> = [];
for (const [name, m] of Object.entries(meta.packages) as Array<[string, jsonrecord]>) {
  const o = overrides[name] || {};
  const cat = o.cat ?? autoCategory(name, m);
  const use = (o.use && String(o.use).trim()) || m.use || (m.ecosystem === 'go' ? 'go module, see the package page for the purpose' : 'no public description found, kept for catalog completeness');
  const link = /^https:\/\//.test(m.link || '') ? m.link : String(m.link || '').replace(/^http:\/\//, 'https://');
  rows.push({ name, cat, use: String(use).replace(/\|/g, '/').replace(/\s+/g, ' ').trim(), link: link || 'https://www.npmjs.com/package/' + encodeURIComponent(name) });
}
const byCat: Record<string, Array<{ name: string; cat: string; use: string | null; link: string; ecosystem?: string; origins?: string[] }>> = {};
for (const r of rows) (byCat[r.cat] = byCat[r.cat] || []).push(r);
for (const cat of Object.keys(byCat)) byCat[cat].sort((a, b) => a.name.localeCompare(b.name));

function pad(s: unknown, w: number): string {
  const str = String(s);
  if (str.length >= w) return str;
  return str + ' '.repeat(w - str.length);
}

/**
 * Escapes one value for a markdown table cell. backslashes escape first,
 * then table pipes: an input backslash before a pipe would otherwise pair
 * with the pipe escape and leave the pipe unescaped, splitting the cell.
 */
function esc(s: unknown): string {
  return String(s).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
}

const cats = Object.keys(byCat).sort();
const L = [];
L.push('# repo case');
L.push('');
L.push('the single dependency catalog of the operation. it lists every package name captured from every dependency key of every manifest blob of every commit of the two family repositories, each with its canonical link and a short statement of what it serves. the name comes first, the link comes second and the use comes last, exactly as the owner defined the row.');
L.push('');
L.push('the sources are the allen repository at one hundred eighty four commits with one thousand nine hundred sixty four manifest blobs and the devthink repository at nine hundred seventy one commits across all branches with one thousand one hundred eleven manifest blobs, both harvested by the cjs script of the family, plus the previous union document of the organized md folder and the package.10 catalogs absorbed without loss. the descriptions come from the public registries: npmjs for node packages, pypi for python packages, crates.io for rust crates, rubygems for gems and packagist for composer packages, with the repository hints of the previous harvest filling the gaps. deduplication is by package name: one row per name, one link per row, the category says the use family and the description says the specific purpose.');
L.push('');
L.push('## manifest keys');
L.push('');
L.push('the harvest captures every key of the manifest files that names a package or an engine: dependencies, devdependencies, peerdependencies, optionaldependencies, bundleddependencies, overrides, resolutions, trusteddependencies, the pnpm sections, the catalogs, the python requirements and poetry tables, the cargo tables, the go require statements, the gemfiles, the composer requires and the engine declarations. the table correlates each manifest key with the number of distinct packages seen under it.');
L.push('');
const kindCounts: Record<string, number> = {};
for (const [name, m] of Object.entries(meta.packages) as Array<[string, jsonrecord]>) {
  for (const k of m.kinds || []) kindCounts[k] = (kindCounts[k] || 0) + 1;
}
const kindRows = Object.entries(kindCounts).sort((a, b) => b[1] - a[1]);
L.push('| manifest key | packages |');
L.push('| --- | --- |');
for (const [k, c] of kindRows) L.push('| ' + esc(k) + ' | ' + c + ' |');
L.push('');
L.push('## engines');
L.push('');
L.push('the engine keys observed across the manifests, with the version ranges seen in the wild. the engines are runtime requirements, not packages: they say which runtime version the manifests demand.');
L.push('');
L.push('| engine | observed ranges |');
L.push('| --- | --- |');
const engRows = Object.entries(meta.engines || {}) as Array<[string, { specs?: string[] }]>;
engRows.sort((a, b) => a[0].localeCompare(b[0]));
const engW = Math.max(8, ...engRows.map((e) => e[0].length));
for (const [eng, info] of engRows) {
  const specs = (info.specs || []).slice(0, 6).join(', ');
  L.push('| ' + pad(esc(eng), engW) + ' | ' + esc(specs) + ' |');
}
L.push('');
L.push('## the catalog by category');
L.push('');
L.push('every category explains its use family in its own words, then the packages follow in alphabetical order. the sum of all rows is ' + rows.length + '.');
L.push('');
for (const cat of cats) {
  const list = byCat[cat];
  const desc = CATEGORIES[cat] || 'category of the catalog.';
  L.push('## ' + cat + ' (' + list.length + ')');
  L.push('');
  L.push(desc);
  L.push('');
  const nameW = Math.min(46, Math.max(8, ...list.slice(0, 400).map((r) => Math.min(46, r.name.length))));
  const linkW = Math.min(72, Math.max(10, ...list.slice(0, 400).map((r) => Math.min(72, r.link.length))));
  L.push('| package | link | use |');
  L.push('| --- | --- | --- |');
  for (const r of list) {
    L.push('| ' + pad(esc(r.name), nameW) + ' | ' + pad(esc(r.link), linkW) + ' | ' + esc(r.use) + ' |');
  }
  L.push('');
}
L.push('## method');
L.push('');
L.push('the harvest is reproducible. the scripts live in the devthink repository under tests scripts: the harvest script walks the commit graph of a repository, filters the manifest paths, reads every manifest blob through cat file batch with lazy fetch on partial clones and records package, kind, spec, origin and engine. the metadata script merges the harvests, pulls the registry descriptions with backoff for rate limits and resolves the canonical link of every package. the build script categorizes with a scored keyword ruleset, applies the review fixes of the sub agent waves and writes this document. the waves of review agents researched the entries without description, verified the categories and corrected the classification, and their fixes merge here without loss.');
L.push('');
if (!opts.out) throw new Error('the build mode needs --out <file>');
fs.writeFileSync(opts.out, L.join('\n'));
console.log('wrote ' + opts.out + ': ' + rows.length + ' rows, ' + cats.length + ' categories, ' + (fs.statSync(opts.out).size / 1048576).toFixed(2) + ' mb');
for (const cat of cats) console.log('  ' + cat + ': ' + byCat[cat].length);
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
