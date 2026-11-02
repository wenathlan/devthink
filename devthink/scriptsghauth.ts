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
import { spawn } from "node:child_process";
import { open } from "node:fs/promises";
import { pathToFileURL } from "node:url";

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
