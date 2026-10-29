/**
 * scriptlanes.ts — the script lanes of the saddle engine: sh execution
 * through the universal runner, yml and yaml workflow descriptors
 * interpreted and compiled through babel into executable job plans,
 * background execution through the house job queue, and docker-ready
 * descriptors for the container lane.
 *
 * The lanes this file opens answer the modalities the registry declares
 * (runner-universal for the bash lane, runner-babel for the compile lane,
 * container-docker for the descriptor lane) and keep the owner's PR15
 * mandate verbatim: "Implemente execução de SHs / interpretação de YML /
 * YAML com compilação via Babel para permitir execução em segundo plano /
 * Docker".
 *
 * The laws every lane below keeps:
 * - sh scripts execute server-side through the engine (the bash lane),
 *   never the visitor machine: every public run entry refuses a scope
 *   that carries window or document (assertservercontext);
 * - yml and yaml descriptors interpret into executable job plans through
 *   the house yaml subset (documented at the parser), and the babel lane
 *   compiles the descriptor through @babel/core into a regenerated
 *   literal the engine parses back through node:vm — the roundtrip is
 *   validated, never presumed;
 * - background execution rides the house jobqueue and the runstatuses
 *   vocabulary (created, submitted, running, succeeded, failed,
 *   cancelled): the lane kicks the run detached from the caller and the
 *   status stays observable through scriptRunStatus;
 * - honest execution only: no faked results, a {code, message} shape on
 *   every fallible path, and deadlines enforced with a timeout kill on
 *   the child process.
 */

import { spawn } from "node:child_process";
import { runInNewContext } from "node:vm";
import { jobqueue, runrecord, runstatuses, transitionrun } from "./execution.js";
import { aserror, idfactory, saddleerror, validationerror } from "./foundation.js";

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the server context law and the plan nouns — the lanes never touch the visitor machine. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * the server context law and the plan nouns: the types the lanes speak
 * and the refusal every public run entry carries.
 */

/** one interpreted step of a script plan: the name the run reports, the
 * sh text the bash lane executes, and the optional per-step deadline in
 * milliseconds. */
export type ScriptStep = { name: string; run: string; timeoutms?: number };

/** an executable job plan: the steps in execution order, the descriptor
 * source the plan was interpreted from, and the compile lane the plan
 * rides (direct for the sh lane, babel for the yml and yaml lanes —
 * compilewithbabel performs the babel lane and stamps it). */
export type ScriptPlan = {
  steps: ScriptStep[];
  source: "sh" | "yml" | "yaml";
  compiledvia: "babel" | "direct";
};

/** the run options the execution lanes accept: the storage handle is
 * carried for the engine commit lane (the script lane itself executes
 * and answers — it never pretends a commit), and deadlinems is the
 * fallback deadline for steps that carry no timeoutms of their own. */
export type ScriptRunOptions = { storage?: unknown; deadlinems?: number };

/** one honestly observed step execution: the exit code (null when the
 * step never ran — skipped, killed or unspawnable), the captured
 * streams, the measured duration, and the skip or timeout flags. */
export type ScriptStepResult = {
  name: string;
  exitcode: number | null;
  stdout: string;
  stderr: string;
  durationms: number;
  skipped?: boolean;
  timedout?: boolean;
  signal?: string | null;
  truncated?: boolean;
  error?: { code: string; message: string };
};

/** the honest result of one plan run: succeeded only when every step
 * exited zero, failed with the first failure otherwise. */
export type ScriptRunResult = {
  status: "succeeded" | "failed";
  steps: ScriptStepResult[];
  error?: { code: string; message: string };
};

/** the observable record of one background run: the runstatuses
 * vocabulary the transitions walk, plus the result once the detached run
 * settles. */
export type ScriptRunRecord = {
  version: number;
  requestid: string;
  name: string;
  status: string;
  runid?: string;
  attempt: number;
  createdat: number;
  updatedat: number;
  history: Array<{ from: string; to: string; at: number; reason?: string }>;
  metadata: Record<string, unknown>;
  result?: ScriptRunResult;
};

/** refuses a scope that carries window or document: the script lanes
 * execute server-side only, and the visitor machine is never touched
 * (the never-the-visitor-browser law). every public run entry calls
 * this before any work. */
