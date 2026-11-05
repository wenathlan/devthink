/**
 * pythonscripts.ts — the python lane of the node maestro: the orchestrator
 * spawns python3 inside the sandbox cwd, captures stdout and stderr, kills
 * the interpreter past the timeout and answers one plain result with the
 * exit code. The runner is a seam: the node default is `spawnpythonrunner`
 * (spawn from node:child_process), and tests inject a fake — the maestro
 * logic never touches the interpreter directly. Pure typescript, node only,
 * no external package.
 *
 * The sandbox law holds: the account is the sandbox, the script runs inside
 * the cwd the caller names, stdin is ignored and nothing outside that cwd
 * is touched. The json lane is opt-in: the caller composes `parsejsonstdout`
 * over the result when the script answers a json document.
 */

import { spawn } from "node:child_process";

/** Why a run ended the way it ended: a normal exit, a timeout kill or a spawn error. */
export type pythonreason = "exit" | "timeout" | "error";

/** The complete answer of one python execution, normalized. */
export type pythonresult = {
  /** The exit code of the interpreter, or null when the run died to a signal or never spawned. */
  code: number | null;
  /** Everything the script wrote to stdout, utf8 decoded. */
  stdout: string;
  /** Everything the script wrote to stderr, utf8 decoded. */
  stderr: string;
  /** Why the run ended: exit, timeout or error. */
  reason: pythonreason;
  /** The wall clock the run consumed, in milliseconds. */
  durationms: number;
};

/** A runner answer before normalization: fakes may answer the short form. */
export type pythonanswer = {
  code: number | null;
  stdout?: string;
  stderr?: string;
  reason?: pythonreason;
  durationms?: number;
};

/** The knobs of one python execution. */
export type pythonoptions = {
  /** The sandbox cwd the script runs in (the account is the sandbox law). */
  cwd: string;
  /** Hard ceiling of the run in milliseconds; the interpreter is killed past it. */
  timeoutms?: number;
  /** Argv after the script path. */
  args?: string[];
  /** Extra environment variables layered over process.env. */
  env?: Record<string, string>;
  /** The interpreter override (the default answers python3). */
  interpreter?: string;
};

/** The house defaults: python3, the caller cwd, 30s ceiling, no extra argv or env. */
export const PYTHON_DEFAULTS: Required<Omit<pythonoptions, "cwd" | "env">> & { env: Record<string, string> } = {
  timeoutms: 30_000,
  args: [],
  env: {},
  interpreter: "python3",
};

/** The runner seam: anything that takes the script plus options and answers one result. */
export type pythonrunner = (script: string, options: pythonoptions) => Promise<pythonanswer>;

/** The json lane: a parse that either answers a value or one readable error. */
export type jsonanswer = { ok: true; value: unknown } | { ok: false; error: string };

/**
 * pythonargv — the argv the interpreter runs: the script first, the extra
 * arguments after. Pure so tests can assert the command line without a
 * process.
 *
 * @param script the script path, relative to the sandbox cwd.
 * @param args the extra argv after the script.
 * @returns the full argv for the interpreter.
 */
export function pythonargv(script: string, args: readonly string[] = []): string[] {
  return [script, ...args];
}

/**
 * normalizeresult — fills the short form a runner may answer into one
 * complete pythonresult: empty streams, a reason inferred from the exit
 * code (null answers error) and a zero duration when unmeasured.
 *
 * @param answer the runner answer, complete or short.
 * @returns the normalized result.
 */
export function normalizeresult(answer: pythonanswer): pythonresult {
  return {
    code: answer.code,
    stdout: answer.stdout ?? "",
    stderr: answer.stderr ?? "",
    reason: answer.reason ?? (answer.code === null ? "error" : "exit"),
    durationms: answer.durationms ?? 0,
  };
}

/**
 * spawnpythonrunner — the node default runner: spawn the interpreter with
 * the sandbox cwd, the timeout ceiling and piped stdout/stderr. A run past
 * the timeout is killed and answers reason timeout; an interpreter that
 * never spawns (missing binary, spawn failure) answers reason error instead
 * of throwing — the maestro reads the result, it never catches.
 *
 * @param script the script path, relative to the sandbox cwd.
 * @param options the execution knobs (cwd required).
 * @returns the raw answer of the spawned run.
 */
