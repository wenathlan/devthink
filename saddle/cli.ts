#!/usr/bin/env node
/**
 * cli.ts — the saddle command-line entry point.
 *
 * This file is the v2.0.0 grand-merge consolidation of the former nested
 * folders of the repository (cli) into the single
 * root-level domain file of the e2ugh family standard: one optimized
 * TypeScript file per correlated domain, ordinal sections, JSDoc on every
 * block, intra-domain imports dissolved, cross-domain imports rewritten to
 * ./<domain>.js. Every capability of every source file is preserved here;
 * the pure re-export barrels (none in this domain) folded their surface into this file directly.
 */

import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { argv, stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { eventbus } from "./foundation.ts";
import { localmemory, localstorage } from "./virtual.ts";
import { engine, inprocess, scheduler } from "./execution.ts";
import { mcpserver } from "./integration.ts";
import { modecatalog } from "./modes.ts";
import { creategrid, defaultplan, dockerrun, multiplex, planlint, plantoml, qemucommand, type plan } from "./index.ts";
import {
  compilewithbabel,
  dockerdescriptor,
  interpretsh,
  interpretyaml,
  interpretyml,
  runscript,
  runscriptbackground,
  scriptRunStatus,
  type ScriptPlan,
} from "./scripts.ts";

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: cli/main.ts — the saddle command-line entry point (the bin "saddle" resolves to this source through the source-is-library law (node 26 strips the types, the shebang hands the file to the runtime)). */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * the cli keeps local execution explicit and leaves remote dispatch to adapters.
 */

/** Runs one CLI command and keeps external services behind adapters. */
export async function main(args = argv.slice(2)) {
  const command = args[0] ?? "help";
  /* Help stays short and lists only stable local commands. */
  if (["help", "--help", "-h"].includes(command)) { console.log("saddle <command>\n\ncommands\n  help\n  chat\n  modes\n  plan [qemu|docker|toml]\n  vm [qemu|docker|toml]\n  vmlint\n  gpus\n  runexample\n  script <run|background|status|docker|compile> [file|runid]\n  mcp"); return; }
  if (command === "chat") { await renderchat(); return; }
  if (command === "modes") { console.log(JSON.stringify(modecatalog(), null, 2)); return; }
  if (command === "plan") { await renderplan(args[1]); return; }
  /* The vm/vmlint/gpus triad makes the nominal npm aliases (vm:create, */
  /* vm:validate, gpu:list) real: they map to the live engine surface — */
  /* the plan renderer, the planlint validator, and the gpus.json catalog. */
  if (command === "vm") { await renderplan(args[1] ?? "qemu"); return; }
  if (command === "vmlint") { await rendervmlint(); return; }
  if (command === "gpus") { await rendergpus(); return; }
  if (command === "runexample") {
    const root = await mkdtemp(join(tmpdir(), "saddlecli"));
    const events = eventbus();
    const run = engine({ storage: localstorage(root), memory: localmemory(), scheduler: scheduler([inprocess()]), events });
    const result = await run.run({ name: "cliexample", input: { hello: "saddle" } }, ({ job }) => ({ jobid: job.id, ok: true, message: "storage to working set to result" }));
    console.log(JSON.stringify({ jobid: result.job.id, artifact: result.artifact, events: events.all().length }, null, 2));
    return;
  }
  if (command === "script") { await renderscript(args[1], args[2]); return; }
  if (command === "mcp") { const server = mcpserver(); console.log(JSON.stringify({ tools: server.listtools() }, null, 2)); return; }
  throw new Error(`unknown command: ${command}`);
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the plan renderer — the architect CLI absorbed from the e2ugh */
/* engine entry (index.ts); the former `e2ugh` bin folds into the single */
/* `saddle` bin at the 2.0.0 grand merge. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * Renders one machine plan (defaulting to defaultplan, overridden by the
 * optional vm.config.toml regex fields) preceded by the MTTG multiplex
 * header — the absorbed e2ugh engine CLI entry, byte-compatible with the
 * former `node ./index.ts` invocation through the single saddle bin.
 *
 * @param format the render format: qemu (default), docker or toml.
 */
async function renderplan(format = "qemu") {
  try {
    let candidate: plan = { ...defaultplan };
    try {
      const raw = await readFile("vm.config.toml", "utf8");
      const vcpus = /vcpus = (\d+)/.exec(raw)?.[1];
      const mem = /gib = (\d+)/.exec(raw)?.[1];
      const mttg = /virtual_threads = (\d+)/.exec(raw)?.[1];
      if (vcpus !== undefined) {
        candidate = { ...candidate, vcpus: Number(vcpus) };
      }
      if (mem !== undefined) {
        candidate = { ...candidate, memorygib: Number(mem) };
      }
      if (mttg !== undefined) {
        candidate = { ...candidate, mttgthreads: Number(mttg), mttg: true };
      }
    } catch {
      /* catcher: vm.config.toml is optional; defaults stay */
    }
    const grid = creategrid(undefined, candidate.mttgthreads);
    const header = `# multiplex ${multiplex(grid).toFixed(1)}x on ${grid.host} host threads\n`;
    const body =
      format === "docker"
        ? dockerrun(candidate)
        : format === "toml"
          ? plantoml(candidate)
          : qemucommand(candidate);
    process.stdout.write(`${header}${body}\n`);
    for (const note of planlint(candidate)) {
      process.stderr.write(`# ${note}\n`);
    }
  } catch (error) {
    process.stderr.write(
      `planner failed: ${error instanceof Error ? error.message : String(error)}\n`,
    );
  }
}

/**
 * Validates the effective machine plan (defaults overridden by the optional
 * vm.config.toml fields) through planlint and prints only the advisory
 * notes — the engine behind the nominal `vm:validate` npm alias: exit code
 * stays zero because the notes are advisory, never fatal.
 */
async function rendervmlint() {
  let candidate: plan = { ...defaultplan };
  try {
    const raw = await readFile("vm.config.toml", "utf8");
    const vcpus = /vcpus = (\d+)/.exec(raw)?.[1];
    const mem = /gib = (\d+)/.exec(raw)?.[1];
    const mttg = /virtual_threads = (\d+)/.exec(raw)?.[1];
    if (vcpus !== undefined) candidate = { ...candidate, vcpus: Number(vcpus) };
    if (mem !== undefined) candidate = { ...candidate, memorygib: Number(mem) };
    if (mttg !== undefined) candidate = { ...candidate, mttgthreads: Number(mttg), mttg: true };
  } catch {
    /* catcher: vm.config.toml is optional; defaults stay */
  }
  const notes = planlint(candidate);
  console.log(`vcpus ${candidate.vcpus} memorygib ${candidate.memorygib} — ${notes.length} note(s)`);
  for (const note of notes) {
    console.log(`# ${note}`);
  }
}

/**
 * Lists the GPU catalog of the engine (gpus.json — the catalog the
 * orchestrator resolves GPU requests against) — the engine behind the
 * nominal `gpu:list` npm alias.
 */
async function rendergpus() {
  const catalog = JSON.parse(await readFile("gpus.json", "utf8")) as { gpus: Array<Record<string, unknown>> };
  console.log(`${catalog.gpus.length} gpus`);
  for (const gpu of catalog.gpus) {
    const name = String(gpu.name ?? gpu.model ?? "unknown");
    const profiles = Array.isArray(gpu.profiles) ? (gpu.profiles as unknown[]).length : 0;
    console.log(profiles > 0 ? `${name} (${profiles} mig profiles)` : name);
  }
}

/* ══════════════════════════════════════════════════════════════════ */
/* Section 3: the script lanes renderer — the sh/yml/yaml execution   */
/* surface of the engine lane (PR15): run, background, status, docker */
/* and compile ride the very scripts.ts functions the webserver        */
/* routes serve, so the bin and the api speak one lane.               */
/* ══════════════════════════════════════════════════════════════════ */
/**
 * the script lanes renderer: every descriptor subcommand reads one
 * file whose extension picks the interpretation lane and answers the
 * honest result — no faked exit codes, no silent skips.
 */

/** the poll pause the background renderer waits with (the same cadence
 * the script lanes test polls the detached record with). */
const scriptpause = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

/**
 * interprets one descriptor file into a script plan: the extension
 * picks the lane — .sh wraps the raw script as one direct step,
 * .yml and .yaml ride the house yaml subset (both spellings one lane,
 * the plan declares the babel compile lane). a missing file or an
 * unknown extension refuses honestly instead of guessing.
 *
 * @param target the descriptor file path.
 * @returns the interpreted plan.
 */
async function scriptplanfromfile(target: string): Promise<ScriptPlan> {
  if (target.length === 0) {
    throw new Error("the script subcommand requires a descriptor file (.sh, .yml or .yaml)");
  }
  const text = await readFile(target, "utf8");
  if (target.endsWith(".sh")) return interpretsh(text);
  if (target.endsWith(".yml")) return interpretyml(text);
  if (target.endsWith(".yaml")) return interpretyaml(text);
  throw new Error(`the descriptor extension of "${target}" is not one the script lanes speak (.sh, .yml, .yaml)`);
}

/**
 * Renders one script lanes subcommand: run executes the plan
 * server-side with the enforced per-step deadlines and prints the
 * honest per-step result (a failed plan exits 1); background kicks the
 * plan detached through the house job queue, prints the launch answer
 * and observes the record settle through the run status (the registry
 * lives in this process, the poll reads it the way the api consumer
 * does); status reads the observable record of one runid — honestly
 * refusing a runid another process launched (SCRIPT_RUN_NOT_FOUND,
 * the one-shot cli never carried that registry); docker emits the
 * docker-ready descriptor of the plan; compile validates the babel
 * roundtrip and prints the compiled plan.
 *
 * @param subcommand the script subcommand (run, background, status, docker, compile).
 * @param target the descriptor file path (or the runid for status).
 */
async function renderscript(subcommand = "help", target = "") {
  if (["help", "--help", "-h"].includes(subcommand)) {
    console.log(
      "saddle script <run|background|status|docker|compile> [file|runid]" +
        "\n\n  run <file>         execute the plan server-side and print the honest per-step result" +
        "\n  background <file>  kick the plan detached and observe the record settle" +
        "\n  status <runid>     read the observable record of one background run" +
        "\n  docker <file>      emit the docker-ready descriptor of the plan" +
        "\n  compile <file>     ride the babel compile roundtrip and print the compiled plan",
    );
    return;
  }
  try {
    if (subcommand === "run") {
      const plan = await scriptplanfromfile(target);
      const result = await runscript(plan);
      console.log(JSON.stringify({ source: plan.source, compiledvia: plan.compiledvia, ...result }, null, 2));
      if (result.status === "failed") process.exitCode = 1;
      return;
    }
    if (subcommand === "background") {
      const plan = await scriptplanfromfile(target);
      const launch = runscriptbackground(plan);
      console.log(JSON.stringify({ runid: launch.runid, status: launch.status, source: plan.source }, null, 2));
      let record = scriptRunStatus(launch.runid);
      const deadlineat = Date.now() + 60000;
      while (record.status !== "succeeded" && record.status !== "failed" && Date.now() < deadlineat) {
        await scriptpause(50);
        record = scriptRunStatus(launch.runid);
      }
      console.log(JSON.stringify(record, null, 2));
      if (record.status === "failed") process.exitCode = 1;
      return;
    }
    if (subcommand === "status") {
      if (target.length === 0) throw new Error("the status subcommand requires a runid");
      console.log(JSON.stringify(scriptRunStatus(target), null, 2));
      return;
    }
    if (subcommand === "docker") {
      const plan = await scriptplanfromfile(target);
      const descriptor = dockerdescriptor(plan);
      process.stdout.write(descriptor.dockerfile);
      process.stdout.write(`# entrypoint (docker run): ${descriptor.entrypoint}\n`);
      return;
    }
    if (subcommand === "compile") {
      const plan = await scriptplanfromfile(target);
      const compiled = await compilewithbabel(plan);
      console.log(JSON.stringify(compiled, null, 2));
      return;
    }
    throw new Error(`unknown script subcommand: ${subcommand}`);
  } catch (error) {
    process.stderr.write(`script lane failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: the chat console — the pr13 creation workspace seat: the */
/* same windows 11 chat console the family clibin seats render, with   */
/* the same tokens, the same titlebar and the same dpi ladder (native  */
/* detection, 1x / 1.5x / 2x / 3x, never xdpi — the difference from    */
/* the web / desktop surface is only the responsiveness).              */
/* ════════════════════════════════════════════════════════════════════ */

/** the chat accent of the prompt and the titlebar name (ansi 117 — the family accent #a3d7e6). */
const CHATACCENT = "\x1b[38;5;117m" as const;
/** the focus ink of the active top rule (ansi 75 — the family focus #4cc2ff). */
const CHATFOCUS = "\x1b[38;5;75m" as const;
/** the hover red of the unknown-command rows (ansi 203 — rgb(232, 17, 35)). */
const CHATHOVER = "\x1b[38;5;203m" as const;
/** the dim ink of the description rows (the minimal text law). */
const CHATINK = "\x1b[2m" as const;
/** the reset token that closes every colored run. */
const CHATRESET = "\x1b[0m" as const;
/** the single glyph of the rules and the rails. */
const CHATBAR = "─" as const;
/** the engine ownership one-liner of the seat, quoted from the README. */
const CHATENGINE = "storage-backed jobs, ninety sandbox modalities and portable runners — the master engine of virtualization (README)" as const;
/** the scale ladder the native detection resolves (the automatic scaling law). */
const CHATSCALESTEPS = [1, 1.5, 2, 3] as const;

/** the dpi frame the chat chrome renders inside: the resolved scale seat, the terminal columns and the rail length the titlebar draws. */
interface chatframe {
  /** the scale seat of the ladder (1, 1.5, 2 or 3). */
  scale: number;
  /** the columns the terminal answers (windows terminal, conpty, xterm, tmux — every pty reports them). */
  columns: number;
  /** the titlebar rail length in cells (the pixel rail folded to the grid and clamped so the line never wraps). */
  rail: number;
}

/** resolves the dpi frame natively, zero dependencies: the columns come from stdout (every windows and linux terminal answers them), the scale seat from the column ladder — the explicit SADDLE_DPI environment override wins first (the native scaling knob). */
function chatdetectframe(): chatframe {
  const columns = Number.isFinite(stdout.columns) && Number(stdout.columns) > 0 ? Number(stdout.columns) : 80;
  const override = Number(process.env.SADDLE_DPI ?? "");
  const scale =
    Number.isFinite(override) && override > 0 && CHATSCALESTEPS.includes(override as (typeof CHATSCALESTEPS)[number])
      ? override
      : columns >= 200
        ? 3
        : columns >= 160
          ? 2
          : columns >= 120
            ? 1.5
            : 1;
  const rail = Math.max(4, Math.min(Math.round(24 * scale), columns - "saddle".length - 16));
  return { scale, columns, rail };
}

/** runs the chat console: the titlebar, the top rule, the ❯ prompt and the dispatch (help, version, dpi, engine, exit) — the same chat look the web / desktop surfaces carry, an eof on stdin closing the console the same way exit does. */
async function renderchat(): Promise<void> {
  const frame = chatdetectframe();
  let seatversion = "0.0.0";
  try {
    seatversion = String((JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf8")) as { version?: string }).version ?? "0.0.0");
  } catch {
    /* the guarded best-effort read answers the zero literal the version row prints */
  }
  const rl = createInterface({ input: stdin, output: stdout });
  let eof = false;
  rl.on("close", () => { eof = true; });
  const rule = CHATBAR.repeat(Math.max(3, Math.round(3 * frame.scale)));
  console.log(`${CHATACCENT}┌ saddle ─ cli${CHATRESET}  ${CHATINK}${CHATBAR.repeat(frame.rail)} ─ ❐ ✕${CHATRESET}`);
  console.log(`${CHATFOCUS}${rule} saddle ${rule}${CHATRESET}`);
  console.log(`${CHATACCENT}saddle${CHATRESET} ${CHATINK}v${seatversion}${CHATRESET}`);
  console.log(`${CHATINK}the saddle console — same design as web / desktop, only the DPI differs. type help.${CHATRESET}`);
  rl.setPrompt(`${CHATACCENT}❯${CHATRESET} `);
  rl.prompt();
  for await (const raw of rl) {
    const line = raw.trim();
    const command = line.length > 0 ? line.split(/\s+/)[0]!.toLowerCase() : "";
    if (command === "exit") rl.close();
    else if (command === "help") {
      console.log(`${CHATINK}commands${CHATRESET}`);
      console.log(`  help      ${CHATINK}this list${CHATRESET}`);
      console.log(`  version   ${CHATINK}the package version, read from package.json at runtime${CHATRESET}`);
      console.log(`  dpi       ${CHATINK}the resolved dpi seat of this terminal (scale, columns, rail)${CHATRESET}`);
      console.log(`  engine    ${CHATINK}the engine ownership one-liner of the app${CHATRESET}`);
      console.log(`  exit      ${CHATINK}close the console${CHATRESET}`);
    }
    else if (command === "version") console.log(`${CHATACCENT}saddle${CHATRESET} ${seatversion}`);
    else if (command === "dpi") console.log(`${CHATACCENT}saddle${CHATRESET} ${CHATINK}dpi seat ${frame.scale}x on ${frame.columns} columns — rail ${frame.rail} cells, ladder 1x / 1.5x / 2x / 3x${CHATRESET}`);
    else if (command === "engine") console.log(`${CHATINK}${CHATENGINE}${CHATRESET}`);
    else if (command.length > 0) console.log(`${CHATHOVER}✕${CHATRESET} ${CHATINK}unknown command: ${command} — type help${CHATRESET}`);
    if (command === "exit") break;
    /* the prompt is cosmetic chrome: a piped stdin that already reached eof skips it, the buffered lines still answer. */
    if (!eof) rl.prompt();
  }
  console.log(`${CHATINK}saddle console closed.${CHATRESET}`);
}

if (import.meta.url === `file://${argv[1]}`) main().catch((error) => { console.error(error); process.exitCode = 1; });