export function assertservercontext(scope: Record<string, unknown> = globalThis): void {
  if (scope.window !== undefined || scope.document !== undefined) {
    throw saddleerror("the script lanes execute server-side only — the visitor browser context is refused", {
      code: "VISITOR_CONTEXT_REFUSED",
      details: { window: scope.window !== undefined, document: scope.document !== undefined },
    });
  }
}

/** validates a script plan honestly: a non-empty steps array where every
 * step carries a non-empty string name, a string run and an optional
 * positive finite timeoutms, with a known source and compile lane. */
function validateplan(plan: unknown): ScriptPlan {
  if (!plan || typeof plan !== "object") throw validationerror("the script plan must be an object");
  const candidate = plan as Partial<ScriptPlan> & { steps?: unknown };
  if (!Array.isArray(candidate.steps) || candidate.steps.length === 0) {
    throw validationerror("the script plan must carry a non-empty steps array");
  }
  for (const step of candidate.steps) {
    if (!step || typeof step !== "object") throw validationerror("every script step must be an object");
    const record = step as Partial<ScriptStep>;
    if (typeof record.name !== "string" || record.name.trim().length === 0) {
      throw validationerror("every script step requires a non-empty string name");
    }
    if (typeof record.run !== "string")
      throw validationerror(`the step "${record.name}" requires a string run command`);
    if (
      record.timeoutms !== undefined &&
      (typeof record.timeoutms !== "number" || !Number.isFinite(record.timeoutms) || record.timeoutms < 1)
    ) {
      throw validationerror(`the step "${record.name}" timeoutms must be a positive finite number`);
    }
  }
  if (!["sh", "yml", "yaml"].includes(candidate.source ?? "")) {
    throw validationerror("the script plan source must be sh, yml or yaml");
  }
  if (!["babel", "direct"].includes(candidate.compiledvia ?? "")) {
    throw validationerror("the script plan compile lane must be babel or direct");
  }
  return candidate as ScriptPlan;
}

/** validates the shared deadline option: absent passes as undefined, a
 * present value must be a positive finite number of milliseconds. */
function validatedeadline(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 1) {
    throw validationerror("the script run deadlinems must be a positive finite number of milliseconds");
  }
  return value;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the interpretation lanes — the sh wrap and the house yaml subset parser. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * the interpretation lanes: interpretsh wraps a raw sh script as one
 * direct step, and the house yaml subset parser reads the workflow
 * descriptors (yml and yaml spellings) into step lists.
 */

/** wraps a raw sh script as a one-step plan: the script rides the bash
 * lane directly, no compile step, so the plan declares the direct lane. */
export function interpretsh(script: string): ScriptPlan {
  if (typeof script !== "string" || script.trim().length === 0) {
    throw validationerror("the sh script must be a non-empty string");
  }
  return { steps: [{ name: "script", run: script }], source: "sh", compiledvia: "direct" };
}

/** the yaml error factory: every interpret failure throws the honest
 * house shape with the YAML_INTERPRET_FAILED code. */
function yamlerror(message: string) {
  return saddleerror(`the yml interpretation failed: ${message}`, { code: "YAML_INTERPRET_FAILED" });
}

/** strips a `#` comment the way yaml does: outside quotes, and only at
 * line start or after whitespace (a `#` glued to a word is content). */
function striphyamlcomment(line: string): string {
  let quote: string | null = null;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quote) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "#" && (index === 0 || line[index - 1] === " " || line[index - 1] === "\t")) {
      return line.slice(0, index);
    }
  }
  return line;
}

/** parses one scalar of the house subset: a plain string, a double- or
 * single-quoted string, an integer or decimal, or one of the two
 * booleans. the subset never invents types beyond these (nulls, dates
 * and exponents stay plain strings — documented, not silently coerced). */
function parsehousescalar(raw: string, lineno: number): string | number | boolean {
  const text = raw.trim();
  if (text.length === 0) {
    throw yamlerror(`line ${lineno}: the value after the colon is empty (block scalars are outside the house subset)`);
  }
  if (text.length >= 2 && text.startsWith('"') && text.endsWith('"')) {
    const inner = text.slice(1, -1);
    if (inner.includes('"')) throw yamlerror(`line ${lineno}: an unescaped double quote rides inside a quoted scalar`);
    return inner;
  }
  if (text.length >= 2 && text.startsWith("'") && text.endsWith("'")) {
    return text.slice(1, -1).replace(/''/g, "'");
  }
  if (text === "true") return true;
  if (text === "false") return false;
  if (/^-?\d+$/.test(text) || /^-?\d+\.\d+$/.test(text)) return Number(text);
  return text;
}