export function spawnpythonrunner(script: string, options: pythonoptions): Promise<pythonanswer> {
  return new Promise((resolve) => {
    const started = Date.now();
    const ceiling = options.timeoutms ?? PYTHON_DEFAULTS.timeoutms;
    let timedout = false;
    let stdout = "";
    let stderr = "";
    const child = spawn(options.interpreter ?? PYTHON_DEFAULTS.interpreter, pythonargv(script, options.args ?? []), {
      cwd: options.cwd,
      timeout: ceiling,
      env: { ...process.env, ...options.env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout?.setEncoding("utf8");
    child.stderr?.setEncoding("utf8");
    child.stdout?.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr?.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", (err: NodeJS.ErrnoException) => {
      timedout = err.code === "ETIMEDOUT";
      resolve({
        code: null,
        stdout,
        stderr: stderr || String(err),
        reason: timedout ? "timeout" : "error",
        durationms: Date.now() - started,
      });
    });
    child.on("close", (code, signal) => {
      const killedlate = signal === "SIGTERM" && Date.now() - started >= ceiling;
      resolve({
        code,
        stdout,
        stderr,
        reason: timedout || killedlate ? "timeout" : signal ? "error" : "exit",
        durationms: Date.now() - started,
      });
    });
  });
}

/**
 * runpython — the maestro entry: validate, merge the house defaults, hand
 * the run to the injected runner and normalize the answer. The runner is
 * the last parameter so tests inject a fake and production rides the node
 * spawn without a conditional anywhere.
 *
 * @param script the script path, relative to the sandbox cwd.
 * @param options the execution knobs (cwd required, the rest optional).
 * @param runner the runner seam, spawnpythonrunner by default.
 * @returns the normalized result of the run.
 */
export async function runpython(
  script: string,
  options: pythonoptions,
  runner: pythonrunner = spawnpythonrunner,
): Promise<pythonresult> {
  if (!script.trim()) throw new Error("runpython: the script path is empty");
  const merged: pythonoptions = { ...PYTHON_DEFAULTS, ...options };
  if (!merged.cwd.trim()) throw new Error("runpython: the sandbox cwd is empty");
  if (merged.timeoutms !== undefined && merged.timeoutms <= 0)
    throw new Error("runpython: the timeout must be positive");
  return normalizeresult(await runner(script, merged));
}

/**
 * parsejsonstdout — the opt-in json lane: parse the stdout of a result (or
 * a raw string) as one json document. Empty output, trailing noise and a
 * parse failure all answer the readable error — never a throw, so the
 * maestro branches on `ok`.
 *
 * @param source the normalized result or a raw stdout string.
 * @returns the parsed value or one readable error.
 */
export function parsejsonstdout(source: pythonresult | string): jsonanswer {
  const raw = (typeof source === "string" ? source : source.stdout).trim();
  if (!raw) return { ok: false, error: "the stdout is empty" };
  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * runpythonjson — the composed lane: one run plus the json parse of its
 * stdout, both in one answer for the maestro surfaces that speak json
 * contracts with their scripts.
 *
 * @param script the script path, relative to the sandbox cwd.
 * @param options the execution knobs (cwd required, the rest optional).
 * @param runner the runner seam, spawnpythonrunner by default.
 * @returns the normalized result and the json parse of its stdout.
 */
export async function runpythonjson(
  script: string,
  options: pythonoptions,
  runner: pythonrunner = spawnpythonrunner,
): Promise<{ result: pythonresult; json: jsonanswer }> {
  const result = await runpython(script, options, runner);
  return { result, json: parsejsonstdout(result) };
}

/**
 * exitedclean — the maestro gate over the exit code: only the success code
 * 0 answers true; a non-zero code, a timeout kill and a spawn error all
 * answer false.
 *
 * @param result the normalized result of a run.
 * @returns whether the interpreter answered success.
 */
export function exitedclean(result: pythonresult): boolean {
  return result.code === 0;
}