/** the house yaml subset the lane interprets, documented honestly:
 * exactly one top-level mapping key — `steps:` — whose value is an
 * indented list of flat mappings; every list item carries `name:` (a
 * string), `run:` (a string) and the optional `timeoutms:` (a positive
 * number); values are single-line scalars (plain or quoted strings,
 * integers, decimals, true and false); comments start at a `#` outside
 * quotes after whitespace; every list line shares one indentation and
 * every key of one item shares a deeper one — a dedent or a mismatch is
 * an honest refusal, never a guess. unknown keys, duplicate keys,
 * document markers, nested mappings and block scalars are all outside
 * the subset and refuse with YAML_INTERPRET_FAILED. */
function parsehousesubset(text: string): ScriptStep[] {
  if (typeof text !== "string") throw validationerror("the yml descriptor must be a string");
  const steps: ScriptStep[] = [];
  const lines = text.split(/\r?\n/);
  let sawsteps = false;
  let itemindent = -1;
  let fieldindent = -1;
  let current: Map<string, string | number | boolean> | null = null;

  function closecurrent(lineno: number) {
    if (!current) return;
    const name = current.get("name");
    const run = current.get("run");
    const timeoutms = current.get("timeoutms");
    if (typeof name !== "string" || name.trim().length === 0) {
      throw yamlerror(`line ${lineno}: every step requires a non-empty string name`);
    }
    if (typeof run !== "string") throw yamlerror(`line ${lineno}: the step "${name}" requires a string run command`);
    if (timeoutms !== undefined && (typeof timeoutms !== "number" || !Number.isFinite(timeoutms) || timeoutms < 1)) {
      throw yamlerror(`line ${lineno}: the step "${name}" timeoutms must be a positive number`);
    }
    steps.push(timeoutms === undefined ? { name, run } : { name, run, timeoutms });
    current = null;
  }

  function parsefield(content: string, lineno: number) {
    const match = /^([A-Za-z][A-Za-z0-9_-]*):(?:[ \t]+(.*))?$/.exec(content);
    if (!match) throw yamlerror(`line ${lineno}: the house subset speaks "key: value" lines — malformed: ${content}`);
    const key = match[1];
    if (!["name", "run", "timeoutms"].includes(key)) {
      throw yamlerror(`line ${lineno}: unknown key "${key}" — the house subset carries name, run and timeoutms only`);
    }
    if (current?.has(key)) throw yamlerror(`line ${lineno}: the key "${key}" appears twice in one step`);
    if (match[2] === undefined || match[2].trim().length === 0) {
      throw yamlerror(`line ${lineno}: the value for "${key}" is missing (block scalars are outside the house subset)`);
    }
    current?.set(key, parsehousescalar(match[2], lineno));
  }

  for (let index = 0; index < lines.length; index += 1) {
    const lineno = index + 1;
    const stripped = striphyamlcomment(lines[index]).replace(/\s+$/, "");
    if (stripped.trim().length === 0) continue;
    const indent = stripped.length - stripped.replace(/^ +/, "").length;
    const content = stripped.trim();

    if (!sawsteps) {
      if (indent !== 0)
        throw yamlerror(`line ${lineno}: the descriptor must open with the top-level steps key at column zero`);
      if (content !== "steps:") {
        throw yamlerror(
          `line ${lineno}: the house subset carries exactly one top-level key (steps) — found: ${content}`,
        );
      }
      sawsteps = true;
      continue;
    }

    if (content === "-" || content.startsWith("- ")) {
      closecurrent(lineno);
      if (itemindent === -1) {
        if (indent === 0) throw yamlerror(`line ${lineno}: the steps list must be indented under the steps key`);
        itemindent = indent;
      } else if (indent !== itemindent) {
        throw yamlerror(
          `line ${lineno}: the steps list items must share one indentation (expected column ${itemindent}, found ${indent})`,
        );
      }
      current = new Map();
      fieldindent = -1;
      const inline = content === "-" ? "" : content.slice(2).trim();
      if (inline.length > 0) {
        fieldindent = stripped.indexOf(inline);
        parsefield(inline, lineno);
      }
      continue;
    }

    if (!current) throw yamlerror(`line ${lineno}: a steps entry must start with a list dash (found: ${content})`);
    if (indent === 0) {
      throw yamlerror(`line ${lineno}: a second top-level key arrived after the steps list: ${content}`);
    }
    if (fieldindent === -1) {
      if (indent <= itemindent)
        throw yamlerror(`line ${lineno}: a bare list dash must be followed by deeper-indented keys`);
      fieldindent = indent;
    }
    if (indent !== fieldindent) {
      throw yamlerror(
        `line ${lineno}: bad indentation — the keys of one step must share column ${fieldindent} (found column ${indent})`,
      );
    }
    parsefield(content, lineno);
  }
  closecurrent(lines.length);
  if (!sawsteps) throw yamlerror("the descriptor never carries the top-level steps key");
  if (steps.length === 0) throw yamlerror("the steps list is empty — the descriptor must carry at least one step");
  return steps;
}

/** interprets a yml workflow descriptor into an executable job plan
 * through the house yaml subset; the plan declares the babel compile
 * lane (compilewithbabel performs it). a parse failure throws the honest
 * YAML_INTERPRET_FAILED code. */
export function interpretyml(text: string): ScriptPlan {
  return { steps: parsehousesubset(text), source: "yml", compiledvia: "babel" };
}

/** interprets a yaml workflow descriptor — the same house subset under
 * the yaml spelling, so both file extensions ride one lane. */
export function interpretyaml(text: string): ScriptPlan {
  return { steps: parsehousesubset(text), source: "yaml", compiledvia: "babel" };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: the babel compile lane — the descriptor roundtrips through @babel/core and node:vm. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * the babel compile lane: the plan descriptor is serialized to a
 * javascript literal, regenerated through @babel/core transformSync (no
 * presets — the transform parses and re-emits the source), and parsed
 * back through node:vm runInNewContext in a fresh context that carries
 * no globals, so the compiled text is data, never executable logic. the
 * roundtrip is validated against the input plan — a loss refuses with
 * BABEL_COMPILE_FAILED instead of degrading, and a missing @babel/core
 * refuses with BABEL_RUNTIME_ABSENT.
 */

/** the honest refusal when @babel/core is not resolvable at runtime. */
function babelabsenterror(cause?: unknown) {
  return saddleerror(
    "the babel compile lane requires @babel/core at runtime and it is absent in this install — the compile refuses instead of degrading",
    { code: "BABEL_RUNTIME_ABSENT", cause, details: { lane: "runner-babel" } },
  );
}

/** compiles a script plan through the babel lane: serialize the plan to
 * a javascript literal, transform it through @babel/core (no presets,
 * no config files — the minimal options the runtime carries), parse the
 * regenerated source back through node:vm, validate the roundtrip kept
 * every step and the source, and return the plan stamped
 * compiledvia "babel". */
export async function compilewithbabel(plan: ScriptPlan): Promise<ScriptPlan> {
  assertservercontext();
  validateplan(plan);
  let transform: ((code: string, options: Record<string, unknown>) => { code: string } | null) | null = null;
  try {
    const mod = (await import("@babel/core")) as Record<string, unknown>;
    const candidate = mod.transformSync ?? (mod.default as Record<string, unknown> | undefined)?.transformSync;
    if (typeof candidate === "function") {
      transform = candidate as (code: string, options: Record<string, unknown>) => { code: string } | null;
    }
  } catch (error) {
    throw babelabsenterror(error);
  }
  if (!transform) throw babelabsenterror();

  const serialized = `(${JSON.stringify({ steps: plan.steps, source: plan.source }, null, 2)});`;
  let compiled: string;
  try {
    const result = transform(serialized, { configFile: false, babelrc: false, filename: "scriptplan.js" });
    if (result === null || typeof result.code !== "string") throw new Error("the babel transform returned no code");
    compiled = result.code;
  } catch (error) {
    const failure = error as Error;
    throw saddleerror(
      `the babel compile of the ${plan.source} descriptor failed: ${String(failure?.message ?? failure)}`,
      {
        code: "BABEL_COMPILE_FAILED",
        cause: error,
      },
    );
  }

  let parsed: unknown;
  try {
    parsed = runInNewContext(compiled, {}, { timeout: 5000 });
  } catch (error) {
    throw saddleerror("the compiled descriptor did not parse back through the vm lane", {
      code: "BABEL_COMPILE_FAILED",
      cause: error,
    });
  }

  const roundtripped = parsed as { steps?: unknown; source?: unknown };
  if (JSON.stringify(roundtripped?.steps) !== JSON.stringify(plan.steps) || roundtripped?.source !== plan.source) {
    throw saddleerror("the babel roundtrip lost plan content — the compile is refused, never faked", {
      code: "BABEL_COMPILE_FAILED",
    });
  }
  /* the validated plan steps ride onward (the vm objects live in the
     fresh context and are the proof of the roundtrip, not the payload) */
  return { steps: plan.steps, source: plan.source, compiledvia: "babel" };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: the execution lane — sequential server-side bash with enforced deadlines. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * the execution lane: every step runs server-side through `bash -c` on
 * the engine machine (the runner-universal lane), with the exit code,
 * both streams and the duration captured honestly. a failing step fails
 * the plan and the later steps are skipped — reported as skipped, never
 * silently dropped.
 */

/** the default per-step deadline when neither the step nor the caller
 * carries one: ten seconds, the house default the mandate names. */
const DEFAULTSTEPTIMEOUTMS = 10000;

/** the stream capture cap (about one megabyte per stream): the lane
 * keeps draining past the cap but stops accumulating, and flags the
 * truncation on the step record so the report never lies about size. */
const STREAMCAP = 1_000_000;

/** builds the honest failure entry for a step that could not spawn. */
function spawnfailure(step: ScriptStep, error: unknown) {
  const failure = error as Error;
  return {
    code: "SCRIPT_SPAWN_FAILED",
    message: `the bash lane could not spawn the step "${step.name}": ${String(failure?.message ?? failure)}`,
  };
}

/** runs one step through `bash -c` with a timeout kill: the child is
 * spawned with piped streams, the deadline timer sends SIGKILL when it
 * fires, and the record carries the exit code, the signal, both captured
 * streams (capped honestly), the duration and the failure entry. */
function runstep(step: ScriptStep, timeoutms: number): Promise<ScriptStepResult> {
  return new Promise((resolve) => {
    const startedat = Date.now();
    let stdout = "";
    let stderr = "";
    let stdouttruncated = false;
    let stderrtruncated = false;
    let timedout = false;
    let settled = false;
    const finish = (record: ScriptStepResult) => {
      if (settled) return;
      settled = true;
      resolve(record);
    };

    let child: ReturnType<typeof spawn>;
    try {
      child = spawn("bash", ["-c", step.run], { stdio: ["ignore", "pipe", "pipe"] });
    } catch (error) {
      finish({
        name: step.name,
        exitcode: null,
        signal: null,
        stdout: "",
        stderr: "",
        durationms: Date.now() - startedat,
        error: spawnfailure(step, error),
      });
      return;
    }

    const timer = setTimeout(() => {
      timedout = true;
      child.kill("SIGKILL");
    }, timeoutms);

    const capture = (chunk: Buffer, target: "stdout" | "stderr") => {
      const text = chunk.toString("utf8");
      if (target === "stdout") {
        if (stdout.length < STREAMCAP) stdout += text;
        else stdouttruncated = true;
      } else if (stderr.length < STREAMCAP) stderr += text;
      else stderrtruncated = true;
    };
    child.stdout?.on("data", (chunk: Buffer) => capture(chunk, "stdout"));
    child.stderr?.on("data", (chunk: Buffer) => capture(chunk, "stderr"));

    child.on("error", (error: Error) => {
      clearTimeout(timer);
      finish({
        name: step.name,
        exitcode: null,
        signal: null,
        stdout,
        stderr,
        durationms: Date.now() - startedat,
        error: spawnfailure(step, error),
      });
    });

    child.on("close", (exitcode: number | null, signal: string | null) => {
      clearTimeout(timer);
      const ok = exitcode === 0 && !timedout;
      finish({
        name: step.name,
        exitcode,
        signal,
        stdout,
        stderr,
        durationms: Date.now() - startedat,
        timedout: timedout || undefined,
        truncated: stdouttruncated || stderrtruncated || undefined,
        error: ok
          ? undefined
          : timedout
            ? {
                code: "STEP_DEADLINE_EXCEEDED",
                message: `the step "${step.name}" exceeded its ${timeoutms}ms deadline and was killed`,
              }
            : {
                code: "SCRIPT_STEP_FAILED",
                message: `the step "${step.name}" exited with code ${exitcode}`,
              },
      });
    });
  });
}

/** executes a script plan sequentially server-side: each step runs
 * through `bash -c` with the deadline `step.timeoutms ?? the caller
 * deadlinems ?? ten seconds`, the exit code and both streams are
 * captured, a failing step fails the plan honestly and every later step
 * is skipped with a null exit code and the skipped flag. the storage
 * option is carried for the engine commit lane — this lane executes and
 * answers, it never pretends a commit. */
export async function runscript(plan: ScriptPlan, options: ScriptRunOptions = {}): Promise<ScriptRunResult> {
  assertservercontext();
  validateplan(plan);
  const deadlinems = validatedeadline(options.deadlinems);
  const steps: ScriptStepResult[] = [];
  let failure: { code: string; message: string } | undefined;

  for (const step of plan.steps) {
    if (failure) {
      steps.push({
        name: step.name,
        exitcode: null,
        signal: null,
        stdout: "",
        stderr: "",
        durationms: 0,
        skipped: true,
      });
      continue;
    }
    const timeoutms = step.timeoutms ?? deadlinems ?? DEFAULTSTEPTIMEOUTMS;
    const record = await runstep(step, timeoutms);
    steps.push(record);
    if (record.exitcode !== 0) {
      failure = record.error ?? { code: "SCRIPT_STEP_FAILED", message: `the step "${step.name}" failed` };
    }
  }
  return failure === undefined ? { status: "succeeded", steps } : { status: "failed", steps, error: failure };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 5: the background lane — detached runs in the house job queue with observable statuses. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * the background lane: runscriptbackground registers the run as a house
 * run record (the runstatuses vocabulary), queues the execution through
 * the execution.ts jobqueue (one attempt — script side effects never
 * replay), kicks it without awaiting and returns immediately; the
 * statuses stay observable through scriptRunStatus until the detached
 * run settles with its result.
 */

/** the id factory the background lane stamps run ids with. */
const scriptrunids = idfactory();

/** the house job queue the detached script runs ride: concurrency two
 * (background lanes may overlap), one attempt per run (a failed script
 * is reported, never silently retried — honest execution only). */
const scriptlanequeue = jobqueue({ concurrency: 2, maxattempts: 1, retryall: false });

/** the registry of background runs this process carries: runid to the
 * mutable record holder with the result once the run settles. */
const scriptruns = new Map<string, { record: ScriptRunRecord; result?: ScriptRunResult }>();

/** settles one background run: walks the legal transition and stores the
 * result. the transition from running to succeeded or failed is the one
 * legal close of the lane, so a refusal here keeps the record as it was
 * and never invents a status. */
function finalizescriptrun(runid: string, status: "succeeded" | "failed", result: ScriptRunResult) {
  const holder = scriptruns.get(runid);
  if (!holder) return;
  try {
    holder.record = transitionrun(holder.record, status, {
      reason: `the detached run settled as ${result.status}`,
    }) as ScriptRunRecord;
  } catch {
    /* the transition refused — the record stays where it was and the
       result below still tells the truth about the execution */
  }
  holder.result = result;
}

/** kicks a script plan in the background: the run is registered as a
 * house run record, queued through the house job queue and executed
 * without awaiting — the call returns {runid, status} immediately and
 * the statuses stay observable through scriptRunStatus (created,
 * running, succeeded, failed — the runstatuses vocabulary). */
export function runscriptbackground(
  plan: ScriptPlan,
  options: ScriptRunOptions = {},
): { runid: string; status: string } {
  assertservercontext();
  validateplan(plan);
  validatedeadline(options.deadlinems);

  const runid = scriptrunids.next("scriptrun");
  let record = runrecord({
    requestid: runid,
    name: `scriptlane-${plan.source}`,
    status: "created",
    runid,
    metadata: { source: plan.source, compiledvia: plan.compiledvia, stepcount: plan.steps.length },
  }) as ScriptRunRecord;
  const holder: { record: ScriptRunRecord; result?: ScriptRunResult } = { record };
  scriptruns.set(runid, holder);

  record = transitionrun(record, "submitted", {
    runid,
    reason: "the script lane queued the run in the house job queue",
  }) as ScriptRunRecord;
  record = transitionrun(record, "running", {
    reason: "the script lane kicked the run detached from the caller",
  }) as ScriptRunRecord;
  holder.record = record;

  void scriptlanequeue
    .add(plan, async () => runscript(plan, options), { id: runid })
    .then(
      (result: ScriptRunResult) => {
        finalizescriptrun(runid, result.status === "succeeded" ? "succeeded" : "failed", result);
      },
      (error: unknown) => {
        const failure = aserror(error, runid);
        finalizescriptrun(runid, "failed", {
          status: "failed",
          steps: [],
          error: { code: failure.code, message: failure.message },
        });
      },
    );

  return { runid, status: record.status };
}

/** reads the observable record of one background run: the runstatuses
 * vocabulary status, the auditable transition history, and the result
 * once the detached run settled. an unknown runid refuses with the
 * honest SCRIPT_RUN_NOT_FOUND code. */
export function scriptRunStatus(runid: string): ScriptRunRecord & { result?: ScriptRunResult } {
  assertservercontext();
  const key = String(runid ?? "");
  const holder = scriptruns.get(key);
  if (!holder) {
    throw saddleerror(`the script run is unknown: ${key}`, { code: "SCRIPT_RUN_NOT_FOUND", details: { runid: key } });
  }
  if (!runstatuses.includes(holder.record.status)) {
    throw saddleerror(`the script run record carries an out-of-vocabulary status: ${holder.record.status}`, {
      code: "SCRIPT_RUN_CORRUPT",
      details: { runid: key },
    });
  }
  return { ...holder.record, history: [...holder.record.history], result: holder.result };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 6: the docker lane — docker-ready descriptors for the container modality. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * the docker lane: dockerdescriptor emits the docker-ready descriptor
 * the container modality (container-docker) consumes — a Dockerfile on
 * the house node base with every step as an escaped RUN line, plus the
 * verbatim plan script and the sh entrypoint.
 */

/** the house node base image the descriptor pins: the Dockerfile
 * saddle-runtime stage rides FROM node:26.8.1-slim (the node-engine
 * service image), so the descriptor asks for the base the house
 * actually pins rather than a floating tag. */
export const SCRIPTLANES_NODE_BASE = "node:26.8.1-slim";

/** the heredoc sentinel of the plan script block: a quoted delimiter
 * keeps the content verbatim (no expansion, quotes survive), and a
 * descriptor whose script carries the sentinel itself refuses honestly
 * instead of corrupting the block. */
const PLANHEREDOCSENTINEL = "SCRIPTLANES-PLAN-EOF";

/** escapes a step command for one dockerfile RUN line: the backslash
 * first (so the other escapes cannot be forged), then the double quote
 * and the dollar sign (the container shell never expands the plan), and
 * a newline folds to an escaped \n so every step rides exactly one RUN
 * line — the multi-line safety of the lane. */
function dockerescape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\$/g, "\\$").replace(/\r?\n/g, "\\n");
}

/** emits the docker-ready descriptor for the container lane: a
 * Dockerfile on the house node base carrying every step as an escaped
 * RUN line (bash -c with the quotes and dollars escaped), the verbatim
 * plan script written through a quoted heredoc COPY, and the sh
 * entrypoint that runs it. the returned entrypoint matches the
 * ENTRYPOINT line of the emitted Dockerfile. */
export function dockerdescriptor(plan: ScriptPlan): { dockerfile: string; entrypoint: string } {
  assertservercontext();
  validateplan(plan);

  const runlines = plan.steps.map((step) => `RUN bash -c "${dockerescape(step.run)}"`);
  const planscript = plan.steps.map((step) => `# ${step.name}\n${step.run}`).join("\n");
  if (planscript.split(/\r?\n/).some((line) => line.trim() === PLANHEREDOCSENTINEL)) {
    throw saddleerror(
      "the plan script carries the heredoc sentinel — the docker descriptor refuses instead of corrupting",
      {
        code: "SCRIPTLANES_DESCRIPTOR_UNSAFE",
      },
    );
  }

  const dockerfile = [
    `# docker-ready descriptor generated by the saddle script lanes (source: ${plan.source}, compile lane: ${plan.compiledvia}).`,
    `FROM ${SCRIPTLANES_NODE_BASE}`,
    "WORKDIR /app",
    ...runlines,
    `COPY <<'${PLANHEREDOCSENTINEL}' /app/plan.sh`,
    planscript,
    PLANHEREDOCSENTINEL,
    'ENTRYPOINT ["bash", "/app/plan.sh"]',
    "",
  ].join("\n");
  return { dockerfile, entrypoint: "bash /app/plan.sh" };
}
