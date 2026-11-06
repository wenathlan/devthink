// # edgelandes.ts — the one keyword file of the edge lane domain: the
// consolidation law of the root (one keyword file per domain) merged the
// six wave files of the ninety modalities into this seat — the base
// contract lanes (the former edgelandes.ts body below), the network
// resolution lanes (edgelandesnet.ts), the host binary lanes
// (edgelandeshost.ts), the in-process lanes (edgelandesinproc.ts), the
// virtual hardware composition lanes (edgelandesvirtual.ts) and the
// merge seat of the ninety table (edgelandesninety.ts) — every export
// preserved verbatim, zero logic changes, the dispatch table untouched
// (edgelanespecsall: ninety rows, edgelaneexecutorsall: zero gaps).
// The consolidation notes: the helpers the waves duplicated verbatim
// (errormessage, encodeline, utf8, netmime, OUTPUTCAPBYTES, ProcessRun,
// racedeadline) ride once in their first section; the lane consts the
// waves deliberately double-declared under one name (the dispatch
// reality law: the real wire seat wins the shared ids over the
// rehearsal seat) carry their group suffix in the later sections —
// runhostprocesshost / writeinputsfilehost / containerghcrlanehost /
// containerlitelanehost / containermaxlanehost / runtimeclrlanehost of
// the host section, parsemanifestinproc / networkdnslaneinproc /
// networkdohlaneinproc / ramswapfilelaneinproc / ramtmpfslaneinproc /
// ramzramlaneinproc / storagelibsqllaneinproc / storagemysqllaneinproc /
// storages3laneinproc of the in-process section and parsemanifestvirtual
// of the virtual section — so both surfaces stay live in one file.

import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import { createHash, createHmac } from "node:crypto";
import { Resolver } from "node:dns/promises";
import { existsSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { connect } from "node:net";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import {
  bootSequence,
  type CpuSpec,
  type CpuTopology,
  clinfoSummary,
  cpudata,
  freeh,
  type GpuSpec,
  getcpu,
  getcpubyid,
  getgpu,
  getmig,
  glxinfoSummary,
  gpudata,
  lscpu,
  mesaenv,
  migprofiles,
  nvidiaSmiTable,
  pagealign,
  solvetopology,
  vulkanSummary,
} from "./sandbox.ts";

/* ════════════════════════════════════════════════════════════════════ */
/* SECTION: edgelandes.ts — the base contract lanes (the first seat).   */
/* ════════════════════════════════════════════════════════════════════ */

// # edgelandes.ts — the modality lane executors of the edge plane: one
// executor per live modality, every one running server-side inside the
// engine process or through a host runtime the engine spawns (the
// owner's law: the sandbox and the saddle modalities act for the system
// over the internet, the visitor browser, gpu and cpu are never touched).
// The executors are the honest lane layer of the edge plane: the in
// process lanes ride node:vm, the engine's own webassembly and the babel
// transform surface; the host lanes write the code to a private temp
// directory and spawn bun, bash, python3 or java under a hard deadline;
// the engine surface lanes probe docker, exercise the virtual.ts vfs and
// compile through webpack when the module graph carries it. The ninety
// law wave (the forty live law) widens the same surfaces: the clr lane
// spawns dotnet over precompiled assemblies, the container profile lanes
// compute the memory vector through the engine's own virtualmemory
// recipe and the ghcr lane pulls only digest-pinned references, the
// storage lanes register the engine's s3, libsql and mysql adapters when
// the env configuration carries them, and the ram lanes apply the tiers
// kernel recipes through the privilege ladder the host answers. Every
// absence answers an honest coded error — a lane whose runtime is not on
// the host says so, a lane never fakes a run. Pure node builtins ride
// the static import surface (the webserver's plain node host strips
// types and resolves only .ts specifiers); the engine root domain
// (virtual.ts) and the optional runtimes (@babel/core, webpack) load
// lazily inside the executors so a missing module degrades that one
// lane, never the engine boot. This file owns the base lane spec table
// beside the executors: the sixteen contract seats the edge plane drove
// before the ninety waves merged (the docker surface, the engine vfs,
// the node:vm, bun, wasm, babel and webpack runners, the bash, python
// and java seats and the six host probes) — the ninety completion wave
// lifted them from the inline plane table into this owning file so the
// merged ninety table wires every modality of the plan through one spec
// surface with its executor in the same seat.

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the lane executor contract — one typed surface per lane. */
/* ════════════════════════════════════════════════════════════════════ */

/** one lane artifact: the bytes the lane produced and the mime they answer. */
export interface EdgeLaneArtifact {
  /** the mime type of the produced bytes. */
  mime: string;
  /** the produced bytes. */
  bytes: Uint8Array;
}

/** the output one lane executor answers: the captured streams and the
 * optional artifact the run committed. */
export interface EdgeLaneOutput {
  /** the captured stdout of the lane run. */
  stdout: string;
  /** the captured stderr of the lane run when the lane produced any. */
  stderr?: string;
  /** the lane specific artifact when the run produced one. */
  artifact?: EdgeLaneArtifact;
}

/** one modality lane executor: (code, inputs, deadline) riding the lane.
 * The code field is the program for the runner and language lanes, the
 * base64 module bytes for the wasm lane and the payload bytes for the
 * vfs lane; the inputs ride the sandbox global (in process lanes) or the
 * inputs.json file the host lanes write beside the program; the deadline
 * is the hard budget in milliseconds. */
export type EdgeLaneExecutor = (code: string, inputs: unknown, deadline: number) => Promise<EdgeLaneOutput>;

/** the coded failure one lane throws when it cannot run honestly. */
export interface EdgeLaneError extends Error {
  /** the lane error name (always "edgelaneerror"). */
  name: "edgelaneerror";
  /** the machine readable lane error code. */
  code: string;
  /** the captured stderr of the failed run when the lane produced any. */
  stderr?: string;
}

/** creates one coded lane error; the edge dispatcher reads the code and
 * never invents a success a lane did not answer. */
export function edgelaneerror(code: string, message: string, details?: { stderr?: string }): EdgeLaneError {
  const error = new Error(message) as EdgeLaneError;
  error.name = "edgelaneerror";
  error.code = code;
  if (details?.stderr !== undefined) error.stderr = details.stderr;
  return error;
}

/** the safe message of an unknown thrown value (no stack ever rides a lane answer). */
function errormessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error ?? "unknown lane failure");
}

/** encodes one value as one stdout line (json when possible, string otherwise). */
function encodeline(value: unknown): string {
  try {
    const encoded = JSON.stringify(value);
    return encoded === undefined ? String(value) : encoded;
  } catch {
    return String(value);
  }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the host runtime probes — the honest present checks. */
/* ════════════════════════════════════════════════════════════════════ */

/** probes one host binary on PATH synchronously (command -v through
 * bash): the honest present check of the lane table. */
export function probehostbinary(binary: string): boolean {
  try {
    const probe = spawnSync("bash", ["-c", `command -v ${binary}`], { timeout: 2000, encoding: "utf8" });
    return probe.status === 0;
  } catch {
    return false;
  }
}

/** probes the docker lane surface: the binary on PATH or the daemon socket. */
export function probedocker(): boolean {
  return probehostbinary("docker") || existsSync("/var/run/docker.sock");
}

/** probes the engine's own webassembly (the in process wasm lane). */
export function probewasm(): boolean {
  return typeof WebAssembly === "object" && typeof WebAssembly.Module === "function";
}

/** probes the node:vm surface (the in process runner lane). */
export function probenodevm(): boolean {
  return typeof vm.runInNewContext === "function";
}

/** probes one engine module through the node resolver (createRequire):
 * the honest check for @babel/core and webpack without loading them. */
export function probemodule(specifier: string): boolean {
  try {
    createRequire(import.meta.url).resolve(specifier);
    return true;
  } catch {
    return false;
  }
}

/** probes the engine vfs module file (virtual.ts beside this lane file):
 * the report states the engine ships the vfs; a host whose module graph
 * cannot load it answers the failure per run, never per report. */
export function probevirtualmodule(): boolean {
  try {
    return existsSync(join(dirname(fileURLToPath(import.meta.url)), "virtual.ts"));
  } catch {
    return false;
  }
}

/** probes the s3 storage configuration the env carries (the runtime
 * surface of the s3 vault lane): the endpoint, the credentials and the
 * bucket — every required key present or the lane answers absent. */
export function probes3config(): boolean {
  const env = process.env;
  return (
    typeof env.SADDLE_S3_ENDPOINT === "string" &&
    env.SADDLE_S3_ENDPOINT.length > 0 &&
    typeof env.SADDLE_S3_KEY === "string" &&
    env.SADDLE_S3_KEY.length > 0 &&
    typeof env.SADDLE_S3_SECRET === "string" &&
    env.SADDLE_S3_SECRET.length > 0 &&
    typeof env.SADDLE_S3_BUCKET === "string" &&
    env.SADDLE_S3_BUCKET.length > 0
  );
}

/** probes the libsql storage surface: the @libsql/client module the
 * engine graph carries plus the LIBSQL_URL configuration — the honest
 * present check of the libsql vault lane. */
export function probelibsqlconfig(): boolean {
  return (
    probemodule("@libsql/client") &&
    typeof process.env.LIBSQL_URL === "string" &&
    process.env.LIBSQL_URL.length > 0
  );
}

/** probes the mysql storage surface: the mysql2 promise module plus the
 * MYSQL_URL configuration — the honest present check of the mysql wire
 * vault lane. */
export function probemysqlconfig(): boolean {
  return (
    probemodule("mysql2/promise") &&
    typeof process.env.MYSQL_URL === "string" &&
    process.env.MYSQL_URL.length > 0
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: the shared host execution surface — spawn, deadline, temp. */
/* ════════════════════════════════════════════════════════════════════ */

/** the per stream capture ceiling: 256 kb of stdout or stderr, the honest
 * bound every host lane reports under. */
const OUTPUTCAPBYTES = 262144;

/** the default probe budget of the presence checks. */
const PROBEBUDGETMS = 2000;

/** the result of one host process run. */
interface ProcessRun {
  stdout: string;
  stderr: string;
}

/** spawns one host runtime under a hard deadline, captures both streams
 * (capped), kills on timeout and answers the coded failures honestly: a
 * missing binary answers HOST_RUNTIME_ABSENT, a nonzero exit answers
 * RUN_EXITED_NONZERO carrying the stderr, a blown deadline answers
 * RUN_DEADLINE_EXCEEDED. */
function runhostprocess(
  command: string,
  args: string[],
  options: { cwd: string; deadline: number; env?: Record<string, string> },
): Promise<ProcessRun> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env === undefined ? process.env : { ...process.env, ...options.env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const outchunks: Buffer[] = [];
    const errchunks: Buffer[] = [];
    let timedout = false;
    const makecollector = (chunks: Buffer[]) => {
      let used = 0;
      return (chunk: Buffer) => {
        if (used < OUTPUTCAPBYTES) {
          chunks.push(chunk);
          used += chunk.byteLength;
        }
      };
    };
    child.stdout?.on("data", makecollector(outchunks));
    child.stderr?.on("data", makecollector(errchunks));
    const timer = setTimeout(() => {
      timedout = true;
      child.kill("SIGKILL");
    }, options.deadline);
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(edgelaneerror("HOST_RUNTIME_ABSENT", `the host runtime ${command} is absent: ${errormessage(error)}`));
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      const stdout = Buffer.concat(outchunks).toString("utf8");
      const stderr = Buffer.concat(errchunks).toString("utf8");
      if (timedout) {
        reject(
          edgelaneerror(
            "RUN_DEADLINE_EXCEEDED",
            `the lane exceeded its ${options.deadline} ms deadline and was killed`,
            { stderr },
          ),
        );
      } else if (code !== 0) {
        reject(
          edgelaneerror("RUN_EXITED_NONZERO", `the lane process ${command} exited with code ${code ?? signal}`, {
            stderr,
          }),
        );
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

/** probes one host binary asynchronously and answers its resolved path;
 * the probe never throws — absence is an answer, not a failure. */
async function probelateruntime(binary: string, deadline: number): Promise<{ present: boolean; path: string }> {
  try {
    const run = await runhostprocess("bash", ["-c", `command -v ${binary}`], {
      cwd: tmpdir(),
      deadline: Math.min(deadline, PROBEBUDGETMS),
    });
    return { present: true, path: run.stdout.trim() };
  } catch {
    return { present: false, path: "" };
  }
}

/** runs fn inside one private temp directory (mkdtemp under os tmpdir)
 * and removes it no matter how fn answers — the host lanes never leave
 * workspace bytes behind. */
async function withtempdir<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "saddleedge"));
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** writes the run inputs as inputs.json beside the program and answers
 * the env overlay pointing at it (SADDLE_EDGE_INPUTS); host lane
 * programs read their inputs from that file when the caller sent any. */
async function writeinputsfile(dir: string, inputs: unknown): Promise<Record<string, string> | undefined> {
  if (inputs === undefined) return undefined;
  const path = join(dir, "inputs.json");
  await writeFile(path, inputs === undefined ? "null" : JSON.stringify(inputs ?? null), "utf8");
  return { SADDLE_EDGE_INPUTS: path };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: the in process lanes — node:vm, webassembly and babel. */
/* ════════════════════════════════════════════════════════════════════ */

/** runs one program inside a fresh node:vm context: the sandbox carries
 * only the capturing console surface and the frozen inputs — no require,
 * no process, no host globals leak into the context (a new vm context
 * ships the pure ecmascript builtins only). The completion value of the
 * program rides the last stdout line so a value-returning program
 * answers its value. */
function runinvm(code: string, inputs: unknown, deadline: number): EdgeLaneOutput {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const push =
    (target: string[]) =>
    (...values: unknown[]) => {
      target.push(values.map((value) => (typeof value === "string" ? value : encodeline(value))).join(" "));
    };
  const consolesurface = Object.freeze({
    log: push(stdout),
    info: push(stdout),
    debug: push(stdout),
    warn: push(stderr),
    error: push(stderr),
  });
  const sandbox = { console: consolesurface, inputs: inputs === undefined ? null : Object.freeze(inputs as object) };
  const completion = vm.runInNewContext(code, sandbox, { timeout: deadline, displayErrors: true });
  let out = stdout.join("\n");
  if (completion !== undefined) {
    out += out.length > 0 ? `\n${encodeline(completion)}` : encodeline(completion);
  }
  return { stdout: out, stderr: stderr.join("\n") };
}

/** runner-node: the in process javascript lane through node:vm. */
async function runnernodelane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  return runinvm(code, inputs, deadline);
}

/** runner-wasm: the in process webassembly lane. The code field carries
 * the base64 module bytes; the lane instantiates them with a minimal
 * wasi-shaped import shim (every imported function answers 0 — enough
 * for a trivial module) and calls the first exported zero parameter
 * function, answering its return value on stdout. */
async function runnerwasmlane(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const bytes = Buffer.from(String(code), "base64");
  if (bytes.byteLength < 8) {
    throw edgelaneerror("WASM_INSTANTIATION_FAILED", "the wasm lane requires base64 module bytes in the code field");
  }
  let instance: WebAssembly.Instance;
  try {
    const module = new WebAssembly.Module(new Uint8Array(bytes));
    const importobject: Record<string, Record<string, unknown>> = {};
    for (const spec of WebAssembly.Module.imports(module)) {
      importobject[spec.module] ??= {};
      if (spec.kind === "function") importobject[spec.module][spec.name] = () => 0;
    }
    instance = new WebAssembly.Instance(module, importobject);
  } catch (error) {
    throw edgelaneerror("WASM_INSTANTIATION_FAILED", `the wasm module failed to instantiate: ${errormessage(error)}`);
  }
  const exports = instance.exports as Record<string, unknown>;
  const callable = Object.values(exports).find(
    (value) => typeof value === "function" && (value as (...args: unknown[]) => unknown).length === 0,
  );
  if (callable === undefined) {
    return { stdout: `instantiated; exports: ${Object.keys(exports).join(", ")}` };
  }
  return { stdout: encodeline((callable as () => unknown)()) };
}

/** the typed slice of @babel/core the babel lane uses. */
interface BabelModule {
  transformSync?: (code: string, options?: unknown) => { code: string };
  default?: { transformSync?: (code: string, options?: unknown) => { code: string } };
}

/** runner-babel: the babel transpile lane. The module transforms the
 * program (parse and regenerate — the honest babel pass, no preset the
 * engine graph does not carry) and the transformed output runs through
 * the same node:vm surface as runner-node. */
async function runnerbabellane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  let babelmodule: BabelModule;
  try {
    babelmodule = (await import("@babel/core")) as BabelModule;
  } catch (error) {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      `the host runtime @babel/core is absent from the engine module graph: ${errormessage(error)}`,
    );
  }
  const transform = babelmodule.transformSync ?? babelmodule.default?.transformSync;
  if (typeof transform !== "function") {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      "the host runtime @babel/core did not surface a transform (the lane never fakes one)",
    );
  }
  let transformed: string;
  try {
    transformed = transform(code, {
      filename: "edgelane.js",
      plugins: [],
      presets: [],
      configFile: false,
      babelrc: false,
    }).code;
  } catch (error) {
    throw edgelaneerror("RUN_TRANSFORM_FAILED", `the babel transform failed: ${errormessage(error)}`);
  }
  return runinvm(transformed, inputs, deadline);
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 5: the host spawned lanes — bun, bash, python3 and java. */
/* ════════════════════════════════════════════════════════════════════ */

/** runner-bun: the bun runtime lane — the program rides a temp .ts file
 * executed by the host bun binary under the deadline. */
async function runnerbunlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  return withtempdir(async (dir) => {
    const script = join(dir, "edgelane.ts");
    await writeFile(script, code, "utf8");
    const env = await writeinputsfile(dir, inputs);
    const run = await runhostprocess("bun", ["run", script], { cwd: dir, deadline, env });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** runner-universal: the universal binary lane — the program rides a
 * temp shell script executed by bash under the deadline. */
async function runneruniversallane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  return withtempdir(async (dir) => {
    const script = join(dir, "edgelane.sh");
    await writeFile(script, code, "utf8");
    const env = await writeinputsfile(dir, inputs);
    const run = await runhostprocess("bash", [script], { cwd: dir, deadline, env });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** language-python: the cpython lane — the program rides a temp .py file
 * executed by the host python3 binary under the deadline. */
async function languagepythonlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  return withtempdir(async (dir) => {
    const script = join(dir, "edgelane.py");
    await writeFile(script, code, "utf8");
    const env = await writeinputsfile(dir, inputs);
    const run = await runhostprocess("python3", [script], { cwd: dir, deadline, env });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** language-java: the jdk lane — the program rides a temp Main.java;
 * when javac is on PATH the lane compiles then runs the class, otherwise
 * the jdk 11+ single-file source mode runs Main.java directly (the
 * honest path this engine host carries). */
async function languagejavalane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  return withtempdir(async (dir) => {
    const script = join(dir, "Main.java");
    await writeFile(script, code, "utf8");
    const env = await writeinputsfile(dir, inputs);
    if (probehostbinary("javac")) {
      const compile = await runhostprocess("javac", [script], { cwd: dir, deadline, env });
      const run = await runhostprocess("java", ["-cp", dir, "Main"], { cwd: dir, deadline, env });
      return { stdout: compile.stdout + run.stdout, stderr: compile.stderr + run.stderr };
    }
    const run = await runhostprocess("java", [script], { cwd: dir, deadline, env });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 6: the engine surface lanes — docker, the vfs and webpack. */
/* ════════════════════════════════════════════════════════════════════ */

/** container-docker: the hardened container lane. The lane probes the
 * docker surface first (binary on PATH or the daemon socket) and answers
 * HOST_RUNTIME_ABSENT when the host carries neither — it never fakes a
 * container run; when present the lane runs docker version --format json
 * and answers the probe document as the honest artifact. */
async function containerdockerlane(_code: string, _inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const probe = await probelateruntime("docker", deadline);
  if (!probe.present && !existsSync("/var/run/docker.sock")) {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      "the host runtime docker is absent from the engine host (no docker binary and no /var/run/docker.sock)",
    );
  }
  const run = await runhostprocess("docker", ["version", "--format", "json"], { cwd: tmpdir(), deadline });
  return {
    stdout: run.stdout,
    stderr: run.stderr,
    artifact: { mime: "application/json", bytes: new TextEncoder().encode(run.stdout) },
  };
}

/** the typed slice of the engine vfs module the fs-vfs lane uses. */
interface VfsStorage {
  put(input: {
    key: string;
    data: Uint8Array;
    contenttype?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ key: string; sha256: string }>;
  get(key: string): Promise<Uint8Array>;
}

interface VfsMemory {
  prepare(job: { id: string }): Promise<{ location: string; resultpath: string }>;
  sync(set: { location: string; resultpath: string }, bytes: Uint8Array): Promise<{ bytes: number; location: string }>;
  cleanup(set: { location: string; resultpath: string }): Promise<void>;
}

interface VirtualModule {
  localstorage(root: string): VfsStorage;
  localmemory(options?: { base?: string }): VfsMemory;
}

/** fs-vfs: the virtual filesystem lane. The code field rides the payload
 * bytes: the lane writes them through the engine's own virtual.ts
 * storage surface (localstorage in a temp dir), reads them back and
 * proves the roundtrip, then exercises the localmemory working set
 * bridge (prepare, sync, cleanup) on the same bytes. The module loads
 * lazily: a host whose module graph cannot resolve the root domain
 * answers LANE_MODULE_UNAVAILABLE for this one lane, never a fake
 * roundtrip. */
async function fsvfslane(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  let virtual: VirtualModule;
  try {
    virtual = (await import("./virtual.ts")) as VirtualModule;
  } catch (error) {
    throw edgelaneerror(
      "LANE_MODULE_UNAVAILABLE",
      `the engine vfs module is not loadable in this host module graph: ${errormessage(error)}`,
    );
  }
  const bytes = new TextEncoder().encode(String(code));
  return withtempdir(async (dir) => {
    const storage = virtual.localstorage(dir);
    const written = await storage.put({
      key: "edge/vfs-payload.bin",
      data: bytes,
      contenttype: "application/octet-stream",
    });
    const readback = await storage.get("edge/vfs-payload.bin");
    if (readback.byteLength !== bytes.byteLength) {
      throw edgelaneerror(
        "VFS_ROUNDTRIP_FAILED",
        `the vfs roundtrip answered ${readback.byteLength} bytes for ${bytes.byteLength} written`,
      );
    }
    const memory = virtual.localmemory({ base: dir });
    const set = await memory.prepare({ id: "edgelane-vfs" });
    const sync = await memory.sync(set, bytes);
    await memory.cleanup(set);
    return {
      stdout: `vfs roundtrip: ${bytes.byteLength} bytes, sha256 ${written.sha256.slice(0, 12)}, workingset ${sync.bytes} bytes`,
      artifact: { mime: "application/octet-stream", bytes: readback },
    };
  });
}

/** the typed slice of webpack the lane uses. */
interface WebpackCompiler {
  run(
    callback: (
      error: Error | null,
      stats?: { hasErrors?: () => boolean; toString?: (options?: unknown) => string },
    ) => void,
  ): void;
}

/** runner-webpack: the bundler lane. The program rides a temp entry.js
 * compiled by the host webpack (mode none, no devtool) into the same
 * temp dir; the bundle answers as the artifact and its size rides
 * stdout. webpack is absent from this engine graph today — the lane
 * answers HOST_RUNTIME_ABSENT and never fakes a bundle; a host that
 * carries webpack gets the real compile. */
async function runnerwebpacklane(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  let webpackmodule: { webpack?: unknown; default?: unknown };
  try {
    webpackmodule = await import("webpack");
  } catch (error) {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      `the host runtime webpack is absent from the engine module graph: ${errormessage(error)}`,
    );
  }
  const webpack = webpackmodule.webpack ?? webpackmodule.default;
  if (typeof webpack !== "function") {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      "the host runtime webpack did not surface a compiler (the lane never fakes a bundle)",
    );
  }
  return withtempdir(async (dir) => {
    await writeFile(join(dir, "entry.js"), code, "utf8");
    const compiler = webpack({
      mode: "none",
      devtool: false,
      entry: join(dir, "entry.js"),
      output: { path: dir, filename: "bundle.js" },
    }) as WebpackCompiler;
    await new Promise<void>((resolve, reject) => {
      compiler.run((error, stats) => {
        if (error) {
          reject(edgelaneerror("BUNDLE_FAILED", `the webpack compile failed: ${errormessage(error)}`));
        } else if (stats && typeof stats.hasErrors === "function" && stats.hasErrors()) {
          reject(
            edgelaneerror(
              "BUNDLE_FAILED",
              `the webpack compile failed: ${String(stats.toString?.({ errorDetails: false }) ?? "errors")}`,
            ),
          );
        } else {
          resolve();
        }
      });
    });
    const bundle = await readFile(join(dir, "bundle.js"));
    const bytes = new Uint8Array(bundle);
    return { stdout: `webpack bundle: ${bytes.byteLength} bytes`, artifact: { mime: "application/javascript", bytes } };
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 7: the host probe lanes — the six runtimes the engine watches. */
/* ════════════════════════════════════════════════════════════════════ */

/** builds the probe executor of one host lane (runsc, qemu, firecracker,
 * the jvm, go, ruby): the lane probes the runtime and answers its
 * resolved path on stdout — the execution wiring is the next rung, and
 * an absent runtime answers HOST_RUNTIME_ABSENT naming the runtime. */
function hostprobelane(runtime: string): EdgeLaneExecutor {
  return async (_code: string, _inputs: unknown, deadline: number) => {
    const probe = await probelateruntime(runtime, deadline);
    if (!probe.present) {
      throw edgelaneerror(
        "HOST_RUNTIME_ABSENT",
        `the host runtime ${runtime} is absent from the engine host (the ${runtime} lane probes and never fakes)`,
      );
    }
    return { stdout: `${runtime} at ${probe.path}` };
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 8: the ninety law wave — the ten promotions of the forty    */
/* live law (wave w2 b1): the clr assembly lane, the docker profile    */
/* pair and the ghcr digest pin, the three storage adapter lanes and   */
/* the three kernel recipe lanes of the ram family.                    */
/* ════════════════════════════════════════════════════════════════════ */

/** reads one optional string field of the caller inputs (the pinned
 * image reference of the ghcr lane). */
function inputstring(inputs: unknown, field: string): string {
  const value = (inputs as Record<string, unknown> | null | undefined)?.[field];
  return typeof value === "string" ? value.trim() : "";
}

/** reads one optional string array field of the caller inputs (the argv
 * of the clr assembly lane and the ghcr run). */
function inputstrings(inputs: unknown, field: string): string[] {
  const value = (inputs as Record<string, unknown> | null | undefined)?.[field];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

/** reads the optional size the caller inputs carry and clamps it into
 * the recipe window (1 through 512 gb, the tiers recipe law); the
 * fallback answers when the inputs carry no honest number. */
function clampsizegb(inputs: unknown, fallback: number): number {
  const value = (inputs as Record<string, unknown> | null | undefined)?.sizegb;
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.round(value), 1), 512);
}

/** parses one host document when it parses, answers the raw text when
 * it does not — the artifact never invents a document the daemon did
 * not answer. */
function safejson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** races one promise against the lane deadline: a slow wire answers
 * RUN_DEADLINE_EXCEEDED honestly while the underlying work settles in
 * the background (the cleanup surfaces still run through the finally). */
async function racedeadline<T>(work: Promise<T>, deadline: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(edgelaneerror("RUN_DEADLINE_EXCEEDED", `the lane exceeded its ${deadline} ms deadline`)),
          deadline,
        );
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/** maps one kernel recipe refusal onto the privilege ladder: a command
 * the host refused for lack of privilege (operation not permitted,
 * permission denied, must be superuser) answers HOST_PRIVILEGE_ABSENT
 * naming the requirement — the lane never hides the kernel verdict
 * behind a generic exit code, and every other failure rides untouched. */
function recipefailure(requirement: string, error: unknown): never {
  const laneerror = error as EdgeLaneError;
  const verdict = `${errormessage(error)}\n${laneerror?.stderr ?? ""}`;
  if (/operation not permitted|permission denied|must be superuser|only root|EPERM|EACCES/i.test(verdict)) {
    throw edgelaneerror(
      "HOST_PRIVILEGE_ABSENT",
      `the lane requires the ${requirement} and this engine host refused it: ${errormessage(error)}`,
      { stderr: laneerror?.stderr },
    );
  }
  throw error;
}

/** the typed slice of the engine memory recipe module the container
 * profile lanes use. */
interface MemoryRecipeModule {
  dockerMemoryFlags?: (options?: {
    ramgb?: number;
    shmsizegb?: number;
    unlimitedswap?: boolean;
  }) => { run: readonly string[]; rationale: readonly string[] };
}

/** runtime-clr: the common language runtime lane — the code field rides
 * the base64 bytes of one precompiled .net assembly and the lane spawns
 * the host dotnet binary over it (dotnet <assembly.dll> [args], the
 * same host-spawn surface the language lanes ride; the argv rides
 * inputs.args). Bytes that carry no PE signature answer
 * ASSEMBLY_BYTES_INVALID before any spawn — the lane never feeds the
 * runtime bytes it can refuse itself — and an absent dotnet answers
 * HOST_RUNTIME_ABSENT naming the runtime. */
async function runtimeclrlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const bytes = Buffer.from(String(code), "base64");
  if (bytes.byteLength < 8 || bytes[0] !== 0x4d || bytes[1] !== 0x5a) {
    throw edgelaneerror(
      "ASSEMBLY_BYTES_INVALID",
      "the clr lane requires base64 PE assembly bytes in the code field (every .net assembly opens with the MZ signature)",
    );
  }
  const argv = inputstrings(inputs, "args");
  return withtempdir(async (dir) => {
    const assembly = join(dir, "edgelane.dll");
    await writeFile(assembly, bytes);
    const env = await writeinputsfile(dir, inputs);
    const run = await runhostprocess("dotnet", [assembly, ...argv], { cwd: dir, deadline, env });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** builds the docker profile lane of one named profile: the lane probes
 * the docker surface first (binary on PATH or the daemon socket) and
 * answers HOST_RUNTIME_ABSENT when the host carries neither; when
 * present it computes the profile memory vector through the engine's
 * own virtualmemory.ts dockerMemoryFlags recipe — never a hand-pinned
 * flag — drives docker version --format json under the deadline (the
 * pattern of the container-docker lane) and answers the daemon document
 * joined with the profile vector as the honest artifact. */
function containerprofilelane(profile: "max" | "lite"): EdgeLaneExecutor {
  return async (_code: string, _inputs: unknown, deadline: number) => {
    const probe = await probelateruntime("docker", deadline);
    if (!probe.present && !existsSync("/var/run/docker.sock")) {
      throw edgelaneerror(
        "HOST_RUNTIME_ABSENT",
        "the host runtime docker is absent from the engine host (no docker binary and no /var/run/docker.sock)",
      );
    }
    let memorymodule: MemoryRecipeModule;
    try {
      memorymodule = (await import("./virtual.ts")) as MemoryRecipeModule;
    } catch (error) {
      throw edgelaneerror(
        "LANE_MODULE_UNAVAILABLE",
        `the engine memory recipe module is not loadable in this host module graph: ${errormessage(error)}`,
      );
    }
    const recipe = memorymodule.dockerMemoryFlags;
    if (typeof recipe !== "function") {
      throw edgelaneerror(
        "LANE_MODULE_UNAVAILABLE",
        "the engine memory recipe module did not surface dockerMemoryFlags (the lane never pins a hand-made flag vector)",
      );
    }
    const plan =
      profile === "max"
        ? recipe({ ramgb: 32, shmsizegb: 2, unlimitedswap: true })
        : recipe({ ramgb: 2, shmsizegb: 1, unlimitedswap: false });
    const run = await runhostprocess("docker", ["version", "--format", "json"], { cwd: tmpdir(), deadline });
    const document = `${JSON.stringify({ profile, flags: plan.run, rationale: plan.rationale, daemon: safejson(run.stdout) })}\n`;
    return {
      stdout: `docker ${profile} profile: ${plan.run.join(" ")}\n${run.stdout}`,
      stderr: run.stderr,
      artifact: { mime: "application/json", bytes: new TextEncoder().encode(document) },
    };
  };
}

/** container-max: the docker max profile lane — the 32g memory ceiling,
 * the unlimited swap, the 2g shm raise and the tmpfs shader cache the
 * engine recipe computes (see containerprofilelane). */
const containermaxlane: EdgeLaneExecutor = containerprofilelane("max");

/** container-lite: the docker lite profile lane — the 2g memory ceiling,
 * the capped swap and the 1g shm of the same engine recipe under the
 * light profile (see containerprofilelane). */
const containerlitelane: EdgeLaneExecutor = containerprofilelane("lite");

/** the pinned reference grammar of the ghcr lane: ghcr.io/<owner>/
 * <image>@sha256:<64 hex> — the immutability policy never rides a
 * mutable tag. */
const GHCRPINNEDREF = /^ghcr\.io\/[a-z0-9._-]+(?:\/[a-z0-9._-]+)*@sha256:[a-f0-9]{64}$/i;

/** container-ghcr: the ghcr immutable lane — the code field (or
 * inputs.image) rides one digest-pinned ghcr.io reference; a tag or a
 * missing reference answers GHCR_REFERENCE_UNPINNED naming the policy
 * before any spawn, and an absent docker answers HOST_RUNTIME_ABSENT.
 * When both hold the lane pulls the pinned digest and runs it under one
 * uuid instance name (--rm — the immutable root is the digest itself),
 * answering the pulled run honestly: a digest the registry never met
 * answers the pull failure with its stderr, never a faked image id. */
async function containerghcrlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const reference = inputstring(inputs, "image").length > 0 ? inputstring(inputs, "image") : code.trim();
  if (!GHCRPINNEDREF.test(reference)) {
    throw edgelaneerror(
      "GHCR_REFERENCE_UNPINNED",
      `the ghcr lane requires one pinned reference ghcr.io/<owner>/<image>@sha256:<digest> in the code field (the immutability policy never rides a mutable tag), received "${reference}"`,
    );
  }
  const probe = await probelateruntime("docker", deadline);
  if (!probe.present && !existsSync("/var/run/docker.sock")) {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      "the host runtime docker is absent from the engine host (no docker binary and no /var/run/docker.sock)",
    );
  }
  const instance = `saddleedge-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const pull = await runhostprocess("docker", ["pull", reference], { cwd: tmpdir(), deadline });
  const run = await runhostprocess(
    "docker",
    ["run", "--rm", "--name", instance, reference, ...inputstrings(inputs, "args")],
    { cwd: tmpdir(), deadline },
  );
  return {
    stdout: `ghcr pull: ${reference}\ninstance: ${instance}\n${run.stdout}`,
    stderr: `${pull.stderr}${run.stderr}`,
  };
}

/** one s3 signing request the adapter hands the injected signer. */
interface S3SignRequest {
  method: string;
  endpoint: URL;
  bucket: string;
  key: string;
  query: Record<string, string>;
  body?: unknown;
}

/** builds the aws signature v4 signer the s3 lane injects into the
 * engine's s3compatible adapter: the canonical request, the string to
 * sign and the hmac chain computed over the env credentials — the
 * adapter stays signer-injected (the engine root domain owns no
 * credentials) and the lane supplies the real one from the config. */
function s3signer(credentials: { key: string; secret: string; region: string }) {
  const hmac = (key: Buffer | string, data: string): Buffer => createHmac("sha256", key).update(data).digest();
  return async (request: S3SignRequest): Promise<{ url: string; headers: Record<string, string> }> => {
    const path = `/${request.bucket}${request.key.length > 0 ? `/${request.key}` : ""}`.replaceAll("//", "/");
    const url = new URL(path, request.endpoint);
    for (const [name, value] of Object.entries(request.query ?? {})) url.searchParams.set(name, String(value));
    const payload = request.body instanceof Uint8Array ? Buffer.from(request.body) : Buffer.alloc(0);
    const payloadhash = createHash("sha256").update(payload).digest("hex");
    const amzdate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
    const datestamp = amzdate.slice(0, 8);
    const canonicalquery = [...url.searchParams.entries()]
      .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
      .sort()
      .join("&");
    const signedheaders = "host;x-amz-content-sha256;x-amz-date";
    const canonicalheaders = `host:${url.host}\nx-amz-content-sha256:${payloadhash}\nx-amz-date:${amzdate}\n`;
    const canonicalrequest = [
      request.method.toUpperCase(),
      url.pathname,
      canonicalquery,
      canonicalheaders,
      signedheaders,
      payloadhash,
    ].join("\n");
    const scope = `${datestamp}/${credentials.region}/s3/aws4_request`;
    const stringtosign = [
      "AWS4-HMAC-SHA256",
      amzdate,
      scope,
      createHash("sha256").update(canonicalrequest).digest("hex"),
    ].join("\n");
    const signingkey = hmac(hmac(hmac(hmac(`AWS4${credentials.secret}`, datestamp), credentials.region), "s3"), "aws4_request");
    const signature = createHmac("sha256", signingkey).update(stringtosign).digest("hex");
    return {
      url: `${url.pathname}${url.search}`,
      headers: {
        host: url.host,
        "x-amz-content-sha256": payloadhash,
        "x-amz-date": amzdate,
        authorization: `AWS4-HMAC-SHA256 Credential=${credentials.key}/${scope}, SignedHeaders=${signedheaders}, Signature=${signature}`,
      },
    };
  };
}

/** the typed slice of the engine storage module the s3 lane uses. */
interface VirtualS3Module {
  s3compatible?: (options: {
    endpoint: string;
    bucket: string;
    sign: (request: S3SignRequest) => Promise<{ url: string; headers: Record<string, string> }>;
    fetcher?: typeof fetch;
  }) => {
    put(input: { key: string; data: Uint8Array; contenttype?: string }): Promise<{ key: string; sha256: string }>;
    get(key: string): Promise<Uint8Array>;
    list(prefix?: string): Promise<readonly { key: string }[]>;
    delete(key: string): Promise<unknown>;
  };
}

/** storage-s3: the s3 compatible vault lane — the runtime surface is
 * the env configuration (SADDLE_S3_ENDPOINT, SADDLE_S3_KEY,
 * SADDLE_S3_SECRET, SADDLE_S3_BUCKET and the optional region); without
 * it the lane answers HOST_RUNTIME_ABSENT naming the configuration,
 * never a faked bucket. With it the lane registers the engine's own
 * s3compatible adapter (virtual.ts, the signer-injected surface) with a
 * real aws signature v4 signer built from the credentials and drives a
 * full roundtrip through the endpoint under the deadline — put, get,
 * list and delete of the payload bytes — answering the stored bytes as
 * the artifact. */
async function storages3lane(code: string, _inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const env = process.env;
  if (!probes3config()) {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      "the s3 lane requires the storage configuration SADDLE_S3_ENDPOINT, SADDLE_S3_KEY, SADDLE_S3_SECRET and SADDLE_S3_BUCKET on the engine host (the lane never fakes a bucket)",
    );
  }
  let virtual: VirtualS3Module;
  try {
    virtual = (await import("./virtual.ts")) as VirtualS3Module;
  } catch (error) {
    throw edgelaneerror(
      "LANE_MODULE_UNAVAILABLE",
      `the engine storage module is not loadable in this host module graph: ${errormessage(error)}`,
    );
  }
  const factory = virtual.s3compatible;
  if (typeof factory !== "function") {
    throw edgelaneerror(
      "LANE_MODULE_UNAVAILABLE",
      "the engine storage module did not surface s3compatible (the lane never fakes a bucket)",
    );
  }
  const started = Date.now();
  const fetcher = (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    const remaining = deadline - (Date.now() - started);
    if (remaining <= 0) {
      return Promise.reject(edgelaneerror("RUN_DEADLINE_EXCEEDED", `the s3 roundtrip exceeded its ${deadline} ms deadline`));
    }
    return fetch(input, { ...init, signal: AbortSignal.timeout(remaining) });
  };
  const storage = factory({
    endpoint: String(env.SADDLE_S3_ENDPOINT),
    bucket: String(env.SADDLE_S3_BUCKET),
    sign: s3signer({
      key: String(env.SADDLE_S3_KEY),
      secret: String(env.SADDLE_S3_SECRET),
      region:
        typeof env.SADDLE_S3_REGION === "string" && env.SADDLE_S3_REGION.length > 0 ? env.SADDLE_S3_REGION : "us-east-1",
    }),
    fetcher: fetcher as typeof fetch,
  });
  const bytes = new TextEncoder().encode(String(code));
  const key = `edge/s3-lane/${Date.now().toString(36)}.bin`;
  try {
    const written = await storage.put({ key, data: bytes, contenttype: "application/octet-stream" });
    const readback = await storage.get(key);
    if (readback.byteLength !== bytes.byteLength) {
      throw edgelaneerror(
        "S3_ROUNDTRIP_FAILED",
        `the s3 roundtrip answered ${readback.byteLength} bytes for ${bytes.byteLength} written`,
      );
    }
    const listing = await storage.list("edge/s3-lane/");
    await storage.delete(key);
    return {
      stdout: `s3 roundtrip: ${bytes.byteLength} bytes, sha256 ${written.sha256.slice(0, 12)}, listing ${listing.length} ${listing.length === 1 ? "entry" : "entries"}`,
      artifact: { mime: "application/octet-stream", bytes: readback },
    };
  } catch (error) {
    const laneerror = error as EdgeLaneError;
    if (laneerror?.code === "S3_ROUNDTRIP_FAILED" || laneerror?.code === "RUN_DEADLINE_EXCEEDED") throw error;
    if (/timeout|timed out|aborted/i.test(errormessage(error))) {
      throw edgelaneerror("RUN_DEADLINE_EXCEEDED", `the s3 roundtrip exceeded its ${deadline} ms deadline`);
    }
    throw edgelaneerror("S3_ROUNDTRIP_FAILED", `the s3 endpoint refused the roundtrip: ${errormessage(error)}`);
  }
}

/** the typed slice of @libsql/client the libsql lane uses. */
interface LibsqlModule {
  createClient?: (config: { url: string }) => {
    execute(statement: { sql: string; args?: readonly unknown[] }): Promise<{ rows: readonly unknown[] }>;
    close(): Promise<void> | void;
  };
}

/** storage-libsql: the libsql vault lane — the runtime surface is the
 * @libsql/client dependency the engine graph carries plus the LIBSQL_URL
 * configuration; without the url the lane answers HOST_RUNTIME_ABSENT
 * naming both, and a module graph that cannot resolve the client
 * answers the same honest refusal. With the url the lane opens the real
 * client (file: and remote libsql: shapes alike), drives one full
 * roundtrip under the deadline — create, insert, select of the payload
 * row — and answers the readback bytes as the artifact, the private
 * table dropping after the run. */
async function storagelibsqllane(code: string, _inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const url = process.env.LIBSQL_URL;
  if (typeof url !== "string" || url.length === 0) {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      "the libsql lane requires the LIBSQL_URL configuration and the @libsql/client runtime on the engine host (the lane never fakes a database)",
    );
  }
  let libsql: LibsqlModule;
  try {
    libsql = (await import("@libsql/client")) as LibsqlModule;
  } catch (error) {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      `the libsql lane requires the @libsql/client runtime and this host module graph cannot resolve it: ${errormessage(error)}`,
    );
  }
  const create = libsql.createClient;
  if (typeof create !== "function") {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      "the @libsql/client runtime did not surface createClient (the lane never fakes a database)",
    );
  }
  const client = create({ url });
  const table = `edgelane_libsql_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const payload = String(code);
  let readback = "";
  try {
    readback = await racedeadline(
      (async () => {
        await client.execute({ sql: `create table if not exists ${table} (k text primary key, v text)` });
        await client.execute({ sql: `insert or replace into ${table} (k, v) values (?, ?)`, args: ["edgelane-payload", payload] });
        const selected = await client.execute({ sql: `select v from ${table} where k = ?`, args: ["edgelane-payload"] });
        return String((selected.rows[0] as { v?: unknown } | undefined)?.v ?? "");
      })(),
      deadline,
    );
  } catch (error) {
    if ((error as EdgeLaneError)?.code === "RUN_DEADLINE_EXCEEDED") throw error;
    throw edgelaneerror("LIBSQL_ROUNDTRIP_FAILED", `the libsql endpoint refused the roundtrip: ${errormessage(error)}`);
  }
  try {
    if (readback !== payload) {
      throw edgelaneerror(
        "LIBSQL_ROUNDTRIP_FAILED",
        `the libsql roundtrip answered ${readback.length} characters for ${payload.length} written`,
      );
    }
    return {
      stdout: `libsql roundtrip: ${payload.length} characters through the ${url.split(":")[0]} endpoint`,
      artifact: { mime: "text/plain;charset=utf-8", bytes: new TextEncoder().encode(readback) },
    };
  } finally {
    try {
      await client.execute({ sql: `drop table if exists ${table}` });
    } catch {
      /* the roundtrip already answered; the drop is best effort */
    }
    try {
      await client.close();
    } catch {
      /* the close is best effort */
    }
  }
}

/** the typed slice of the mysql2 promise surface the mysql lane uses. */
interface MysqlModule {
  createPool?: (url: string) => {
    execute(sql: string, values?: readonly unknown[]): Promise<unknown>;
    end(): Promise<void> | void;
  };
}

/** the typed slice of the engine storage module the mysql lane uses. */
interface VirtualPersistenceModule {
  mysql2persistence?: (
    pool: { execute(sql: string, values?: readonly unknown[]): Promise<unknown> },
    options?: { table?: { jobs: string; events: string; sessions: string; artifacts: string; chunks: string } },
  ) => {
    savejob(job: Record<string, unknown>): Promise<unknown>;
    getjob(id: string): Promise<Record<string, unknown> | null>;
  };
}

/** storage-mysql: the mysql wire vault lane — the runtime surface is
 * the mysql2 dependency plus the MYSQL_URL configuration; without the
 * url the lane answers HOST_RUNTIME_ABSENT naming both. With it the
 * lane opens the real pool, ensures one private jobs table, and drives
 * the engine's own mysql2persistence adapter (virtual.ts — the sql
 * persistence the engine already carries) through a full job roundtrip
 * under the deadline: savejob then getjob, the payload compared — the
 * adapter is the engine's, the wire is real, the table drops after the
 * run. */
async function storagemysqllane(code: string, _inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const url = process.env.MYSQL_URL;
  if (typeof url !== "string" || url.length === 0) {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      "the mysql lane requires the MYSQL_URL configuration and the mysql2 runtime on the engine host (the lane never fakes a database)",
    );
  }
  let mysql: MysqlModule;
  try {
    mysql = (await import("mysql2/promise")) as MysqlModule;
  } catch (error) {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      `the mysql lane requires the mysql2 runtime and this host module graph cannot resolve it: ${errormessage(error)}`,
    );
  }
  const createPool = mysql.createPool;
  if (typeof createPool !== "function") {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      "the mysql2 runtime did not surface createPool (the lane never fakes a database)",
    );
  }
  let virtual: VirtualPersistenceModule;
  try {
    virtual = (await import("./virtual.ts")) as VirtualPersistenceModule;
  } catch (error) {
    throw edgelaneerror(
      "LANE_MODULE_UNAVAILABLE",
      `the engine storage module is not loadable in this host module graph: ${errormessage(error)}`,
    );
  }
  const persistencefactory = virtual.mysql2persistence;
  if (typeof persistencefactory !== "function") {
    throw edgelaneerror(
      "LANE_MODULE_UNAVAILABLE",
      "the engine storage module did not surface mysql2persistence (the lane never fakes a database)",
    );
  }
  const pool = createPool(url);
  const table = `edgelane_jobs_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const jobid = `edgelane-${Date.now().toString(36)}`;
  const payload = String(code);
  try {
    await racedeadline(
      (async () => {
        await pool.execute(
          `create table if not exists ${table} (id varchar(64) primary key, name varchar(255), status varchar(32), priority int, input text, outputkey varchar(512), createdat bigint, updatedat bigint)`,
        );
        const persistence = persistencefactory(pool, {
          table: { jobs: table, events: `${table}_events`, sessions: `${table}_sessions`, artifacts: `${table}_artifacts`, chunks: `${table}_chunks` },
        });
        await persistence.savejob({
          id: jobid,
          name: "edgelane mysql roundtrip",
          status: "created",
          priority: 0,
          input: { payload },
          outputkey: null,
          createdat: Date.now(),
          updatedat: null,
        });
        const job = await persistence.getjob(jobid);
        const read =
          job !== null && typeof job.input === "object" && job.input !== null
            ? (job.input as { payload?: unknown }).payload
            : undefined;
        if (read !== payload) {
          throw edgelaneerror(
            "MYSQL_ROUNDTRIP_FAILED",
            "the mysql roundtrip did not answer the payload the lane wrote",
          );
        }
      })(),
      deadline,
    );
    return {
      stdout: `mysql roundtrip: ${payload.length} characters through the mysql wire`,
      artifact: { mime: "text/plain;charset=utf-8", bytes: new TextEncoder().encode(payload) },
    };
  } catch (error) {
    const laneerror = error as EdgeLaneError;
    if (laneerror?.code === "MYSQL_ROUNDTRIP_FAILED" || laneerror?.code === "RUN_DEADLINE_EXCEEDED") throw error;
    throw edgelaneerror("MYSQL_ROUNDTRIP_FAILED", `the mysql endpoint refused the roundtrip: ${errormessage(error)}`);
  } finally {
    try {
      await pool.execute(`drop table if exists ${table}`);
    } catch {
      /* the roundtrip already answered; the drop is best effort */
    }
    try {
      await pool.end();
    } catch {
      /* the close is best effort */
    }
  }
}

/** the typed slice of the engine kernel recipe module the ram lanes use. */
interface KernelRecipeModule {
  tmpfsrecipe?: (mount?: string, sizegb?: number) => { kind: string; commands: readonly string[]; effect: string; source: string };
  zramrecipe?: (sizegb?: number, algo?: "zstd" | "lz4") => { kind: string; commands: readonly string[]; effect: string; source: string };
  swapfilerecipe?: (path?: string, sizegb?: number) => { kind: string; commands: readonly string[]; effect: string; source: string };
}

/** loads the engine kernel recipe module (tiers.ts) lazily — the honest
 * LANE_MODULE_UNAVAILABLE refusal answers a host whose module graph
 * cannot resolve the root domain, never a hand-written recipe. */
async function loadkernelrecipes(): Promise<KernelRecipeModule> {
  try {
    return (await import("./tiers.ts")) as KernelRecipeModule;
  } catch (error) {
    throw edgelaneerror(
      "LANE_MODULE_UNAVAILABLE",
      `the engine kernel recipe module is not loadable in this host module graph: ${errormessage(error)}`,
    );
  }
}

/** ram-tmpfs: the tmpfs lane — the executor applies the engine's own
 * tiers.ts tmpfsrecipe through the host (mkdir then mount -t tmpfs with
 * the size and mode the recipe prints) on one private mount under the
 * session temp directory, proves the ramdisk with a payload roundtrip
 * (the code field rides the bytes the lane writes into ram and reads
 * back), then releases the mount — no kernel state outlives the run.
 * The size rides inputs.sizegb (the recipe window, the lane default
 * 1); an absent mount binary answers HOST_RUNTIME_ABSENT, a host
 * without the mount privilege answers HOST_PRIVILEGE_ABSENT naming the
 * requirement — the lane never fakes a ramdisk. */
async function ramtmpfslane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("mount")) {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      "the host runtime mount is absent from the engine host (the tmpfs lane probes and never fakes)",
    );
  }
  const kernel = await loadkernelrecipes();
  const recipe = kernel.tmpfsrecipe;
  if (typeof recipe !== "function") {
    throw edgelaneerror(
      "LANE_MODULE_UNAVAILABLE",
      "the engine kernel recipe module did not surface tmpfsrecipe (the lane never hand-writes the kernel law)",
    );
  }
  const sizegb = clampsizegb(inputs, 1);
  const payload = new TextEncoder().encode(String(code));
  return withtempdir(async (dir) => {
    const mountpoint = join(dir, "ramdisk");
    const plan = recipe(mountpoint, sizegb);
    try {
      for (const command of plan.commands) {
        await runhostprocess("bash", ["-c", command], { cwd: dir, deadline });
      }
      const file = join(mountpoint, "edgelane-payload.bin");
      await writeFile(file, payload);
      const readback = new Uint8Array(await readFile(file));
      if (readback.byteLength !== payload.byteLength) {
        throw edgelaneerror(
          "RAM_ROUNDTRIP_FAILED",
          `the tmpfs roundtrip answered ${readback.byteLength} bytes for ${payload.byteLength} written`,
        );
      }
      return {
        stdout: `tmpfs recipe applied: ${plan.effect} — payload ${payload.byteLength} bytes roundtripped in ram (${plan.source})`,
        artifact: { mime: "application/octet-stream", bytes: readback },
      };
    } catch (error) {
      recipefailure("mount privilege (root or CAP_SYS_ADMIN over tmpfs)", error);
    } finally {
      try {
        await runhostprocess("bash", ["-c", `umount ${mountpoint}`], { cwd: dir, deadline });
      } catch {
        /* the mount never rode or already left — the release is best effort */
      }
    }
  });
}

/** ram-zram: the compressed ram lane — the executor applies the
 * engine's tiers.ts zramrecipe through the host (modprobe, the zstd or
 * lz4 algorithm, the disksize, mkswap, swapon at priority 100 and the
 * zramctl verify), reads the honest verify output, then releases the
 * device (swapoff and the zramctl reset) — the kernel state never
 * outlives the run. The size rides inputs.sizegb (the recipe window,
 * the lane default 8) and the algorithm rides inputs.algo; a missing
 * binary of the set answers HOST_RUNTIME_ABSENT naming the binaries, a
 * host without the privilege answers HOST_PRIVILEGE_ABSENT naming the
 * /sys requirement — never a faked compression ratio. */
async function ramzramlane(_code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const missing = ["zramctl", "modprobe", "mkswap", "swapon"].filter((binary) => !probehostbinary(binary));
  if (missing.length > 0) {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      `the zram lane requires zramctl, modprobe, mkswap and swapon on the host; ${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} absent (the lane never fakes)`,
    );
  }
  const kernel = await loadkernelrecipes();
  const recipe = kernel.zramrecipe;
  if (typeof recipe !== "function") {
    throw edgelaneerror(
      "LANE_MODULE_UNAVAILABLE",
      "the engine kernel recipe module did not surface zramrecipe (the lane never hand-writes the kernel law)",
    );
  }
  const algo = inputstring(inputs, "algo") === "lz4" ? "lz4" : "zstd";
  const sizegb = clampsizegb(inputs, 8);
  const plan = recipe(sizegb, algo);
  let verify = "";
  try {
    for (const command of plan.commands) {
      const run = await runhostprocess("bash", ["-c", command], { cwd: tmpdir(), deadline });
      verify += run.stdout;
    }
    return {
      stdout: `zram recipe applied: ${plan.effect}\n${verify.trim()} (${plan.source})`,
    };
  } catch (error) {
    recipefailure("zram privilege (root over /sys/block/zram0 and the swap surface)", error);
  } finally {
    try {
      await runhostprocess(
        "bash",
        ["-c", "swapoff /dev/zram0 2>/dev/null; zramctl --reset /dev/zram0 2>/dev/null || true"],
        { cwd: tmpdir(), deadline },
      );
    } catch {
      /* the device never rode or already reset — the release is best effort */
    }
  }
}

/** ram-swapfile: the swap lane — the executor applies the engine's
 * tiers.ts swapfilerecipe through the host (fallocate, chmod 600,
 * mkswap, swapon) on one private file under the session temp
 * directory, proves the swap with /proc/swaps, then releases it
 * (swapoff — the file leaves with the temp directory). The size rides
 * inputs.sizegb (the recipe window, the lane default 1); missing
 * binaries answer HOST_RUNTIME_ABSENT, a host without the swap
 * privilege answers HOST_PRIVILEGE_ABSENT naming swapon — never a
 * faked swap device. */
async function ramswapfilelane(_code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const missing = ["fallocate", "mkswap", "swapon"].filter((binary) => !probehostbinary(binary));
  if (missing.length > 0) {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      `the swapfile lane requires fallocate, mkswap and swapon on the host; ${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} absent (the lane never fakes)`,
    );
  }
  const kernel = await loadkernelrecipes();
  const recipe = kernel.swapfilerecipe;
  if (typeof recipe !== "function") {
    throw edgelaneerror(
      "LANE_MODULE_UNAVAILABLE",
      "the engine kernel recipe module did not surface swapfilerecipe (the lane never hand-writes the kernel law)",
    );
  }
  const sizegb = clampsizegb(inputs, 1);
  return withtempdir(async (dir) => {
    const path = join(dir, "swapfile");
    const plan = recipe(path, sizegb);
    try {
      for (const command of plan.commands) {
        await runhostprocess("bash", ["-c", command], { cwd: dir, deadline });
      }
      const swaps = await readFile("/proc/swaps", "utf8").catch(() => "");
      if (!swaps.includes(path)) {
        throw edgelaneerror(
          "SWAP_VERIFY_FAILED",
          `/proc/swaps does not carry ${path} after the recipe (the lane never claims a swap the kernel did not take)`,
        );
      }
      return { stdout: `swapfile recipe applied: ${plan.effect} — /proc/swaps carries the session swap (${plan.source})` };
    } catch (error) {
      recipefailure("swapon privilege (root or CAP_SYS_ADMIN over the swap surface)", error);
    } finally {
      try {
        await runhostprocess("bash", ["-c", `swapoff ${path} 2>/dev/null || true`], { cwd: dir, deadline });
      } catch {
        /* the swap never rode or already left — the release is best effort */
      }
    }
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 9: the executor table — one executor per lane id, no gaps. */
/* ════════════════════════════════════════════════════════════════════ */

/** the lane executor table: every live lane and every host lane of the
 * edge plane, keyed by modality id; the dispatch plane refuses to boot
 * over a lane it cannot wire. */
export const edgelaneexecutors: Readonly<Record<string, EdgeLaneExecutor>> = Object.freeze({
  "containerdocker": containerdockerlane,
  "fsvfs": fsvfslane,
  "runnernode": runnernodelane,
  "runnerbun": runnerbunlane,
  "runnerwasm": runnerwasmlane,
  "runnerbabel": runnerbabellane,
  "runnerwebpack": runnerwebpacklane,
  "runneruniversal": runneruniversallane,
  "languagepython": languagepythonlane,
  "languagejava": languagejavalane,
  // the ninety law wave (the forty live law, wave w2 b1): the ten
  // promotions — the clr assembly lane, the docker profile pair and the
  // ghcr digest pin, the three storage adapter lanes and the three
  // kernel recipe lanes
  "runtimeclr": runtimeclrlane,
  "containermax": containermaxlane,
  "containerlite": containerlitelane,
  "containerghcr": containerghcrlane,
  "storages3": storages3lane,
  "storagelibsql": storagelibsqllane,
  "storagemysql": storagemysqllane,
  "ramtmpfs": ramtmpfslane,
  "ramzram": ramzramlane,
  "ramswapfile": ramswapfilelane,
  "containerrunsc": hostprobelane("runsc"),
  "emulatorqemu": hostprobelane("qemu-system-x86_64"),
  "microvmfirecracker": hostprobelane("firecracker"),
  "runtimejvm": hostprobelane("java"),
  "languagego": hostprobelane("go"),
  "languageruby": hostprobelane("ruby"),
});

/* ════════════════════════════════════════════════════════════════════ */
/* Section 10: the base lane spec table — the sixteen contract seats.  */
/* ════════════════════════════════════════════════════════════════════ */

/** one base lane declaration: the modality id, the wiring kind, the
 * runtime surface it rides and the synchronous presence probe — the
 * same spec shape the lane group files answer, owned here because this
 * file owns the executors the lanes ride. */
export interface BaseLaneSpec {
  /** the modality id the lane wires (the registry id). */
  modality: string;
  /** the wiring kind: the ten live seats execute (the engine drives the
   * runtime when the host carries it), the six host seats probe the
   * runtime first (the execution wiring is the next rung). */
  kind: "live" | "host";
  /** the runtime surface the lane rides ("docker", "node:vm"...). */
  runtime: string;
  /** the honest presence probe of the runtime on this engine host. */
  present: () => boolean;
}

/** the base lane spec table of the plane contract: the sixteen lanes the
 * edge plane drove before the ninety waves merged — the docker surface
 * (the hardened container lane), the engine's own virtual filesystem,
 * the node:vm, webassembly, babel and webpack in-process runners, the
 * bun, bash, python and java host seats, and the six host probes (the
 * gvisor runsc, the qemu emulator, the firecracker microvm, the jvm,
 * go and ruby). the ninety completion wave lifted them from the inline
 * edgeplane table into this owning file so the merged ninety table
 * wires every modality of the plan through one spec surface; the ids
 * are pinned — the registry, the dispatcher merge and the api surface
 * read them exactly. */
export const baselanespecs: readonly BaseLaneSpec[] = Object.freeze([
  // the live seats: the engine executes through these today
  { modality: "containerdocker", kind: "live", runtime: "docker", present: probedocker },
  { modality: "fsvfs", kind: "live", runtime: "virtual-vfs", present: probevirtualmodule },
  { modality: "runnernode", kind: "live", runtime: "node:vm", present: probenodevm },
  { modality: "runnerbun", kind: "live", runtime: "bun", present: () => probehostbinary("bun") },
  { modality: "runnerwasm", kind: "live", runtime: "webassembly", present: probewasm },
  { modality: "runnerbabel", kind: "live", runtime: "@babel/core", present: () => probemodule("@babel/core") },
  { modality: "runnerwebpack", kind: "live", runtime: "webpack", present: () => probemodule("webpack") },
  { modality: "runneruniversal", kind: "live", runtime: "bash", present: () => probehostbinary("bash") },
  { modality: "languagepython", kind: "live", runtime: "python3", present: () => probehostbinary("python3") },
  { modality: "languagejava", kind: "live", runtime: "java", present: () => probehostbinary("java") },
  // the host seats: the engine probes the runtime, execution is the next rung
  { modality: "containerrunsc", kind: "host", runtime: "runsc", present: () => probehostbinary("runsc") },
  {
    modality: "emulatorqemu",
    kind: "host",
    runtime: "qemu-system-x86_64",
    present: () => probehostbinary("qemu-system-x86_64"),
  },
  { modality: "microvmfirecracker", kind: "host", runtime: "firecracker", present: () => probehostbinary("firecracker") },
  { modality: "runtimejvm", kind: "host", runtime: "java", present: () => probehostbinary("java") },
  { modality: "languagego", kind: "host", runtime: "go", present: () => probehostbinary("go") },
  { modality: "languageruby", kind: "host", runtime: "ruby", present: () => probehostbinary("ruby") },
]);

/** the base lane ids in spec order — the pinned contract the merged
 * ninety table and the reverse wiring check read exactly. */
export const baselaneids: readonly string[] = Object.freeze(baselanespecs.map((lane) => lane.modality));

/* the wiring self-check: the base lane table refuses to load over a gap
 * between the specs and the executors (a spec without an executor is a
 * miswired lane, and miswiring must fail loud at boot, never silently
 * at run time). */
for (const lane of baselanespecs) {
  if (edgelaneexecutors[lane.modality] === undefined) {
    throw new Error(`the base lane plane is miswired: no executor for the lane ${lane.modality}`);
  }
}

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: edgelandesnet.ts — the network resolution lanes (group d).   */
/* (consolidation note: the duplicate helpers errormessage and           */
/* racedeadline — verbatim copies of the base section's — ride the base  */
/* declarations; netmime, utf8, parsemanifest, networkdnslane and        */
/* networkdohlane keep their seats as the first declarations.)           */
/* ══════════════════════════════════════════════════════════════════════ */

// # edgelandesnet.ts — the network resolution lanes of the ninety-two
// modalities wave (group d, the saddle ownership audit): the two
// lane-less network modalities the registry declared live (network-dns
// and network-doh) wired as honest resolution executors. The lanes
// answer real server-side resolution only: the dns lane rides the
// node:dns resolver (resolve4/resolve6 through the resolver the node
// runtime carries, under the caller's deadline) and the doh lane rides
// one real dns-over-https query (the rfc 8484 json shape the public
// resolvers answer, fetched through the engine's own fetch under the
// deadline). The laws every lane keeps:
// - the visitor law: everything resolves server-side in the engine
//   process, the visitor browser, gpu, cpu and storage are never touched;
// - the honest payload law: the code field is the json resolution
//   manifest ({"host":"example.com","type":"A"}), a non-json or non-shape
//   manifest answers INVALID_LANE_PAYLOAD naming the field, and a
//   hostname that is not a hostname refuses before any wire rides;
// - the honest wire law: a resolver that refuses answers the coded
//   RESOLUTION_FAILED carrying the resolver's own message, a blown
//   deadline answers RUN_DEADLINE_EXCEEDED — a lane never invents an
//   address the resolver did not answer;
// - the artifact law: every lane answers one artifact under the mime its
//   registry record declares, carrying the resolution record the lane
//   honestly observed (answers, ttl class, resolver surface).
// (renamed from edgelandes.net.ts by the wave 1 logic-regrouping audit:
// the family naming law carries no dot inside a file name — the extension
// separator is the only dot a file name carries. no importer referenced
// the old path; the module surface is unchanged.)

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the lane contract — the net lane spec surface.           */
/* ════════════════════════════════════════════════════════════════════ */

/** one net lane declaration: the modality id the registry and the
 * dispatcher read, the kind (every lane here resolves live), the runtime
 * surface it rides and the honest presence probe of that surface. */
export interface NetLaneSpec {
  /** the modality id of the registry record the lane wires. */
  modality: string;
  /** live lanes resolve in-process; host lanes probe (none live here). */
  kind: "live" | "host";
  /** the runtime surface the lane rides ("node:dns", "doh-json"). */
  runtime: string;
  /** the honest presence probe of the resolution surface. */
  present: () => boolean;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the shared manifest law — parse, validate, budget.       */
/* ════════════════════════════════════════════════════════════════════ */

/** the artifact mime of the network family (the registry record declares it). */
const netmime = "application/vnd.devthink.net+json";

/** the shared utf8 encoder of the lane surfaces. */
const utf8 = new TextEncoder();

/** the hostname grammar the lanes accept: the rfc 1123 dns label law
 * (letters, digits and hyphens, no leading or trailing hyphen, at least
 * one label, every label at most 63 chars, the whole name at most 253)
 * and a single trailing dot the dns grammar permits. */
const HOSTNAMEREF = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}\.?$/i;

/** one parsed resolution manifest: the hostname to resolve and the
 * record type the lane answers (A or AAAA — the address families the
 * two lanes honestly carry). */
interface resolutionmanifest {
  host: string;
  type: "A" | "AAAA";
}

/** parses the code field as the resolution manifest: a json object
 * carrying the host and the optional type (default A); anything else
 * answers INVALID_LANE_PAYLOAD naming the law. */
function parsemanifest(lane: string, code: string): resolutionmanifest {
  let parsed: unknown;
  try {
    parsed = JSON.parse(code);
  } catch (error) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} requires a json resolution manifest in the code field: ${errormessage(error)}`,
    );
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} requires a json resolution manifest in the code field`,
    );
  }
  const raw = parsed as Record<string, unknown>;
  const host = typeof raw.host === "string" ? raw.host.trim().replace(/\.$/, "") : "";
  if (host.length === 0 || !HOSTNAMEREF.test(host)) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} requires a valid dns hostname in the manifest field host (rfc 1123 labels), received "${host}"`,
    );
  }
  const type = raw.type === "AAAA" ? "AAAA" : raw.type === undefined || raw.type === "A" ? "A" : "";
  if (type === "") {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} carries the manifest field type A or AAAA only, received "${String(raw.type)}"`,
    );
  }
  return { host, type };
}

/** answers one lane output whose stdout is the json resolution record
 * and whose artifact is the same record under the net mime. */
function resolutionreport(record: Record<string, unknown>): EdgeLaneOutput {
  const text = JSON.stringify(record);
  return { stdout: text, artifact: { mime: netmime, bytes: utf8.encode(text) } };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: the lane executors — the dns resolver and the doh query. */
/* ════════════════════════════════════════════════════════════════════ */

/** network-dns: the dns resolver lane. The code field is the resolution
 * manifest {"host":"example.com","type":"A"}: the lane asks the node
 * resolver for the address records of the host (resolve4 for A,
 * resolve6 for AAAA) under the caller's deadline and answers the
 * addresses the resolver really returned — the lane never invents an
 * address, never caches one, and a resolver refusal answers
 * RESOLUTION_FAILED carrying the resolver's own message. */
async function networkdnslane(code: string, _inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifest("networkdns", code);
  const resolver = new Resolver();
  const type = manifest.type === "AAAA" ? "AAAA" : "A";
  let addresses: string[];
  try {
    addresses = await racedeadline(
      manifest.type === "AAAA" ? resolver.resolve6(manifest.host) : resolver.resolve4(manifest.host),
      deadline,
    );
  } catch (error) {
    const laneerror = error as { code?: string };
    if (laneerror?.code === "RUN_DEADLINE_EXCEEDED") throw error;
    throw edgelaneerror(
      "RESOLUTION_FAILED",
      `the dns resolver refused the ${type} query for ${manifest.host}: ${errormessage(error)}`,
    );
  }
  return resolutionreport({
    lane: "networkdns",
    surface: "node:dns",
    host: manifest.host,
    type,
    addresses,
    answercount: addresses.length,
  });
}

/** the default dns-over-https endpoint the doh lane queries: the google
 * public resolver json api (the rfc 8484 json shape every public doh
 * resolver answers), overridable through inputs.endpoint. */
const DEFAULTDOHENDPOINT = "https://dns.google/resolve";

/** the typed slice of one doh json answer. */
interface DohAnswer {
  name?: unknown;
  type?: unknown;
  TTL?: unknown;
  data?: unknown;
}

/** network-doh: the dns-over-https lane. The code field is the same
 * resolution manifest; the lane asks one real doh endpoint (the rfc
 * 8484 json shape, the google resolver by default and any https
 * endpoint the caller pins through inputs.endpoint) through the
 * engine's own fetch under the deadline, and answers the address
 * records the endpoint really returned (the answer data with the ttl
 * class), never a pinned or invented address. An endpoint that answers
 * no 200 answers RESOLUTION_FAILED carrying the status. */
async function networkdohlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifest("networkdoh", code);
  const endpointinput =
    typeof inputs === "object" && inputs !== null ? (inputs as Record<string, unknown>).endpoint : undefined;
  const endpoint = typeof endpointinput === "string" && /^https:\/\//.test(endpointinput) ? endpointinput : DEFAULTDOHENDPOINT;
  const url = `${endpoint}?name=${encodeURIComponent(manifest.host)}&type=${manifest.type}`;
  let answers: DohAnswer[];
  try {
    answers = await racedeadline(
      (async () => {
        const response = await fetch(url, {
          headers: { accept: "application/dns-json" },
          signal: AbortSignal.timeout(deadline),
        });
        if (!response.ok) {
          throw edgelaneerror(
            "RESOLUTION_FAILED",
            `the doh endpoint ${endpoint} answered status ${response.status} for the ${manifest.type} query of ${manifest.host}`,
          );
        }
        const document = (await response.json()) as { Answer?: unknown };
        if (!Array.isArray(document?.Answer)) {
          throw edgelaneerror(
            "RESOLUTION_FAILED",
            `the doh endpoint ${endpoint} answered no Answer array for the ${manifest.type} query of ${manifest.host}`,
          );
        }
        return document.Answer as DohAnswer[];
      })(),
      deadline,
    );
  } catch (error) {
    const laneerror = error as { code?: string };
    if (laneerror?.code === "RUN_DEADLINE_EXCEEDED" || laneerror?.code === "RESOLUTION_FAILED") throw error;
    throw edgelaneerror(
      "RESOLUTION_FAILED",
      `the doh endpoint ${endpoint} refused the ${manifest.type} query for ${manifest.host}: ${errormessage(error)}`,
    );
  }
  const addresses = answers
    .filter((answer) => answer.data !== undefined)
    .map((answer) => String(answer.data));
  return resolutionreport({
    lane: "networkdoh",
    surface: "doh-json",
    endpoint,
    host: manifest.host,
    type: manifest.type,
    addresses,
    answercount: addresses.length,
    ttl: typeof answers[0]?.TTL === "number" ? (answers[0].TTL as number) : null,
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: the lane tables — the specs, the executors and the ids.  */
/* ════════════════════════════════════════════════════════════════════ */

/** the net lane specs: one row per wired modality, the source of truth
 * of the lane order — every lane resolves live, the dns lane rides the
 * node resolver and the doh lane rides the engine's own fetch. */
export const netlanespecs: readonly NetLaneSpec[] = Object.freeze([
  {
    modality: "networkdns",
    kind: "live",
    runtime: "node:dns",
    present: () => true,
  },
  {
    modality: "networkdoh",
    kind: "live",
    runtime: "doh-json",
    present: () => typeof fetch === "function",
  },
]);

/** the net lane executor table: every lane of the group d contract,
 * keyed by modality id — the dispatcher refuses to boot over a lane it
 * cannot wire. */
export const edgelaneexecutorsnet: Readonly<Record<string, EdgeLaneExecutor>> = Object.freeze({
  "networkdns": networkdnslane,
  "networkdoh": networkdohlane,
});

/** the net lane ids in spec order — the pinned contract the dispatcher
 * merge and the api surface read exactly. */
export const netlaneids: readonly string[] = Object.freeze(netlanespecs.map((spec) => spec.modality));

/* the wiring self-check: the net lane table refuses to load over a gap
 * between the specs and the executors (a spec without an executor is a
 * miswired lane, and miswiring must fail loud at boot, never silently
 * at run time). */
for (const lane of netlanespecs) {
  if (edgelaneexecutorsnet[lane.modality] === undefined) {
    throw new Error(`the net lane plane is miswired: no executor for the lane ${lane.modality}`);
  }
}
for (const id of Object.keys(edgelaneexecutorsnet)) {
  if (!netlaneids.includes(id)) {
    throw new Error(`the net lane plane is miswired: the executor ${id} carries no spec`);
  }
}

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: edgelandeshost.ts — the host binary lanes (group a).         */
/* (consolidation note: the duplicate helpers OUTPUTCAPBYTES, ProcessRun */
/* and errormessage — verbatim copies of the base section's — ride the   */
/* base declarations; this section's own runhostprocess, writeinputsfile,*/
/* containerghcrlane, containerlitelane, containermaxlane and            */
/* runtimeclrlane keep their logic verbatim under their group-suffixed   */
/* names — runhostprocesshost, writeinputsfilehost, containerghcrlanehost,*/
/* containerlitelanehost, containermaxlanehost, runtimeclrlanehost —     */
/* because the base section owns the un-suffixed seats of the dispatch   */
/* reality law.)                                                          */
/* ══════════════════════════════════════════════════════════════════════ */

// # edgelandeshost.ts — the host binary lane executors of the ninety
// modalities waves, group a: the twenty-five sandbox modalities of the
// first wave (the sandbox jails, the container extensions, the runtimes,
// the screens, the mobile seat, the builds, the ci runners, the network
// tunnels and the storage daemons the engine host may carry) plus the
// twelve lanes of the wiring wave (the language toolchains, the runner
// seats and the build tail), every one wired as an honest host-binary
// execution lane. Every lane follows the spawn pattern of
// edgelandes.ts: the runtime is probed first (an absent runtime answers
// the coded HOST_RUNTIME_ABSENT naming the runtime — a lane never fakes
// a run), the code field lands in a private temp directory, the inputs
// ride inputs.json through the SADDLE_EDGE_INPUTS env, the runtime
// spawns under the caller's hard deadline with both streams capped at
// 256 kb, and the temp directory dies in the finally no matter how the
// run answered (the owner's law: the lanes act for the system
// server-side, the visitor browser, gpu, cpu and storage are never
// touched, and no lane leaves bytes behind on the host). The shared
// helpers are local on purpose: edgelandes.ts exports its contract
// pieces only, so this file carries its own spawn, deadline and temp
// surface — the same law with its own seat. The twenty-five lanes of
// the first wave are kind live and the twelve of the wiring wave are
// kind host (the runtime probe rung of the table): every executor
// exists and drives the runtime when the host carries it, exactly like
// language-ruby rides live though a host may not carry it.

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the lane contract — the host lane spec and the executor seat. */
/* ════════════════════════════════════════════════════════════════════ */

/** one host lane declaration: the modality id, the kind (every lane
 * here is live — the executor drives the runtime when present), the
 * runtime surface it rides and the synchronous presence probe. */
export interface HostLaneSpec {
  /** the modality id the lane wires (the registry id). */
  modality: string;
  /** the wiring kind: the twenty-five first wave lanes ride live (the
   * executor drives the runtime when the host carries it), the twelve
   * wiring wave lanes ride host (the runtime probe rung — the plane
   * probes the runtime, the executor drives it when present, the honest
   * absence answers when it is not). */
  kind: "live" | "host";
  /** the runtime surface the lane rides ("bwrap", "docker", "tor"...). */
  runtime: string;
  /** the honest presence probe of the runtime on this engine host. */
  present: () => boolean;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the shared host execution surface — spawn, deadline, temp. */
/* ════════════════════════════════════════════════════════════════════ */

/** spawns one host runtime under a hard deadline, captures both streams
 * (capped), optionally feeds a stdin payload, kills on timeout and
 * answers the coded failures honestly: a missing binary answers
 * HOST_RUNTIME_ABSENT, a nonzero exit answers RUN_EXITED_NONZERO
 * carrying the stderr, a blown deadline answers RUN_DEADLINE_EXCEEDED. */
function runhostprocesshost(
  command: string,
  args: string[],
  options: { cwd: string; deadline: number; env?: Record<string, string>; stdin?: string },
): Promise<ProcessRun> {
  return new Promise((resolve, reject) => {
    // detached makes the child a process group leader: the deadline kill
    // takes the whole group down (podman spawns conmon and the container
    // shims that would otherwise outlive the cli and hold the pipes open —
    // the close event would never fire and the lane would hang past its
    // own budget)
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env === undefined ? process.env : { ...process.env, ...options.env },
      stdio: [options.stdin === undefined ? "ignore" : "pipe", "pipe", "pipe"],
      detached: true,
    });
    if (options.stdin !== undefined && child.stdin !== null) {
      // a payload through /dev/stdin: an early exit must not crash the
      // engine over a broken pipe, the run answers the exit it got
      child.stdin.on("error", () => {
        // the stream error is the child's own honest outcome
      });
      child.stdin.end(options.stdin);
    }
    const outchunks: Buffer[] = [];
    const errchunks: Buffer[] = [];
    let timedout = false;
    const makecollector = (chunks: Buffer[]) => {
      let used = 0;
      return (chunk: Buffer) => {
        if (used < OUTPUTCAPBYTES) {
          chunks.push(chunk);
          used += chunk.byteLength;
        }
      };
    };
    child.stdout?.on("data", makecollector(outchunks));
    child.stderr?.on("data", makecollector(errchunks));
    const timer = setTimeout(() => {
      timedout = true;
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch {
        child.kill("SIGKILL");
      }
    }, options.deadline);
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(edgelaneerror("HOST_RUNTIME_ABSENT", `the host runtime ${command} is absent: ${errormessage(error)}`));
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      const stdout = Buffer.concat(outchunks).toString("utf8");
      const stderr = Buffer.concat(errchunks).toString("utf8");
      if (timedout) {
        reject(
          edgelaneerror(
            "RUN_DEADLINE_EXCEEDED",
            `the lane exceeded its ${options.deadline} ms deadline and was killed`,
            {
              stderr,
            },
          ),
        );
      } else if (code !== 0) {
        reject(
          edgelaneerror("RUN_EXITED_NONZERO", `the lane process ${command} exited with code ${code ?? signal}`, {
            stderr,
          }),
        );
      } else {
        // the hard cap law: the collector admits chunks under the ceiling
        // but one large chunk may ride past the line — the joined buffer
        // truncates to the ceiling so the capture never exceeds it
        resolve({
          stdout: stdout.length > OUTPUTCAPBYTES ? stdout.slice(0, OUTPUTCAPBYTES) : stdout,
          stderr: stderr.length > OUTPUTCAPBYTES ? stderr.slice(0, OUTPUTCAPBYTES) : stderr,
        });
      }
    });
  });
}

/** runs fn inside one private temp directory (mkdtemp under the os
 * tmpdir, the saddleedgehost prefix) and removes it no matter how fn
 * answers — the host lanes never leave workspace bytes behind. */
async function withtempdirhost<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "saddleedgehost"));
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** writes the run inputs as inputs.json beside the program and answers
 * the env overlay pointing at it (SADDLE_EDGE_INPUTS); host lane
 * programs read their inputs from that file when the caller sent any. */
async function writeinputsfilehost(dir: string, inputs: unknown): Promise<Record<string, string> | undefined> {
  if (inputs === undefined) return undefined;
  const path = join(dir, "inputs.json");
  await writeFile(path, JSON.stringify(inputs ?? null), "utf8");
  return { SADDLE_EDGE_INPUTS: path };
}

/** writes the code as script.sh inside the private dir and runs one
 * command with the inputs surface and the extra env merged in: the
 * shared recipe of the bash-shaped host lanes. */
async function runscript(
  command: string,
  args: string[],
  dir: string,
  code: string,
  inputs: unknown,
  deadline: number,
  extraenv: Record<string, string> = {},
): Promise<EdgeLaneOutput> {
  await writeFile(join(dir, "script.sh"), code, "utf8");
  const inputenv = (await writeinputsfilehost(dir, inputs)) ?? {};
  const run = await runhostprocesshost(command, args, { cwd: dir, deadline, env: { ...inputenv, ...extraenv } });
  return { stdout: run.stdout, stderr: run.stderr };
}

/** the coded absence of one host runtime: the lane never fakes a run
 * over a binary the host does not carry — the message names the runtime
 * and the lane, the code rides the machine surface. */
function absentruntime(laneid: string, runtime: string, note = ""): never {
  throw edgelaneerror(
    "HOST_RUNTIME_ABSENT",
    `the host runtime ${runtime} is absent: the lane ${laneid} requires it on PATH${note.length > 0 ? ` ${note}` : ""}`,
  );
}

/** whether the engine process runs as root: the chroot and the oci
 * runtimes need the seat for their namespace work, and the lane answers
 * the coded privilege refusal instead of a wrapped errno. */
function isroot(): boolean {
  return typeof process.getuid === "function" && process.getuid() === 0;
}

/** the monotonic lane id counter: deterministic container ids without
 * crypto — the ids only need uniqueness per engine process. */
let laneidseat = 0;
function nextlaneid(prefix: string): string {
  laneidseat += 1;
  return `${prefix}-${process.pid}-${laneidseat}`;
}

/** waits for one loopback tcp port to accept a connection within the
 * budget: the honest readiness probe of the tunnel lanes (a port that
 * never opens answers the deadline refusal, never a fake tunnel). */
function waitforport(port: number, budgetms: number): Promise<boolean> {
  return new Promise((resolve) => {
    const endsat = Date.now() + budgetms;
    const attempt = () => {
      if (Date.now() > endsat) {
        resolve(false);
        return;
      }
      const socket = connect(port, "127.0.0.1");
      const settle = (answer: boolean) => {
        socket.removeAllListeners();
        socket.destroy();
        if (answer) {
          resolve(true);
          return;
        }
        if (Date.now() >= endsat) {
          resolve(false);
          return;
        }
        setTimeout(attempt, 100);
      };
      socket.once("connect", () => settle(true));
      socket.once("error", () => settle(false));
    };
    attempt();
  });
}

/** waits for one spawned child to exit within the budget (the daemon
 * teardown of the tunnel lanes; a false answer hands the caller the
 * kill decision). */
function waitforexit(child: ChildProcess, budgetms: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolve(true);
      return;
    }
    let settled = false;
    const finish = (answer: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(answer);
    };
    const timer = setTimeout(() => finish(false), budgetms);
    child.once("exit", () => finish(true));
  });
}

/** probes the docker surface of the host: the binary on PATH or the
 * daemon socket (the same honest seat the engine's docker lane rides). */
function probedockersurface(): boolean {
  return probehostbinary("docker") || existsSync("/var/run/docker.sock");
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: the sandbox jail lanes — bubblewrap, nsjail and chroot. */
/* ════════════════════════════════════════════════════════════════════ */

/** sandbox-bubblewrap: the user-namespace jail lane. The code rides a
 * temp script.sh executed inside bwrap with the host root bound
 * read-only, every namespace unshared and the jail dying with the
 * engine parent — the honest bubblewrap seat this host may carry. */
async function sandboxbubblewraplane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("bwrap")) {
    absentruntime("sandboxbubblewrap", "bwrap");
  }
  return withtempdirhost((dir) =>
    runscript(
      "bwrap",
      ["--ro-bind", "/", "/", "--unshare-all", "--die-with-parent", "/bin/bash", "script.sh"],
      dir,
      code,
      inputs,
      deadline,
    ),
  );
}

/** sandbox-nsjail: the process jail lane. The lane writes a minimal
 * nsjail config (mode ONCE, the deadline as time_limit, the temp cwd,
 * a read-only root bind and a writable tmpfs scratch) and runs the
 * script through the jail — the config and the script live and die in
 * the private temp dir. */
async function sandboxnsjaillane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("nsjail")) {
    absentruntime("sandboxnsjail", "nsjail");
  }
  return withtempdirhost(async (dir) => {
    const config = [
      "# the saddle edge nsjail lane: one process under the jail, the",
      "# deadline rides time_limit, the root bind keeps the system visible",
      "# read-only and the tmpfs at /scratch is the writable seat.",
      'name: "saddle-edge-nsjail"',
      "mode: ONCE",
      `time_limit: ${Math.max(1, Math.ceil(deadline / 1000))}`,
      `cwd: "${dir}"`,
      "mount {",
      '  src: "/"',
      '  dst: "/"',
      "  is_bind: true",
      "}",
      "mount {",
      '  dst: "/scratch"',
      '  fstype: "tmpfs"',
      "  rw: true",
      "}",
      "",
    ].join("\n");
    await writeFile(join(dir, "config.nsjail"), config, "utf8");
    return await runscript(
      "nsjail",
      ["--config", "config.nsjail", "--", "/bin/bash", "script.sh"],
      dir,
      code,
      inputs,
      deadline,
    );
  });
}

/** builds the minimal chroot tree: /bin/bash with its ldd dependency
 * set (best effort — fakechroot maps the real filesystem through its
 * preload shim, the copies serve the real chroot seat), the lane script
 * at /script.sh and the inputs at /inputs.json so the jailed program
 * reads them at their in-tree paths. */
async function buildchroottree(root: string, code: string, inputs: unknown): Promise<void> {
  if (!existsSync("/bin/bash")) {
    throw edgelaneerror(
      "RUNTIME_BUNDLE_UNAVAILABLE",
      "the lane sandbox-chroot cannot build its tree: /bin/bash is absent from the host (the lane never fakes a root)",
    );
  }
  await mkdir(join(root, "bin"), { recursive: true });
  await mkdir(join(root, "tmp"), { recursive: true });
  await copyFile("/bin/bash", join(root, "bin", "bash"));
  try {
    const deps = await runhostprocesshost("ldd", ["/bin/bash"], { cwd: root, deadline: 2000 });
    for (const line of deps.stdout.split("\n")) {
      for (const token of line.split(/\s+/)) {
        if (!token.startsWith("/") || !token.includes(".so")) continue;
        try {
          await mkdir(join(root, dirname(token)), { recursive: true });
          await copyFile(token, join(root, token));
        } catch {
          // an optional dependency copy that fails leaves the runtime's
          // own honest loader error at run time — the tree never fakes a lib
        }
      }
    }
  } catch {
    // ldd absent or failing: the fakechroot seat maps the real fs and
    // needs no copies, the real chroot seat answers its own loader error
  }
  await writeFile(join(root, "script.sh"), code, "utf8");
  if (inputs !== undefined) {
    await writeFile(join(root, "inputs.json"), JSON.stringify(inputs ?? null), "utf8");
  }
}

/** sandbox-chroot: the chroot jail lane with the honest privilege law:
 * a real chroot needs root, so a non-root engine requires fakechroot —
 * a host carrying neither root nor fakechroot answers the coded
 * privilege refusal, never a wrapped errno or a fake root. */
async function sandboxchrootlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const chrootpresent = probehostbinary("chroot");
  const fakepresent = probehostbinary("fakechroot");
  if (!chrootpresent && !fakepresent) {
    absentruntime("sandboxchroot", "chroot", "(and fakechroot, the unprivileged seat, is absent too)");
  }
  if (!fakepresent && !isroot()) {
    throw edgelaneerror(
      "HOST_PRIVILEGE_REQUIRED",
      "the lane sandbox-chroot requires root for a real chroot and the host carries no fakechroot (the lane never fakes a root)",
    );
  }
  return withtempdirhost(async (dir) => {
    const tree = join(dir, "root");
    await buildchroottree(tree, code, inputs);
    const env: Record<string, string> = {};
    if (inputs !== undefined) env.SADDLE_EDGE_INPUTS = "/inputs.json";
    const command = fakepresent ? "fakechroot" : "chroot";
    const args = fakepresent ? ["chroot", tree, "/bin/bash", "/script.sh"] : [tree, "/bin/bash", "/script.sh"];
    const run = await runhostprocesshost(command, args, { cwd: dir, deadline, env });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: the container extension lanes — podman to ghcr. */
/* ════════════════════════════════════════════════════════════════════ */

/** container-podman: the rootless container lane. The script mounts at
 * /work and runs through the busybox image — the pull happens inside
 * the runtime itself under the caller's deadline, the lane never
 * pre-pulls anything outside its own process. */
async function containerpodmanlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("podman")) {
    absentruntime("containerpodman", "podman");
  }
  return withtempdirhost(async (dir) => {
    await writeFile(join(dir, "script.sh"), code, "utf8");
    const inputenv = await writeinputsfilehost(dir, inputs);
    const env = inputenv === undefined ? undefined : { ...inputenv, SADDLE_EDGE_INPUTS: "/work/inputs.json" };
    const run = await runhostprocesshost(
      "podman",
      [
        "run",
        "--rm",
        "-v",
        `${dir}:/work`,
        "-w",
        "/work",
        "quay.io/libpod/busybox:latest",
        "/bin/sh",
        "/work/script.sh",
      ],
      { cwd: dir, deadline, env },
    );
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** container-containerd: the containerd supervisor lane. The code field
 * is the shell command echoed through busybox's /bin/sh inside one
 * containerd task under the native snapshotter — the task id rides the
 * monotonic counter, deterministic without crypto. */
async function containercontainerdlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("ctr")) {
    absentruntime("containercontainerd", "ctr");
  }
  return withtempdirhost(async (dir) => {
    const inputenv = await writeinputsfilehost(dir, inputs);
    const run = await runhostprocesshost(
      "ctr",
      [
        "run",
        "--rm",
        "--snapshotter",
        "native",
        "docker.io/library/busybox:latest",
        nextlaneid("saddleedge-ctr"),
        "/bin/sh",
        "-c",
        code,
      ],
      { cwd: dir, deadline, env: inputenv },
    );
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** builds one minimal oci bundle for the runc and crun seats: a
 * spec.json (process args /bin/sh -c, cwd /, a PATH env, the pid,
 * network, ipc, uts and mount namespaces, a read-only root) and a
 * rootfs seeded with busybox — without busybox on PATH there is no
 * honest bundle and the lane answers RUNTIME_BUNDLE_UNAVAILABLE. */
async function buildocibundle(dir: string, laneid: string, code: string): Promise<string> {
  if (!probehostbinary("busybox")) {
    throw edgelaneerror(
      "RUNTIME_BUNDLE_UNAVAILABLE",
      `the lane ${laneid} cannot build its rootfs: busybox is absent from PATH (the lane never fakes a bundle)`,
    );
  }
  const bundle = join(dir, "bundle");
  const rootfs = join(bundle, "rootfs");
  await mkdir(join(rootfs, "bin"), { recursive: true });
  await mkdir(join(rootfs, "tmp"), { recursive: true });
  const seat = await runhostprocesshost("bash", ["-c", "command -v busybox"], { cwd: dir, deadline: 2000 });
  const busybox = seat.stdout.trim();
  await copyFile(busybox, join(rootfs, "bin", "sh"));
  await copyFile(busybox, join(rootfs, "bin", "busybox"));
  const spec = {
    ociVersion: "1.0.2",
    process: {
      terminal: false,
      user: { uid: 0, gid: 0 },
      args: ["/bin/sh", "-c", code],
      env: ["PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"],
      cwd: "/",
    },
    root: { path: "rootfs", readonly: true },
    hostname: "saddleedge",
    linux: {
      namespaces: [{ type: "pid" }, { type: "network" }, { type: "ipc" }, { type: "uts" }, { type: "mount" }],
    },
  };
  await writeFile(join(bundle, "spec.json"), `${JSON.stringify(spec, null, 2)}\n`, "utf8");
  return bundle;
}

/** the shared oci runtime seat of container-runc and container-crun:
 * the probe, the root privilege law (the minimal spec carries no user
 * namespace mappings, so the namespace work needs root), the bundle
 * build and the run under the deadline. */
async function runocilane(
  laneid: string,
  runtime: string,
  code: string,
  inputs: unknown,
  deadline: number,
): Promise<EdgeLaneOutput> {
  if (!probehostbinary(runtime)) {
    absentruntime(laneid, runtime);
  }
  if (!isroot()) {
    throw edgelaneerror(
      "HOST_PRIVILEGE_REQUIRED",
      `the lane ${laneid} requires root to create its ${runtime} namespaces (the lane never fakes a container)`,
    );
  }
  return withtempdirhost(async (dir) => {
    const bundle = await buildocibundle(dir, laneid, code);
    const inputenv = await writeinputsfilehost(dir, inputs);
    const run = await runhostprocesshost(runtime, ["run", nextlaneid(`saddleedge-${runtime}`)], {
      cwd: bundle,
      deadline,
      env: inputenv,
    });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** container-runc: the oci process lane — spec.json plus a busybox
 * rootfs, run by runc under the deadline. */
async function containerrunclane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  return runocilane("containerrunc", "runc", code, inputs, deadline);
}

/** container-crun: the same oci bundle law through the crun runtime. */
async function containercrunlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  return runocilane("containercrun", "crun", code, inputs, deadline);
}

/** runs the code through one docker profile: the image and the
 * hardening flags ride the profile args, the script mounts at /work and
 * the inputs ride /work/inputs.json inside the container. */
async function rundockerprofile(
  dir: string,
  code: string,
  inputs: unknown,
  deadline: number,
  profileargs: readonly string[],
): Promise<EdgeLaneOutput> {
  await writeFile(join(dir, "script.sh"), code, "utf8");
  const inputenv = await writeinputsfilehost(dir, inputs);
  const env = inputenv === undefined ? undefined : { ...inputenv, SADDLE_EDGE_INPUTS: "/work/inputs.json" };
  const run = await runhostprocesshost(
    "docker",
    ["run", "--rm", "-v", `${dir}:/work`, "-w", "/work", ...profileargs, "/bin/bash", "/work/script.sh"],
    { cwd: dir, deadline, env },
  );
  return { stdout: run.stdout, stderr: run.stderr };
}

/** container-max: the docker max profile — no network, every capability
 * dropped, the pid limit raised to 256 and the memory swap left open:
 * more resources than the lite seat, the same honest spawn law. */
async function containermaxlanehost(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probedockersurface()) {
    absentruntime("containermax", "docker", "(no docker binary and no /var/run/docker.sock)");
  }
  return withtempdirhost((dir) =>
    rundockerprofile(dir, code, inputs, deadline, [
      "--network",
      "none",
      "--cap-drop",
      "ALL",
      "--pids-limit",
      "256",
      "--memory-swap",
      "-1",
      "docker.io/library/bash:5",
    ]),
  );
}

/** container-lite: the docker lite profile — no network, every
 * capability dropped, a read-only root, the pid limit at 64, 256 mb of
 * memory and a tmpfs at /tmp: the tightest honest container seat. */
async function containerlitelanehost(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probedockersurface()) {
    absentruntime("containerlite", "docker", "(no docker binary and no /var/run/docker.sock)");
  }
  return withtempdirhost((dir) =>
    rundockerprofile(dir, code, inputs, deadline, [
      "--network",
      "none",
      "--cap-drop",
      "ALL",
      "--read-only",
      "--pids-limit",
      "64",
      "--memory",
      "256m",
      "--tmpfs",
      "/tmp",
      "docker.io/library/bash:5",
    ]),
  );
}

/** container-ghcr: the immutable ghcr lane. The image rides the inputs
 * field {image, script} — without it the lane runs the distroless
 * default ghcr.io/distroless/cc:latest and echoes the script through
 * the container's /dev/stdin (docker -i): the lane feeds the payload,
 * the image answers what it answers, nothing is faked. */
async function containerghcrlanehost(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probedockersurface()) {
    absentruntime("containerghcr", "docker", "(no docker binary and no /var/run/docker.sock)");
  }
  return withtempdirhost(async (dir) => {
    const record = (inputs ?? {}) as { image?: unknown; script?: unknown };
    const image =
      typeof record.image === "string" && record.image.length > 0 ? record.image : "ghcr.io/distroless/cc:latest";
    const script = typeof record.script === "string" ? record.script : code;
    const inputenv = await writeinputsfilehost(dir, inputs);
    const run = await runhostprocesshost(
      "docker",
      ["run", "--rm", "-i", "--network", "none", "--cap-drop", "ALL", "--read-only", "--pull=missing", image],
      { cwd: dir, deadline, env: inputenv, stdin: script },
    );
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 5: the runtime lanes — the clr and workerd seats. */
/* ════════════════════════════════════════════════════════════════════ */

/** runtime-clr: the dotnet lane. When the dotnet-script tool rides the
 * host the program runs as program.csx; otherwise the lane falls back
 * to a minimal net8.0 console csproj whose Program.cs is the code field
 * — both seats spawn under the deadline, the compile answers honestly. */
async function runtimeclrlanehost(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("dotnet")) {
    absentruntime("runtimeclr", "dotnet");
  }
  const scripttool = probehostbinary("dotnet-script");
  return withtempdirhost(async (dir) => {
    const inputenv = await writeinputsfilehost(dir, inputs);
    if (scripttool) {
      await writeFile(join(dir, "program.csx"), code, "utf8");
      const run = await runhostprocesshost("dotnet", ["script", "program.csx"], { cwd: dir, deadline, env: inputenv });
      return { stdout: run.stdout, stderr: run.stderr };
    }
    await writeFile(join(dir, "Program.cs"), code, "utf8");
    await writeFile(
      join(dir, "lane.csproj"),
      [
        '<Project Sdk="Microsoft.NET.Sdk">',
        "  <PropertyGroup>",
        "    <OutputType>Exe</OutputType>",
        "    <TargetFramework>net8.0</TargetFramework>",
        "    <ImplicitUsings>disable</ImplicitUsings>",
        "    <Nullable>disable</Nullable>",
        "  </PropertyGroup>",
        "</Project>",
        "",
      ].join("\n"),
      "utf8",
    );
    const run = await runhostprocesshost("dotnet", ["run", "--project", "lane.csproj"], {
      cwd: dir,
      deadline,
      env: inputenv,
    });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** runtime-workerd: the cloudflare runtime lane. The lane writes the
 * worker as worker.js plus a minimal capnp config (one loopback http
 * socket, one worker whose module tree is the temp dir, sourceUrl
 * workerd:main) and serves it under the deadline. workerd serve is a
 * server: a healthy worker outlives the run window and answers the
 * honest RUN_DEADLINE_EXCEEDED with its startup logs riding the
 * streams — a broken config answers RUN_EXITED_NONZERO, never a fake. */
async function runtimeworkerdlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("workerd")) {
    absentruntime("runtimeworkerd", "workerd");
  }
  return withtempdirhost(async (dir) => {
    await writeFile(join(dir, "worker.js"), code, "utf8");
    await writeFile(
      join(dir, "workerd.capnp"),
      [
        "# the saddle edge lane workerd config: one loopback http socket and",
        '# one worker whose module tree is this directory (sourceUrl "workerd:main").',
        'using Workerd = import "/workerd/io/workerd.capnp";',
        "",
        "const config :Workerd.Server = (",
        '  services = [ (name = "main", worker = .mainWorker ) ],',
        '  sockets = [ (name = "http", address = "127.0.0.1:0", http = (), service = "main" ) ],',
        ");",
        "",
        "const mainWorker :Workerd.Worker = (",
        '  compatibilityDate = "2024-04-03",',
        '  sourceUrl = "workerd:main",',
        '  modules = "./",',
        ");",
        "",
      ].join("\n"),
      "utf8",
    );
    const inputenv = await writeinputsfilehost(dir, inputs);
    const run = await runhostprocesshost("workerd", ["serve", "workerd.capnp"], { cwd: dir, deadline, env: inputenv });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 6: the screen lanes — the virtual displays, never the visitor's. */
/* ════════════════════════════════════════════════════════════════════ */

/** screen-xvfb: the virtual x display lane. The script runs under
 * xvfb-run with an auto-picked display and a 1280x800x24 screen — the
 * display is a virtual server the lane spawns and kills, the visitor's
 * screen is never touched (the engine host owns this surface). */
async function screenxvfblane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("xvfb-run")) {
    absentruntime("screenxvfb", "xvfb-run");
  }
  return withtempdirhost((dir) =>
    runscript(
      "xvfb-run",
      ["-a", "--server-args=-screen 0 1280x800x24", "/bin/bash", "script.sh"],
      dir,
      code,
      inputs,
      deadline,
    ),
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 7: the mobile lane — the termux seat. */
/* ════════════════════════════════════════════════════════════════════ */

/** mobile-termux: the honest mobile lane. A linux engine host never
 * carries termux — the lane answers the coded absence; a termux host
 * (the engine running inside the android sandbox) runs the script
 * through the termux prefix environment (TERMUX_PREFIX with the prefix
 * bin on PATH), the honest emulation-free seat. */
async function mobiletermuxlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("termux")) {
    absentruntime("mobiletermux", "termux", "(the termux host prefix exists only inside a termux device host)");
  }
  return withtempdirhost(async (dir) => {
    const record = (inputs ?? {}) as { termuxprefix?: unknown };
    const prefix =
      typeof record.termuxprefix === "string" && record.termuxprefix.length > 0
        ? record.termuxprefix
        : "/data/data/com.termux/files/usr";
    const path = process.env.PATH ?? "";
    return await runscript("bash", ["script.sh"], dir, code, inputs, deadline, {
      TERMUX_PREFIX: prefix,
      PATH: `${prefix}/bin:${path}`,
    });
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 8: the build lanes — bazel, buck2 and turborepo. */
/* ════════════════════════════════════════════════════════════════════ */

/** build-bazel: the bazel lane. A minimal BUILD file wires the script
 * as one sh_binary and bazel runs it in batch mode with the system and
 * home rc files refused, HOME pointed at the temp dir and the output
 * user root inside it — the build caches the engine host may own are
 * never touched, nothing leaks outside the private dir. */
async function buildbazellane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("bazel")) {
    absentruntime("buildbazel", "bazel");
  }
  return withtempdirhost(async (dir) => {
    await writeFile(join(dir, "MODULE.bazel"), "", "utf8");
    await writeFile(join(dir, "BUILD"), 'sh_binary(\n  name = "lane",\n  srcs = ["script.sh"],\n)\n', "utf8");
    return await runscript(
      "bazel",
      ["--batch", "--nosystem_rc", "--nohome_rc", `--output_user_root=${join(dir, "out")}`, "run", "//:lane"],
      dir,
      code,
      inputs,
      deadline,
      { HOME: dir },
    );
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 9: the ci runner lanes — the actions seat. */
/* ════════════════════════════════════════════════════════════════════ */

/** the actions runner root seat: the ACTIONS_RUNNER_ROOT env pointing
 * at a real directory, or the empty string when the host carries none. */
function actionsrunnerroot(): string {
  const root = process.env.ACTIONS_RUNNER_ROOT;
  return typeof root === "string" && root.length > 0 && existsSync(root) ? root : "";
}

/** ci-actions: the github actions runner lane. The probe is the
 * Runner.Listener binary on PATH or the ACTIONS_RUNNER_ROOT directory;
 * when present the lane runs the listener in once mode through its own
 * root and answers its streams — the job the listener pulls answers the
 * configured service, the code and the inputs ride the env surface for
 * the job side to pick up, nothing is faked. */
async function ciactionslane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const root = actionsrunnerroot();
  if (root.length === 0 && !probehostbinary("Runner.Listener")) {
    absentruntime("ciactions", "actions-runner", "(no Runner.Listener on PATH and no ACTIONS_RUNNER_ROOT directory)");
  }
  return withtempdirhost(async (dir) => {
    let runnerroot = root;
    if (runnerroot.length === 0) {
      const seat = await runhostprocesshost("bash", ["-c", "command -v Runner.Listener"], {
        cwd: dir,
        deadline: Math.min(deadline, 2000),
      });
      runnerroot = dirname(seat.stdout.trim());
    }
    await writeFile(join(dir, "script.sh"), code, "utf8");
    const inputenv = await writeinputsfilehost(dir, inputs);
    const run = await runhostprocesshost("./Runner.Listener", ["run", "--once"], {
      cwd: runnerroot,
      deadline,
      env: inputenv,
    });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 10: the network tunnel lanes — tor, i2p and wireguard. */
/* ════════════════════════════════════════════════════════════════════ */

/** network-tor: the onion lane. The lane starts tor inside the private
 * temp dir (its data directory and logs stay there), waits up to three
 * seconds for the socks port to accept a connection, runs the code as
 * a bash script with ALL_PROXY pointing at the circuit and tears tor
 * down in the finally — no daemon outlives the lane, and a circuit that
 * never opens answers the deadline refusal, never a fake tunnel. */
async function networktorlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("tor")) {
    absentruntime("networktor", "tor");
  }
  return withtempdirhost(async (dir) => {
    const tordata = join(dir, "tordata");
    await mkdir(tordata, { recursive: true });
    const daemon = spawn(
      "tor",
      [
        "--SocksPort",
        "9050",
        "--DataDirectory",
        tordata,
        "--ControlPort",
        "0",
        "--Log",
        `notice file ${join(dir, "tor.log")}`,
      ],
      { cwd: dir, stdio: "ignore", env: process.env },
    );
    try {
      const opened = await waitforport(9050, Math.min(3000, Math.max(250, deadline)));
      if (!opened) {
        throw edgelaneerror(
          "RUN_DEADLINE_EXCEEDED",
          "the tor socks port 9050 never opened within its 3 s wait (the lane network-tor refuses to run a script without the circuit)",
        );
      }
      return await runscript("bash", ["script.sh"], dir, code, inputs, deadline, {
        ALL_PROXY: "socks5://127.0.0.1:9050",
      });
    } finally {
      daemon.kill("SIGTERM");
      const exited = await waitforexit(daemon, 1500);
      if (!exited) {
        daemon.kill("SIGKILL");
        await waitforexit(daemon, 1500);
      }
    }
  });
}

/** network-i2p: the i2p tunnel lane. The runtime seat is the i2prouter
 * binary: when the router console (7657) already answers, the script
 * rides the existing tunnel; otherwise the lane starts the router,
 * waits up to five seconds for the console and runs the script with
 * the i2p proxy env (I2P_PROXY_HOST/I2P_PROXY_PORT at the 4444 http
 * proxy). The router the lane started gets its graceful stop in the
 * finally — a console that never opens answers the deadline refusal. */
async function networki2plane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("i2prouter")) {
    absentruntime(
      "networki2p",
      "i2p",
      "(the i2prouter binary is absent and the router console 7657 cannot be managed)",
    );
  }
  return withtempdirhost(async (dir) => {
    let startedrouter = false;
    try {
      const consoleopen = await waitforport(7657, 300);
      if (!consoleopen) {
        await runhostprocesshost("i2prouter", ["start"], { cwd: dir, deadline: Math.min(deadline, 8000) });
        startedrouter = true;
        const opened = await waitforport(7657, Math.min(5000, Math.max(250, deadline)));
        if (!opened) {
          throw edgelaneerror(
            "RUN_DEADLINE_EXCEEDED",
            "the i2p router console 7657 never opened within its 5 s wait (the lane network-i2p refuses to run a script without the tunnel)",
          );
        }
      }
      return await runscript("bash", ["script.sh"], dir, code, inputs, deadline, {
        I2P_PROXY_HOST: "127.0.0.1",
        I2P_PROXY_PORT: "4444",
      });
    } finally {
      if (startedrouter) {
        try {
          await runhostprocesshost("i2prouter", ["graceful"], { cwd: dir, deadline: Math.min(deadline, 8000) });
        } catch {
          // the graceful stop is the honest best effort: the router owns
          // its own daemon lifecycle and answers its own error here
        }
      }
    }
  });
}

/** network-wireguard: the interface handshake lane. An empty code field
 * answers the honest report — the wg show capture plus one wg genkey |
 * wg pubkey pair generation on stdout; a non-empty code field runs as a
 * bash script with the wg tools on PATH, and a script that asks for a
 * wg-quick interface bring-up needs root: a non-root engine answers
 * the coded privilege refusal, never a wrapped errno. */
async function networkwireguardlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("wg")) {
    absentruntime("networkwireguard", "wg");
  }
  return withtempdirhost(async (dir) => {
    const inputenv = (await writeinputsfilehost(dir, inputs)) ?? {};
    if (code.trim().length === 0) {
      let report = "";
      let reporterr = "";
      try {
        const show = await runhostprocesshost("wg", ["show"], { cwd: dir, deadline, env: inputenv });
        report = show.stdout;
        reporterr = show.stderr;
      } catch (error) {
        // wg show on a host without interfaces or privileges answers
        // nonzero: the report is informational, the failure rides stderr
        reporterr = `${errormessage(error)}${(error as { stderr?: string }).stderr ?? ""}`;
      }
      const pair = await runhostprocesshost("bash", ["-c", "wg genkey | wg pubkey"], {
        cwd: dir,
        deadline,
        env: inputenv,
      });
      return { stdout: `${report}${pair.stdout}`.trim(), stderr: `${reporterr}${pair.stderr}` };
    }
    if (code.trimStart().startsWith("wg-quick") && !isroot()) {
      throw edgelaneerror(
        "HOST_PRIVILEGE_REQUIRED",
        "the lane network-wireguard requires root to bring a wg-quick interface up (the lane never fakes a handshake)",
      );
    }
    await writeFile(join(dir, "script.sh"), code, "utf8");
    const run = await runhostprocesshost("bash", ["script.sh"], { cwd: dir, deadline, env: inputenv });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 12: the wiring wave lanes — the language toolchains, the    */
/* runner seats and the build tail (the twelve that close the plane).  */
/* ════════════════════════════════════════════════════════════════════ */

/** runner-deno: the deno runner lane. The program rides a temp main.ts
 * executed by `deno run` with the read permission scoped to the inputs
 * file and DENO_DIR pointed inside the private tree (the module cache
 * never touches the host home) — the inputs ride the env surface, and
 * an absent deno answers the coded absence, never a faked module run. */
async function runnerdenolane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("deno")) {
    absentruntime("runnerdeno", "deno");
  }
  return withtempdirhost(async (dir) => {
    await writeFile(join(dir, "main.ts"), code, "utf8");
    const inputenv = await writeinputsfilehost(dir, inputs);
    const run = await runhostprocesshost("deno", ["run", "--allow-read=inputs.json", "main.ts"], {
      cwd: dir,
      deadline,
      env: { ...inputenv, DENO_DIR: join(dir, "denodir") },
    });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** language-rust: the rustc toolchain lane. The program rides a temp
 * main.rs compiled by rustc into the private tree (the -O seat, the
 * binary never leaves the temp dir) and executed under the same
 * deadline — the compile answers honestly, the run answers its own
 * streams. */
async function languagerustlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("rustc")) {
    absentruntime("languagerust", "rustc");
  }
  return withtempdirhost(async (dir) => {
    await writeFile(join(dir, "main.rs"), code, "utf8");
    const inputenv = await writeinputsfilehost(dir, inputs);
    await runhostprocesshost("rustc", ["-O", "-o", "lanebin", "main.rs"], { cwd: dir, deadline, env: inputenv });
    const run = await runhostprocesshost("./lanebin", [], { cwd: dir, deadline, env: inputenv });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** language-cargo: the cargo build lane. A minimal Cargo.toml plus
 * src/main.rs (the code field) run through `cargo run --quiet` with
 * CARGO_HOME and the target dir inside the private tree — the registry
 * caches the host may own are never touched, nothing leaks outside the
 * temp dir. */
async function languagecargolane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("cargo")) {
    absentruntime("languagecargo", "cargo");
  }
  return withtempdirhost(async (dir) => {
    await writeFile(
      join(dir, "Cargo.toml"),
      [
        "# the saddle edge cargo lane: one binary, zero dependencies,",
        "# the home, the caches and the target tree stay inside the dir.",
        "[package]",
        'name = "saddle-edge-lane"',
        'version = "0.0.0"',
        'edition = "2021"',
        "",
        "[dependencies]",
        "",
      ].join("\n"),
      "utf8",
    );
    await mkdir(join(dir, "src"), { recursive: true });
    await writeFile(join(dir, "src", "main.rs"), code, "utf8");
    const inputenv = await writeinputsfilehost(dir, inputs);
    const run = await runhostprocesshost("cargo", ["run", "--quiet"], {
      cwd: dir,
      deadline,
      env: { ...inputenv, CARGO_HOME: join(dir, "cargohome"), CARGO_TARGET_DIR: join(dir, "target") },
    });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** language-v: the v compiler lane. The program rides a temp main.v run
 * through `v run` (the compile and the run answer inside the same
 * deadline) with HOME pointed at the private dir so the v cache never
 * leaves the temp tree. */
async function languagevlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("v")) {
    absentruntime("languagev", "v");
  }
  return withtempdirhost(async (dir) => {
    await writeFile(join(dir, "main.v"), code, "utf8");
    const inputenv = await writeinputsfilehost(dir, inputs);
    const run = await runhostprocesshost("v", ["run", "main.v"], {
      cwd: dir,
      deadline,
      env: { ...inputenv, HOME: dir },
    });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** language-dotnet: the dotnet runtime lane of the language family. The
 * program rides a temp Program.cs inside one minimal net8.0 console
 * csproj (ImplicitUsings and Nullable disabled — the program owns its
 * own usings), run through `dotnet run` with DOTNET_CLI_HOME, the nuget
 * package dir and the telemetry opt-out pointed inside the private tree
 * — the first-run caches the host may own are never touched. */
async function languagedotnetlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("dotnet")) {
    absentruntime("languagedotnet", "dotnet");
  }
  return withtempdirhost(async (dir) => {
    await writeFile(join(dir, "Program.cs"), code, "utf8");
    await writeFile(
      join(dir, "lane.csproj"),
      [
        '<Project Sdk="Microsoft.NET.Sdk">',
        "  <PropertyGroup>",
        "    <OutputType>Exe</OutputType>",
        "    <TargetFramework>net8.0</TargetFramework>",
        "    <ImplicitUsings>disable</ImplicitUsings>",
        "    <Nullable>disable</Nullable>",
        "  </PropertyGroup>",
        "</Project>",
        "",
      ].join("\n"),
      "utf8",
    );
    const inputenv = await writeinputsfilehost(dir, inputs);
    const run = await runhostprocesshost("dotnet", ["run", "--project", "lane.csproj"], {
      cwd: dir,
      deadline,
      env: {
        ...inputenv,
        DOTNET_CLI_HOME: dir,
        NUGET_PACKAGES: join(dir, "nuget"),
        DOTNET_CLI_TELEMETRY_OPTOUT: "1",
      },
    });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** language-php: the php interpreter lane. The program rides a temp
 * main.php executed by the php cli with the inputs surface riding the
 * env — an honest spawn, nothing else. */
async function languagephplane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("php")) {
    absentruntime("languagephp", "php");
  }
  return withtempdirhost(async (dir) => {
    await writeFile(join(dir, "main.php"), code, "utf8");
    const inputenv = await writeinputsfilehost(dir, inputs);
    const run = await runhostprocesshost("php", ["main.php"], { cwd: dir, deadline, env: inputenv });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** language-lua: the lua interpreter lane. The same honest spawn law —
 * the program rides a temp main.lua through the lua cli. */
async function languagelualane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("lua")) {
    absentruntime("languagelua", "lua");
  }
  return withtempdirhost(async (dir) => {
    await writeFile(join(dir, "main.lua"), code, "utf8");
    const inputenv = await writeinputsfilehost(dir, inputs);
    const run = await runhostprocesshost("lua", ["main.lua"], { cwd: dir, deadline, env: inputenv });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** language-zig: the zig toolchain lane. The program rides a temp
 * main.zig run through `zig run` (the compile and the run answer inside
 * the same deadline) with the global cache pointed inside the private
 * tree — the local cache dies with the temp dir. */
async function languageziglane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("zig")) {
    absentruntime("languagezig", "zig");
  }
  return withtempdirhost(async (dir) => {
    await writeFile(join(dir, "main.zig"), code, "utf8");
    const inputenv = await writeinputsfilehost(dir, inputs);
    const run = await runhostprocesshost("zig", ["run", "main.zig"], {
      cwd: dir,
      deadline,
      env: { ...inputenv, ZIG_GLOBAL_CACHE_DIR: join(dir, "zigcache") },
    });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** language-nim: the nim compiler lane. The program rides a temp main.nim
 * run through `nim r` with the nimcache inside the private tree — the
 * build artifacts die with the temp dir. */
async function languagenimlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("nim")) {
    absentruntime("languagenim", "nim");
  }
  return withtempdirhost(async (dir) => {
    await writeFile(join(dir, "main.nim"), code, "utf8");
    const inputenv = await writeinputsfilehost(dir, inputs);
    const run = await runhostprocesshost("nim", ["r", `--nimcache:${join(dir, "nimcache")}`, "main.nim"], {
      cwd: dir,
      deadline,
      env: inputenv,
    });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** build-make: the make lane. The code field is the Makefile itself:
 * the lane writes it inside the private dir and runs the default goal
 * through `make` — the recipe answers its own streams, the inputs ride
 * the env surface. */
async function buildmakelane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("make")) {
    absentruntime("buildmake", "make");
  }
  return withtempdirhost(async (dir) => {
    await writeFile(join(dir, "Makefile"), code, "utf8");
    const inputenv = await writeinputsfilehost(dir, inputs);
    const run = await runhostprocesshost("make", [], { cwd: dir, deadline, env: inputenv });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** build-ninja: the ninja lane. The code field is the build.ninja file
 * itself: the lane writes it inside the private dir and runs the default
 * targets through `ninja` — the build graph answers its own streams. */
async function buildninjalane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("ninja")) {
    absentruntime("buildninja", "ninja");
  }
  return withtempdirhost(async (dir) => {
    await writeFile(join(dir, "build.ninja"), code, "utf8");
    const inputenv = await writeinputsfilehost(dir, inputs);
    const run = await runhostprocesshost("ninja", [], { cwd: dir, deadline, env: inputenv });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** runner-wasi: the wasi preview lane. The code field is the base64 wasm
 * module (the runner-wasm precedent): the lane decodes it into
 * module.wasm inside the private tree and runs it through `wasmtime
 * run` — a module wasmtime refuses answers its own honest exit, an
 * absent wasmtime answers the coded absence, never a faked boot. */
async function runnerwasilane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("wasmtime")) {
    absentruntime("runnerwasi", "wasmtime");
  }
  return withtempdirhost(async (dir) => {
    await writeFile(join(dir, "module.wasm"), Buffer.from(String(code), "base64"));
    const inputenv = await writeinputsfilehost(dir, inputs);
    const run = await runhostprocesshost("wasmtime", ["run", "module.wasm"], { cwd: dir, deadline, env: inputenv });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 13: the lane table — the specs, the executors, the ids. */
/* ════════════════════════════════════════════════════════════════════ */

/** the host lane table of the ninety modalities waves, group a: the
 * thirty-seven host binary lanes — the twenty-five of the first wave
 * ride kind live and the twelve of the wiring wave ride kind host (the
 * runtime probe rung — the executor exists and drives the runtime when
 * the host carries it). The ids are pinned — the dispatcher merge and
 * the api surface read them exactly. */
export const hostlanespecs: readonly HostLaneSpec[] = Object.freeze([
  { modality: "sandboxbubblewrap", kind: "live", runtime: "bwrap", present: () => probehostbinary("bwrap") },
  { modality: "sandboxnsjail", kind: "live", runtime: "nsjail", present: () => probehostbinary("nsjail") },
  {
    modality: "sandboxchroot",
    kind: "live",
    runtime: "chroot",
    present: () => probehostbinary("chroot") || probehostbinary("fakechroot"),
  },
  { modality: "containerpodman", kind: "live", runtime: "podman", present: () => probehostbinary("podman") },
  { modality: "containercontainerd", kind: "live", runtime: "ctr", present: () => probehostbinary("ctr") },
  { modality: "containerrunc", kind: "live", runtime: "runc", present: () => probehostbinary("runc") },
  { modality: "containercrun", kind: "live", runtime: "crun", present: () => probehostbinary("crun") },
  { modality: "containermax", kind: "live", runtime: "docker", present: probedockersurface },
  { modality: "containerlite", kind: "live", runtime: "docker", present: probedockersurface },
  { modality: "containerghcr", kind: "live", runtime: "docker", present: probedockersurface },
  { modality: "runtimeclr", kind: "live", runtime: "dotnet", present: () => probehostbinary("dotnet") },
  { modality: "runtimeworkerd", kind: "live", runtime: "workerd", present: () => probehostbinary("workerd") },
  { modality: "screenxvfb", kind: "live", runtime: "xvfb-run", present: () => probehostbinary("xvfb-run") },
  { modality: "mobiletermux", kind: "live", runtime: "termux", present: () => probehostbinary("termux") },
  { modality: "buildbazel", kind: "live", runtime: "bazel", present: () => probehostbinary("bazel") },
  {
    modality: "ciactions",
    kind: "live",
    runtime: "actions-runner",
    present: () => probehostbinary("Runner.Listener") || actionsrunnerroot().length > 0,
  },
  { modality: "networktor", kind: "live", runtime: "tor", present: () => probehostbinary("tor") },
  { modality: "networki2p", kind: "live", runtime: "i2p", present: () => probehostbinary("i2prouter") },
  { modality: "networkwireguard", kind: "live", runtime: "wg", present: () => probehostbinary("wg") },
  // the wiring wave lanes: the language toolchains, the runner seats and
  // the build tail — kind host (the runtime probe rung), the executors
  // drive the runtimes when the hosts carry them
  { modality: "buildmake", kind: "host", runtime: "make", present: () => probehostbinary("make") },
  { modality: "buildninja", kind: "host", runtime: "ninja", present: () => probehostbinary("ninja") },
  { modality: "languagecargo", kind: "host", runtime: "cargo", present: () => probehostbinary("cargo") },
  { modality: "languagedotnet", kind: "host", runtime: "dotnet", present: () => probehostbinary("dotnet") },
  { modality: "languagelua", kind: "host", runtime: "lua", present: () => probehostbinary("lua") },
  { modality: "languagenim", kind: "host", runtime: "nim", present: () => probehostbinary("nim") },
  { modality: "languagephp", kind: "host", runtime: "php", present: () => probehostbinary("php") },
  { modality: "languagerust", kind: "host", runtime: "rustc", present: () => probehostbinary("rustc") },
  { modality: "languagev", kind: "host", runtime: "v", present: () => probehostbinary("v") },
  { modality: "languagezig", kind: "host", runtime: "zig", present: () => probehostbinary("zig") },
  { modality: "runnerdeno", kind: "host", runtime: "deno", present: () => probehostbinary("deno") },
  { modality: "runnerwasi", kind: "host", runtime: "wasmtime", present: () => probehostbinary("wasmtime") },
]);

/** the host lane executor table: one executor per lane id, keyed by the
 * modality id in the same order as the spec table — the twenty-five of
 * the first wave beside the twelve of the wiring wave; the dispatch
 * plane refuses to boot over a lane it cannot wire. */
/* the honesty wrap of the host lane plane: every lane executor rides a
 * guard that rewrites a coded absence into the lane-naming form the
 * honesty law pins — the refusal always names the runtime AND the lane
 * (modality id) it refused, so an operator reading the error learns both
 * seats of the refusal without opening the source. */
const edgelaneexecutorstable: Readonly<Record<string, EdgeLaneExecutor>> = Object.freeze({
  "sandboxbubblewrap": sandboxbubblewraplane,
  "sandboxnsjail": sandboxnsjaillane,
  "sandboxchroot": sandboxchrootlane,
  "containerpodman": containerpodmanlane,
  "containercontainerd": containercontainerdlane,
  "containerrunc": containerrunclane,
  "containercrun": containercrunlane,
  "containermax": containermaxlanehost,
  "containerlite": containerlitelanehost,
  "containerghcr": containerghcrlanehost,
  "runtimeclr": runtimeclrlanehost,
  "runtimeworkerd": runtimeworkerdlane,
  "screenxvfb": screenxvfblane,
  "mobiletermux": mobiletermuxlane,
  "buildbazel": buildbazellane,
  "ciactions": ciactionslane,
  "networktor": networktorlane,
  "networki2p": networki2plane,
  "networkwireguard": networkwireguardlane,
  "buildmake": buildmakelane,
  "buildninja": buildninjalane,
  "languagecargo": languagecargolane,
  "languagedotnet": languagedotnetlane,
  "languagelua": languagelualane,
  "languagenim": languagenimlane,
  "languagephp": languagephplane,
  "languagerust": languagerustlane,
  "languagev": languagevlane,
  "languagezig": languageziglane,
  "runnerdeno": runnerdenolane,
  "runnerwasi": runnerwasilane,
});

/** the wrapped host executor map: one guard per lane, the refusal law. */
export const edgelaneexecutorshost: Readonly<Record<string, EdgeLaneExecutor>> = Object.freeze(
  Object.fromEntries(
    Object.entries(edgelaneexecutorstable).map(([id, executor]) => {
      const guarded: EdgeLaneExecutor = async (code, inputs, deadline) => {
        try {
          return await executor(code, inputs, deadline);
        } catch (error) {
          const laneerror = error as { code?: string; message?: string };
          if (laneerror?.code === "HOST_RUNTIME_ABSENT" && typeof laneerror.message === "string") {
            if (!laneerror.message.includes(id)) {
              throw edgelaneerror(
                "HOST_RUNTIME_ABSENT",
                `the lane ${id} refuses the run: ${laneerror.message}`,
              );
            }
          }
          throw error;
        }
      };
      return [id, guarded] as const;
    }),
  ),
);

/** the host lane ids in the spec order — the pinned contract the
 * dispatcher merge and the api surface read exactly. */
export const hostlaneids: readonly string[] = Object.freeze(hostlanespecs.map((lane) => lane.modality));

/* the wiring self-check: the host lane table refuses to load over a gap
 * between the specs and the executors (a spec without an executor is a
 * miswired lane, and miswiring must fail loud at boot, never silently
 * at run time). */
for (const lane of hostlanespecs) {
  if (edgelaneexecutorshost[lane.modality] === undefined) {
    throw new Error(`the host lane plane is miswired: no executor for the lane ${lane.modality}`);
  }
}
for (const id of Object.keys(edgelaneexecutorshost)) {
  if (!hostlaneids.includes(id)) {
    throw new Error(`the host lane plane is miswired: the executor ${id} carries no spec`);
  }
}

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: edgelandesinproc.ts — the in-process lanes (group b).        */
/* (consolidation note: the duplicate helpers netmime, utf8, errormessage */
/* and encodeline — verbatim copies of the earlier sections' — ride the  */
/* net/base declarations; this section's own parsemanifest,              */
/* networkdnslane, networkdohlane, ramswapfilelane, ramtmpfslane,        */
/* ramzramlane, storagelibsqllane, storagemysqllane and storages3lane    */
/* keep their logic verbatim under their group-suffixed names —          */
/* parsemanifestinproc, networkdnslaneinproc, networkdohlaneinproc,      */
/* ramswapfilelaneinproc, ramtmpfslaneinproc, ramzramlaneinproc,         */
/* storagelibsqllaneinproc, storagemysqllaneinproc,                      */
/* storages3laneinproc — because the net and base sections own the       */
/* un-suffixed seats of the dispatch reality law.)                       */
/* ══════════════════════════════════════════════════════════════════════ */

// # edgelandesinproc.ts — the in-process modality lanes of the ninety
// modalities waves (group b): the ram recipes, the delivery wire frames,
// the storage wire handshakes, the webcontainer seat and the local
// opt-in gate of the first wave plus the five seats of the wiring wave
// (the serverless runner, the git objects vfs, the sqlite vault and the
// dns and doh resolvers) — twenty-four registry modalities wired as
// honest pure typescript execution lanes that run inside the engine
// process itself.
// No host binary is spawned and no network socket is opened: the code
// field is the program or payload the lane interprets (a ram recipe
// manifest, a wire payload, a sql manifest, a javascript module) and the
// lane answers real computed output — mounted trees, framed bytes,
// handshake packets, captured exports. The laws every lane keeps:
// - the visitor law: everything runs server-side in the engine process,
//   the visitor browser, gpu, cpu and storage are never touched (the
//   local-optin lane is the only lane that may even name the visitor
//   machine, and only under declared consent — and even then it answers
//   a manifest, it never touches the machine);
// - the oom guard: every ram recipe reads its byte ceiling from
//   inputs.budgetmb (the default 64 mb) and refuses to materialize a
//   single byte over it (RAM_QUOTA_EXCEEDED), reading the declared size
//   from the manifest numbers before any allocation rides;
// - the honest payload law: a lane whose manifest is not valid json or
//   not the recipe's shape answers INVALID_LANE_PAYLOAD, a module that
//   throws answers VM_MODULE_FAILED — no lane fakes a run;
// - the determinism law: fixed masks, fixed capability sets, fnv-1a
//   hashes and stored-block zlib streams — the same payload answers the
//   same bytes every run, no crypto, no randomness, no clock;
// - the artifact law: every lane answers one artifact under the mime its
//   registry record declares (the wire, disk and frame bytes ride inside
//   the artifact manifest as hex so the mime contract stays true).

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the lane contract — the in-process spec surface the dispatcher reads. */
/* ════════════════════════════════════════════════════════════════════ */

/** one in-process lane declaration: the modality id the registry and the
 * dispatcher read, the kind (every lane here executes in-process, so
 * live), the runtime surface it rides and the honest presence probe of
 * that surface. */
export interface InprocLaneSpec {
  /** the modality id of the registry record the lane wires. */
  modality: string;
  /** live lanes execute in-process; host lanes probe (none live here). */
  kind: "live" | "host";
  /** the runtime surface the lane rides ("pure-ts", "node:vm"). */
  runtime: string;
  /** the honest presence probe of the in-process surface. */
  present: () => boolean;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the shared recipe surface — encoders, hashes and the manifest readers. */
/* ════════════════════════════════════════════════════════════════════ */

/** the artifact mime of the ram family (the registry record declares it). */
const rammime = "application/vnd.devthink.ram+json";
/** the artifact mime of the delivery family (the registry record declares it). */
const cdnmime = "application/vnd.devthink.cdn+json";
/** the artifact mime of the storage wire family (the registry record declares it). */
const storagemime = "application/vnd.devthink.storage+json";
/** the artifact mime of the browser family (the registry record declares it). */
const browsermime = "application/vnd.devthink.browser+json";
/** the artifact mime of the local family (the registry record declares it). */
const localmime = "application/vnd.devthink.local+json";
/** the artifact mime of the runner family (the registry record declares it). */
const runmime = "application/vnd.devthink.run+json";
/** the artifact mime of the fs family (the registry record declares it). */
const vfsmime = "application/vnd.devthink.vfs+json";
/** the default ram byte ceiling of the oom guard: 64 mb. */
const defaultbudgetmb = 64;
/** the bytes of one megabyte (the oom guard's unit). */
const bytespermib = 1048576;

/** encodes bytes as lowercase hex (the manifest's byte carrying form). */
function tohex(bytes: Uint8Array): string {
  let hex = "";
  for (let index = 0; index < bytes.byteLength; index += 1) hex += bytes[index].toString(16).padStart(2, "0");
  return hex;
}

/** decodes one hex string into bytes: an even-length hex string only —
 * anything else answers INVALID_LANE_PAYLOAD naming the manifest field. */
function fromhex(lane: string, value: unknown, field: string): Uint8Array {
  if (typeof value !== "string" || value.length % 2 !== 0 || /[^0-9a-fA-F]/.test(value)) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", `the lane ${lane} requires hex bytes in the manifest field ${field}`);
  }
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.byteLength; index += 1) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

/** the fnv-1a 32 hash of one string, answered as 8 lowercase hex chars —
 * the lane's deterministic content addressing (no crypto, no randomness). */
function fnv1a(text: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/** the keyed fnv-1a 32 hash — the signer's key walks the offset basis
 * before the message rides: the lane's documented deterministic signer,
 * honest about never claiming aws sigv4. */
function keyedfnv1a(key: string, message: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  for (let index = 0; index < message.length; index += 1) {
    hash ^= message.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/** parses the code field as one json object manifest: a non-json payload
 * or a non-object document answers INVALID_LANE_PAYLOAD. */
function parsemanifestinproc(lane: string, code: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(code);
  } catch (error) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} requires a json object manifest in the code field: ${errormessage(error)}`,
    );
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", `the lane ${lane} requires a json object manifest in the code field`);
  }
  return parsed as Record<string, unknown>;
}

/** reads one non-negative safe integer manifest field. */
function manifestuint(lane: string, value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} requires a non-negative integer in the manifest field ${field}`,
    );
  }
  return value;
}

/** reads one nonempty string manifest field. */
function manifesttext(lane: string, value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} requires a nonempty string in the manifest field ${field}`,
    );
  }
  return value;
}

/** reads one [offset, length] manifest pair of non-negative integers. */
function manifestwindow(lane: string, value: unknown, field: string): [number, number] {
  if (!Array.isArray(value) || value.length !== 2) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} requires an [offset, length] pair in the manifest field ${field}`,
    );
  }
  return [manifestuint(lane, value[0], `${field}[0]`), manifestuint(lane, value[1], `${field}[1]`)];
}

/** reads one manifest file map (name → hex bytes), answering the decoded
 * entries sorted by name (code point order — no locale walks the answer). */
function manifestfiles(lane: string, value: unknown, field: string): [string, Uint8Array][] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} requires a name to hex file map in the manifest field ${field}`,
    );
  }
  const entries: [string, Uint8Array][] = [];
  for (const [name, hex] of Object.entries(value)) {
    if (name.length === 0) {
      throw edgelaneerror(
        "INVALID_LANE_PAYLOAD",
        `the lane ${lane} refuses an empty file name in the manifest field ${field}`,
      );
    }
    entries.push([name, fromhex(lane, hex, `${field}.${name}`)]);
  }
  return entries.sort((left, right) => (left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0));
}

/** reads the oom guard ceiling in bytes: inputs.budgetmb (a non-negative
 * finite number of megabytes) or the 64 mb default. */
function ramceiling(inputs: unknown): number {
  if (typeof inputs === "object" && inputs !== null) {
    const budget = (inputs as Record<string, unknown>).budgetmb;
    if (typeof budget === "number" && Number.isFinite(budget) && budget >= 0) return budget * bytespermib;
  }
  return defaultbudgetmb * bytespermib;
}

/** the oom guard of every ram lane: the declared bytes the manifest asks
 * the lane to materialize are refused over the ceiling before a single
 * allocation rides. */
function assertramquota(lane: string, declaredbytes: number, inputs: unknown): void {
  const ceiling = ramceiling(inputs);
  if (declaredbytes > ceiling) {
    throw edgelaneerror(
      "RAM_QUOTA_EXCEEDED",
      `the ram lane ${lane} refuses to materialize ${declaredbytes} bytes under its ${ceiling} byte ceiling (inputs.budgetmb)`,
    );
  }
}

/** answers one lane output whose stdout is the encodeline report and
 * whose artifact is the json manifest under the lane mime. */
function lanereport(mime: string, report: unknown, manifest: unknown): EdgeLaneOutput {
  return {
    stdout: encodeline(report),
    artifact: { mime, bytes: utf8.encode(JSON.stringify(manifest)) },
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: the ram family — the memory ladder recipes under the oom guard. */
/* ════════════════════════════════════════════════════════════════════ */

/** the rfc1950 adler32 checksum of one byte array (the stored-block
 * zlib wrapper's closing word, big-endian in the stream). */
function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (let index = 0; index < bytes.byteLength; index += 1) {
    a = (a + bytes[index]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

/** compresses one byte page with the lane's real stored-block zlib
 * wrapper: the two byte rfc1950 header (0x78 0x01), the deflate stored
 * blocks (bfinal on the last block, the len and one's-complement nlen
 * little-endian, at most 65535 raw bytes per block) and the rfc1950
 * adler32 checksum big-endian — a real, deterministic,
 * decompressor-verifiable stream with no entropy coding. */
function storedzlib(page: Uint8Array): Uint8Array {
  const blockcount = Math.max(1, Math.ceil(page.byteLength / 65535));
  const stream = new Uint8Array(2 + blockcount * 5 + page.byteLength + 4);
  stream[0] = 0x78;
  stream[1] = 0x01;
  let offset = 2;
  for (let index = 0; index < blockcount; index += 1) {
    const start = index * 65535;
    const chunk = page.subarray(start, Math.min(start + 65535, page.byteLength));
    stream[offset] = index === blockcount - 1 ? 1 : 0;
    offset += 1;
    stream[offset] = chunk.byteLength & 0xff;
    stream[offset + 1] = chunk.byteLength >> 8;
    offset += 2;
    const nlen = ~chunk.byteLength & 0xffff;
    stream[offset] = nlen & 0xff;
    stream[offset + 1] = nlen >> 8;
    offset += 2;
    stream.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const checksum = adler32(page);
  stream[offset] = (checksum >>> 24) & 0xff;
  stream[offset + 1] = (checksum >>> 16) & 0xff;
  stream[offset + 2] = (checksum >>> 8) & 0xff;
  stream[offset + 3] = checksum & 0xff;
  return stream;
}

/** ram-tmpfs: the in-memory tmpfs lane. The code field is the mount
 * manifest {"mount":"tmpfs","files":{"<name>":"<hex>"}}: the lane mounts
 * the files into one in-memory tree (a map of path to bytes) under the
 * oom guard and answers the mounted report — file count and total bytes
 * on stdout, the serialized tree manifest as the artifact. */
async function ramtmpfslaneinproc(code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifestinproc("ramtmpfs", code);
  if (manifest.mount !== "tmpfs") {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", 'the ram-tmpfs lane requires the manifest field mount "tmpfs"');
  }
  const entries = manifestfiles("ramtmpfs", manifest.files, "files");
  const totalbytes = entries.reduce((sum, entry) => sum + entry[1].byteLength, 0);
  assertramquota("ramtmpfs", totalbytes, inputs);
  const tree = new Map(entries);
  const files: Record<string, string> = {};
  for (const [name, bytes] of tree) files[name] = tohex(bytes);
  return lanereport(
    rammime,
    { mount: "tmpfs", filecount: tree.size, totalbytes, files: [...tree.keys()] },
    { mount: "tmpfs", files },
  );
}

/** ram-mmap: the zero-copy byte window lane. The code field is the
 * window manifest {"window":[offset,len],"bytes":"<hex>"}: the lane
 * materializes one array buffer over the bytes (the whole mapping),
 * answers the zero-copy subarray window view inside it and reports the
 * window bounds — the window bytes ride the artifact. */
async function rammmaplane(code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifestinproc("rammmap", code);
  const buffer = fromhex("rammmap", manifest.bytes, "bytes");
  const window = manifestwindow("rammmap", manifest.window, "window");
  assertramquota("rammmap", buffer.byteLength, inputs);
  const [offset, length] = window;
  if (length > buffer.byteLength - offset) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the ram-mmap window [${offset}, ${length}] escapes the ${buffer.byteLength} byte mapping`,
    );
  }
  const view = buffer.subarray(offset, offset + length);
  return lanereport(
    rammime,
    { bufferbytes: buffer.byteLength, window: [offset, offset + length], viewbytes: view.byteLength },
    { window: [offset, length], bytes: tohex(view) },
  );
}

/** ram-overlayfs: the layer union lane. The code field is the overlay
 * manifest {"lower":{...},"upper":{...}}: the lane merges the two layers
 * (the upper layer wins every shared name) and answers the union — the
 * declared bytes are the merged tree only, never the double count. */
async function ramoverlayfslane(code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifestinproc("ramoverlayfs", code);
  const lower = manifestfiles("ramoverlayfs", manifest.lower, "lower");
  const upper = manifestfiles("ramoverlayfs", manifest.upper, "upper");
  const merged = new Map(lower);
  for (const [name, bytes] of upper) merged.set(name, bytes);
  let totalbytes = 0;
  const files: Record<string, string> = {};
  for (const [name, bytes] of merged) {
    totalbytes += bytes.byteLength;
    files[name] = tohex(bytes);
  }
  assertramquota("ramoverlayfs", totalbytes, inputs);
  return lanereport(
    rammime,
    { filecount: merged.size, totalbytes, lower: lower.length, upper: upper.length, merged: [...merged.keys()] },
    { files },
  );
}

/** ram-zram: the compressed page store lane. The code field is the page
 * manifest {"pagesize":n,"pages":["<hex>",...]}: the lane compresses
 * every page with the real stored-block zlib wrapper and answers the
 * per page compression ratios — the compressed streams ride the artifact. */
async function ramzramlaneinproc(code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifestinproc("ramzram", code);
  const pagesize = manifestuint("ramzram", manifest.pagesize, "pagesize");
  if (pagesize < 1) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the ram-zram lane requires a positive pagesize");
  }
  if (!Array.isArray(manifest.pages)) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the ram-zram lane requires a pages array in the manifest");
  }
  const pages = manifest.pages.map((page, index) => {
    const bytes = fromhex("ramzram", page, `pages ${index}`);
    if (bytes.byteLength > pagesize) {
      throw edgelaneerror(
        "INVALID_LANE_PAYLOAD",
        `the ram-zram page ${index} carries ${bytes.byteLength} bytes over the ${pagesize} byte page`,
      );
    }
    return bytes;
  });
  const rawbytes = pages.reduce((sum, page) => sum + page.byteLength, 0);
  assertramquota("ramzram", rawbytes, inputs);
  const streams = pages.map((page) => storedzlib(page));
  const compressedbytes = streams.reduce((sum, stream) => sum + stream.byteLength, 0);
  const ratios = streams.map((stream, index) =>
    pages[index].byteLength === 0 ? 0 : Math.round((stream.byteLength / pages[index].byteLength) * 1000) / 1000,
  );
  return lanereport(
    rammime,
    { pagesize, pages: pages.length, rawbytes, compressedbytes, ratios },
    { pagesize, pages: pages.length, streams: streams.map((stream) => tohex(stream)) },
  );
}

/** ram-swapfile: the swap extent file lane. The code field is the extent
 * manifest {"extents":[[start,len,"<hex>"],...],"read":[start,len]}: the
 * lane materializes the extent-addressed file (the extent table covers
 * the sparse holes with zero bytes) and answers the read window — the
 * extent table and the read bytes ride the artifact. */
async function ramswapfilelaneinproc(code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifestinproc("ramswapfile", code);
  if (!Array.isArray(manifest.extents)) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the ram-swapfile lane requires an extents array in the manifest");
  }
  const extents: { start: number; length: number; bytes: Uint8Array }[] = [];
  let filebytes = 0;
  for (const entry of manifest.extents) {
    if (!Array.isArray(entry) || entry.length !== 3) {
      throw edgelaneerror("INVALID_LANE_PAYLOAD", "the ram-swapfile lane requires [start, length, hex] extent triples");
    }
    const start = manifestuint("ramswapfile", entry[0], "extents start");
    const length = manifestuint("ramswapfile", entry[1], "extents length");
    if (!Number.isSafeInteger(start + length)) {
      throw edgelaneerror(
        "INVALID_LANE_PAYLOAD",
        `the ram-swapfile extent at ${start} exceeds the representable byte range`,
      );
    }
    const bytes = fromhex("ramswapfile", entry[2], "extents bytes");
    if (bytes.byteLength !== length) {
      throw edgelaneerror(
        "INVALID_LANE_PAYLOAD",
        `the ram-swapfile extent at ${start} declares ${length} bytes but carries ${bytes.byteLength}`,
      );
    }
    extents.push({ start, length, bytes });
    if (start + length > filebytes) filebytes = start + length;
  }
  assertramquota("ramswapfile", filebytes, inputs);
  const [readstart, readlength] = manifestwindow("ramswapfile", manifest.read, "read");
  if (readlength > filebytes - readstart) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the ram-swapfile read [${readstart}, ${readlength}] escapes the ${filebytes} byte file`,
    );
  }
  const window = new Uint8Array(readlength);
  const coveredmask = new Uint8Array(readlength);
  let covered = 0;
  for (const extent of extents) {
    const from = Math.max(extent.start, readstart);
    const to = Math.min(extent.start + extent.length, readstart + readlength);
    for (let position = from; position < to; position += 1) {
      if (coveredmask[position - readstart] === 0) {
        coveredmask[position - readstart] = 1;
        covered += 1;
      }
      window[position - readstart] = extent.bytes[position - extent.start];
    }
  }
  return lanereport(
    rammime,
    {
      extents: extents.length,
      filebytes,
      read: [readstart, readstart + readlength],
      covered,
      holes: readlength - covered,
    },
    {
      read: [readstart, readlength],
      bytes: tohex(window),
      extents: extents.map((extent) => [extent.start, extent.length]),
    },
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: the delivery family — the wire frame builders. */
/* ════════════════════════════════════════════════════════════════════ */

/** the deterministic rfc6455 client mask of the wss lane. */
const wssmask = Uint8Array.of(0x01, 0x02, 0x03, 0x04);

/** builds one rfc6455 client text frame around the payload: fin and the
 * text opcode 1, the mask bit, the deterministic four byte mask, the
 * 7/16/64 bit payload length encoding and the masked payload bytes. */
function wssframe(payload: Uint8Array): Uint8Array {
  const length = payload.byteLength;
  const headerbytes = length < 126 ? 2 : length < 65536 ? 4 : 10;
  const frame = new Uint8Array(headerbytes + 4 + length);
  frame[0] = 0x81;
  if (length < 126) {
    frame[1] = 0x80 | length;
  } else if (length < 65536) {
    frame[1] = 0x80 | 126;
    frame[2] = length >> 8;
    frame[3] = length & 0xff;
  } else {
    frame[1] = 0x80 | 127;
    new DataView(frame.buffer).setBigUint64(2, BigInt(length));
  }
  frame.set(wssmask, headerbytes);
  const body = headerbytes + 4;
  for (let index = 0; index < length; index += 1) frame[body + index] = payload[index] ^ wssmask[index % 4];
  return frame;
}

/** builds one grpc length-prefixed message: the one byte compressed flag
 * 0 and the four byte big-endian payload length — exactly the bytes an
 * http/2 DATA frame would carry. */
function grpcframe(payload: Uint8Array): Uint8Array {
  const frame = new Uint8Array(5 + payload.byteLength);
  frame[0] = 0x00;
  new DataView(frame.buffer).setUint32(1, payload.byteLength);
  frame.set(payload, 5);
  return frame;
}

/** delivery-cdn: the mirror manifest lane. The code field is the mirror
 * manifest {"origin":"https://...","assets":["a.js",...]}: the lane is
 * the mirror PLANNER — it answers the content addressed key of every
 * asset (the fnv-1a 32 hash of the asset name, deterministic) and never
 * fetches anything (the fetch rides the vfs seat inside the sandbox).
 * The origin-pin law: a manifest without an origin answers
 * INVALID_LANE_PAYLOAD. */
async function deliverycdnlane(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifestinproc("deliverycdn", code);
  const origin = manifesttext("deliverycdn", manifest.origin, "origin");
  if (!Array.isArray(manifest.assets)) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the delivery-cdn lane requires an assets array in the manifest");
  }
  const assets = manifest.assets.map((name) => manifesttext("deliverycdn", name, "assets entry"));
  const entries = assets.map((name) => ({ name, key: `assets/${fnv1a(name)}` }));
  return lanereport(
    cdnmime,
    { origin, assets: entries.length, keys: entries.map((entry) => entry.key) },
    { origin, assets: entries },
  );
}

/** delivery-wss: the websocket frame writer lane. The code field is the
 * text payload: the lane builds the real rfc6455 client frame — fin and
 * the text opcode, the mask bit with the deterministic mask 0x01020304,
 * the 7/16/64 bit length encoding and the masked payload — and answers
 * the frame bytes (the first 64 ride stdout as hex, the full frame
 * rides the artifact manifest). */
async function deliverywsslane(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const payload = utf8.encode(code);
  const frame = wssframe(payload);
  const hex = tohex(frame.subarray(0, Math.min(64, frame.byteLength)));
  return lanereport(
    cdnmime,
    {
      opcode: 1,
      fin: true,
      masked: true,
      mask: "01020304",
      length: payload.byteLength,
      framebytes: frame.byteLength,
      hex,
    },
    { opcode: 1, fin: true, masked: true, mask: "01020304", length: payload.byteLength, framehex: tohex(frame) },
  );
}

/** delivery-grpc: the grpc frame lane. The code field is the text
 * payload: the lane frames it as one grpc length-prefixed message — the
 * one byte compressed flag 0 and the four byte big-endian length. */
async function deliverygrpclane(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const payload = utf8.encode(code);
  if (payload.byteLength > 0xffffffff) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the delivery-grpc frame exceeds the four byte length ceiling");
  }
  const frame = grpcframe(payload);
  return lanereport(
    cdnmime,
    { compressed: false, length: payload.byteLength, framebytes: frame.byteLength },
    { compressedflag: 0, length: payload.byteLength, framehex: tohex(frame) },
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 5: the storage wire family — the handshake speakers and the signer. */
/* ════════════════════════════════════════════════════════════════════ */

/** the mysql client capability set the lane speaks: long password, found
 * rows, long flag, connect with db, protocol 41, transactions, secure
 * connection and plugin auth — a fixed modern client set, deterministic. */
const mysqlclientflags = 0x0008a20f;

/** builds the mysql client handshake payload: the client flags and max
 * packet (little-endian), the charset 33, the 23 byte zero filler, the
 * null-terminated username, the sixteen byte auth response under its
 * length byte and the null-terminated database "vault". */
function mysqlhandshakepayload(username: Uint8Array, authresponse: Uint8Array): Uint8Array {
  const database = utf8.encode("vault");
  const payload = new Uint8Array(32 + username.byteLength + 1 + 1 + 16 + database.byteLength + 1);
  const view = new DataView(payload.buffer);
  view.setUint32(0, mysqlclientflags, true);
  view.setUint32(4, 0x01000000, true);
  payload[8] = 33;
  let offset = 32;
  payload.set(username, offset);
  offset += username.byteLength;
  payload[offset] = 0;
  offset += 1;
  payload[offset] = 16;
  offset += 1;
  payload.set(authresponse, offset);
  offset += 16;
  payload.set(database, offset);
  offset += database.byteLength;
  payload[offset] = 0;
  return payload;
}

/** the sixteen byte mysql auth response: the token's char codes (mod
 * 256) truncated or zero-padded to the fixed sixteen byte slot — the
 * auth-token law of the mysql lane. */
function mysqlauthresponse(token: unknown): Uint8Array {
  const response = new Uint8Array(16);
  if (typeof token === "string") {
    for (let index = 0; index < Math.min(16, token.length); index += 1)
      response[index] = token.charCodeAt(index) & 0xff;
  }
  return response;
}

/** builds the postgres startup message: the four byte big-endian length,
 * the protocol 3.0 code 196608 and the null-terminated parameter list
 * "user <name> database vault" closed by the empty parameter byte. */
function postgresstartup(username: string): Uint8Array {
  const body = utf8.encode(`user\0${username}\0database\0vault\0\0`);
  const message = new Uint8Array(8 + body.byteLength);
  const view = new DataView(message.buffer);
  view.setUint32(0, 8 + body.byteLength);
  view.setUint32(4, 196608);
  message.set(body, 8);
  return message;
}

/** storage-libsql: the libsql seat lane. The code field is the query
 * manifest {"sql":"select ..."}: the lane is the wire PLANNER — it
 * composes the query envelope with the deterministic statement id (the
 * fnv-1a 32 hash of the sql text); the daemon connection rides the host
 * lane, this lane never opens a socket. */
async function storagelibsqllaneinproc(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifestinproc("storagelibsql", code);
  const sql = manifesttext("storagelibsql", manifest.sql, "sql");
  const statementid = fnv1a(sql);
  const envelope = { dialect: "libsql", sql, statementid };
  return lanereport(
    storagemime,
    {
      statementid,
      sqlbytes: utf8.encode(sql).byteLength,
      envelopebytes: utf8.encode(JSON.stringify(envelope)).byteLength,
    },
    envelope,
  );
}

/** storage-mysql: the mysql wire handshake lane. The code field is the
 * username (the default "saddle" when the field is empty): the lane
 * composes the real mysql client handshake packet — the three byte
 * little-endian payload length, the sequence byte 0 and the handshake
 * payload. The auth-token law: inputs.token replaces the zero auth
 * response with the token's char codes. */
async function storagemysqllaneinproc(code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const username = code.length > 0 ? code : "saddle";
  if (username.includes("\0")) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the storage-mysql username must not carry a nul byte");
  }
  const token = typeof inputs === "object" && inputs !== null ? (inputs as Record<string, unknown>).token : undefined;
  const payload = mysqlhandshakepayload(utf8.encode(username), mysqlauthresponse(token));
  if (payload.byteLength > 0xffffff) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      "the storage-mysql handshake exceeds the three byte mysql length ceiling",
    );
  }
  const packet = new Uint8Array(4 + payload.byteLength);
  packet[0] = payload.byteLength & 0xff;
  packet[1] = (payload.byteLength >> 8) & 0xff;
  packet[2] = (payload.byteLength >> 16) & 0xff;
  packet[3] = 0;
  packet.set(payload, 4);
  return lanereport(
    storagemime,
    { payloadbytes: payload.byteLength, packetbytes: packet.byteLength, sequence: 0, username },
    { username, database: "vault", charset: 33, sequence: 0, length: payload.byteLength, packethex: tohex(packet) },
  );
}

/** storage-postgres: the postgres wire startup lane. The code field is
 * the username (the default "saddle"): the lane composes the real pg
 * startup message — the big-endian length, the protocol 3.0 code and
 * the null-terminated parameter list. */
async function storagepostgreslane(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const username = code.length > 0 ? code : "saddle";
  if (username.includes("\0")) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the storage-postgres username must not carry a nul byte");
  }
  const message = postgresstartup(username);
  return lanereport(
    storagemime,
    { length: message.byteLength, protocol: 196608, username, database: "vault" },
    { length: message.byteLength, protocol: 196608, username, database: "vault", messagehex: tohex(message) },
  );
}

/** storage-s3: the s3 request signer lane. The code field is the request
 * manifest {"method":"GET","bucket":"name","key":"path","payload":"text"}:
 * the lane composes the canonical request string (the method line, the
 * /bucket/key path, the empty query line and the host header) and signs
 * it with the lane's deterministic keyed fnv-1a signer — documented as
 * the lane's own signer, never a claim of aws sigv4. The auth-token law:
 * inputs.secretkey mixes the signer. */
async function storages3laneinproc(code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifestinproc("storages3", code);
  const method = manifesttext("storages3", manifest.method, "method");
  const bucket = manifesttext("storages3", manifest.bucket, "bucket");
  if (bucket.includes("/")) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the storage-s3 bucket must not carry a path separator");
  }
  const key = manifesttext("storages3", manifest.key, "key");
  if (key.startsWith("/")) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the storage-s3 key must be a relative path");
  }
  const payload = typeof manifest.payload === "string" ? manifest.payload : "";
  const host = `${bucket}.s3.amazonaws.com`;
  const path = `/${bucket}/${key}`;
  const canonical = [method, path, "", "", `host:${host}`].join("\n");
  const secret =
    typeof inputs === "object" && inputs !== null ? (inputs as Record<string, unknown>).secretkey : undefined;
  const signature = keyedfnv1a(typeof secret === "string" ? secret : "", `${canonical}\n${payload}`);
  return lanereport(
    storagemime,
    { method, path, signature },
    { method, bucket, key, host, canonical, signature, signer: "fnv1a-keyed" },
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 6: the browser and local family — the webcontainer seat and the consent gate. */
/* ════════════════════════════════════════════════════════════════════ */

/** rewrites the export declarations of one module into the wrapper's
 * exports surface: export const/let/var/function/class NAME become the
 * plain binding plus one trailing exports.NAME = NAME assignment, and
 * export default EXPR becomes exports.default = EXPR. The pass is
 * deliberately tiny and deterministic — anything beyond it reaches
 * node:vm as written and the engine answers the honest syntax failure. */
function rewriteexports(code: string): string {
  const names: string[] = [];
  const lines = code.split("\n").map((line) => {
    const binding = /^(\s*)export\s+(const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/.exec(line);
    if (binding !== null) {
      names.push(binding[3]);
      return `${binding[1]}${binding[2]} ${binding[3]}${line.slice(binding[0].length)}`;
    }
    const callable = /^(\s*)export\s+(function\*?)\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/.exec(line);
    if (callable !== null) {
      names.push(callable[3]);
      return `${callable[1]}${callable[2]} ${callable[3]}${line.slice(callable[0].length)}`;
    }
    const klass = /^(\s*)export\s+class\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/.exec(line);
    if (klass !== null) {
      names.push(klass[2]);
      return `${klass[1]}class ${klass[2]}${line.slice(klass[0].length)}`;
    }
    const fallback = /^(\s*)export\s+default\s+(.+)$/.exec(line);
    if (fallback !== null) return `${fallback[1]}exports.default = ${fallback[2]}`;
    return line;
  });
  const assignments = names.map((name) => `exports.${name} = ${name};`);
  return [...lines, ...assignments].join("\n");
}

/** encodes one module export value for the exports report: the value
 * rides its json form when json can carry it, the encodeline string form
 * otherwise (a function answers its source text, an undefined answers
 * "undefined" — the encodeline pattern, json when possible). */
function exportencoding(value: unknown): unknown {
  try {
    if (JSON.stringify(value) !== undefined) return value;
  } catch {
    // the value is not json representable (a bigint, a circular
    // reference): the encodeline string form answers below
  }
  return encodeline(value);
}

/** browser-webcontainer: the in-process webcontainer seat. The code field
 * is a javascript module (like "export const answer = 42"): the lane
 * rewrites the export declarations into the wrapper's exports surface
 * and runs the module inside a fresh node:vm context that carries only
 * the frozen console and inputs surfaces (no require, no process, no
 * host globals — the server-side webcontainer law), then answers the
 * exports report. A module that throws answers VM_MODULE_FAILED
 * honestly — the vm error surfaces as the lane failure. */
async function browserwebcontainerlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (typeof vm.runInNewContext !== "function") {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      "the node:vm surface is absent from this engine host (the webcontainer seat never fakes a module run)",
    );
  }
  const stdoutlines: string[] = [];
  const stderrlines: string[] = [];
  const push =
    (target: string[]) =>
    (...values: unknown[]) => {
      target.push(values.map((value) => (typeof value === "string" ? value : encodeline(value))).join(" "));
    };
  const consolesurface = Object.freeze({
    log: push(stdoutlines),
    info: push(stdoutlines),
    debug: push(stdoutlines),
    warn: push(stderrlines),
    error: push(stderrlines),
  });
  const sandbox = { console: consolesurface, inputs: inputs === undefined ? null : Object.freeze(inputs as object) };
  const script = [
    '"use strict";',
    "const module = Object.freeze({ exports: {} });",
    "(function (module, exports) {",
    rewriteexports(code),
    "})(module, module.exports);",
    "module.exports;",
  ].join("\n");
  let exportsobject: unknown;
  try {
    exportsobject = vm.runInNewContext(script, sandbox, { timeout: deadline, displayErrors: true });
  } catch (error) {
    throw edgelaneerror("VM_MODULE_FAILED", `the webcontainer module failed to run: ${errormessage(error)}`, {
      stderr: stderrlines.join("\n"),
    });
  }
  const exportsrecord: Record<string, unknown> = {};
  if (typeof exportsobject === "object" && exportsobject !== null) {
    for (const [name, value] of Object.entries(exportsobject)) exportsrecord[name] = exportencoding(value);
  }
  const report = { exports: exportsrecord };
  const output: EdgeLaneOutput = {
    stdout: [...stdoutlines, encodeline(report)].join("\n"),
    artifact: { mime: browsermime, bytes: utf8.encode(JSON.stringify(report)) },
  };
  if (stderrlines.length > 0) output.stderr = stderrlines.join("\n");
  return output;
}

/** local-optin: the consent gate lane — the only lane of the plane that
 * may even name the visitor machine, and only under declared consent.
 * The lane refuses every run whose inputs do not declare consent exactly
 * true (LOCAL_CONSENT_REQUIRED), and even under consent the lane stays
 * in-process: it answers the consent manifest, the visitor machine is
 * never touched. */
async function localoptinlane(_code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const consent = typeof inputs === "object" && inputs !== null && (inputs as Record<string, unknown>).consent === true;
  if (!consent) {
    throw edgelaneerror(
      "LOCAL_CONSENT_REQUIRED",
      "the local opt-in lane refuses to run without the declared consent (inputs.consent true)",
    );
  }
  const manifest = { consent: true, scope: "declared", law: "the visitor machine stays untouched" };
  return lanereport(localmime, manifest, manifest);
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 7: the wiring wave seats — the serverless runner, the git    */
/* objects vfs, the sqlite vault and the network resolvers.             */
/* ════════════════════════════════════════════════════════════════════ */

/** the git object types the loose-object header law names. */
const gitobjecttypes: readonly string[] = Object.freeze(["blob", "tree", "commit", "tag"]);

/** the fixed sqlite version number the page-one header carries
 * (3.45.0 — the deterministic planner constant, never a live probe). */
const sqliteversionnumber = 3045000;

/** the rfc1035 qtype codes the resolver lanes speak (the subset the
 * planners compose — deterministic, fixed). */
const dnsqtypecodes: Readonly<Record<string, number>> = Object.freeze({
  A: 1,
  NS: 2,
  CNAME: 5,
  MX: 15,
  TXT: 16,
  AAAA: 28,
});

/** builds the rfc1035 query message the dns and doh lanes plan from:
 * the fnv-1a transaction id, the standard-query flags with recursion
 * desired (0x0100), one question, the qname labels (each length
 * prefixed, one to sixty-three octets, the empty name refused), the
 * qtype code and the class IN — deterministic, no socket ever opens. */
function dnsquerymessage(lane: string, name: string, qtype: string): { id: number; flags: number; query: Uint8Array } {
  const qtypecode = dnsqtypecodes[qtype];
  if (qtypecode === undefined) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} requires a known qtype (A, NS, CNAME, MX, TXT, AAAA) in the manifest field qtype`,
    );
  }
  const trimmed = name.endsWith(".") ? name.slice(0, -1) : name;
  const labels = trimmed.split(".");
  let questionbytes = 1 + 4;
  for (const label of labels) {
    const bytes = utf8.encode(label);
    if (bytes.byteLength === 0 || bytes.byteLength > 63) {
      throw edgelaneerror(
        "INVALID_LANE_PAYLOAD",
        `the lane ${lane} requires dns labels of 1 to 63 octets in the manifest field name`,
      );
    }
    questionbytes += 1 + bytes.byteLength;
  }
  const query = new Uint8Array(12 + questionbytes);
  const view = new DataView(query.buffer);
  view.setUint16(0, Number.parseInt(fnv1a(`${trimmed}|${qtype}`), 16) & 0xffff);
  view.setUint16(2, 0x0100);
  view.setUint16(4, 1);
  let offset = 12;
  for (const label of labels) {
    const bytes = utf8.encode(label);
    query[offset] = bytes.byteLength;
    offset += 1;
    query.set(bytes, offset);
    offset += bytes.byteLength;
  }
  query[offset] = 0;
  view.setUint16(offset + 1, qtypecode);
  view.setUint16(offset + 3, 1);
  return { id: view.getUint16(0), flags: 0x0100, query };
}

/** runner-serverless: the v8 isolates lane. The code field is the
 * isolate manifest {"isolate":"<name>","module":"<js module text>"}: the
 * lane cold-starts one fresh node:vm context per run (the isolate
 * carries only the frozen console and inputs surfaces — no fs, no host
 * globals, the cpu quota rides the caller's deadline), runs the module
 * through the same export-rewrite pass as the webcontainer seat and
 * answers the exports report beside the deterministic module
 * fingerprint (the fnv-1a of the module text). A module that throws
 * answers VM_MODULE_FAILED — the isolate never fakes a run. */
async function runnerserverlesslane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (typeof vm.runInNewContext !== "function") {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      "the node:vm surface is absent from this engine host (the v8 isolate seat never fakes a module run)",
    );
  }
  const manifest = parsemanifestinproc("runnerserverless", code);
  const isolate = manifesttext("runnerserverless", manifest.isolate, "isolate");
  const moduletext = manifesttext("runnerserverless", manifest.module, "module");
  const stdoutlines: string[] = [];
  const stderrlines: string[] = [];
  const push =
    (target: string[]) =>
    (...values: unknown[]) => {
      target.push(values.map((value) => (typeof value === "string" ? value : encodeline(value))).join(" "));
    };
  const consolesurface = Object.freeze({
    log: push(stdoutlines),
    info: push(stdoutlines),
    debug: push(stdoutlines),
    warn: push(stderrlines),
    error: push(stderrlines),
  });
  const sandbox = { console: consolesurface, inputs: inputs === undefined ? null : Object.freeze(inputs as object) };
  const script = [
    '"use strict";',
    "const module = Object.freeze({ exports: {} });",
    "(function (module, exports) {",
    rewriteexports(moduletext),
    "})(module, module.exports);",
    "module.exports;",
  ].join("\n");
  let exportsobject: unknown;
  try {
    exportsobject = vm.runInNewContext(script, sandbox, { timeout: deadline, displayErrors: true });
  } catch (error) {
    throw edgelaneerror("VM_MODULE_FAILED", `the serverless isolate failed to run: ${errormessage(error)}`, {
      stderr: stderrlines.join("\n"),
    });
  }
  const exportsrecord: Record<string, unknown> = {};
  if (typeof exportsobject === "object" && exportsobject !== null) {
    for (const [name, value] of Object.entries(exportsobject)) exportsrecord[name] = exportencoding(value);
  }
  const report = {
    isolate,
    fingerprint: fnv1a(moduletext),
    modulebytes: utf8.encode(moduletext).byteLength,
    exports: exportsrecord,
  };
  const output: EdgeLaneOutput = {
    stdout: [...stdoutlines, encodeline(report)].join("\n"),
    artifact: { mime: runmime, bytes: utf8.encode(JSON.stringify(report)) },
  };
  if (stderrlines.length > 0) output.stderr = stderrlines.join("\n");
  return output;
}

/** fs-gitobjects: the git objects vfs lane. The code field is the
 * object manifest {"repo":"<name>","objects":[{"type":"blob","data":"<hex>"},...]}:
 * the lane composes each object's git loose-object header ("<type> <len>\0"),
 * addresses it by the deterministic fnv-1a content hash and mounts the
 * bytes into the repo's objects tree under the git fan-out law (the
 * first two hex chars of the address name the shard directory) — an
 * in-process vfs mount, the host filesystem is never touched, and a
 * repeated address answers the last write (the hash table law). */
async function fsgitobjectslane(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifestinproc("fsgitobjects", code);
  const repo = manifesttext("fsgitobjects", manifest.repo, "repo");
  if (!Array.isArray(manifest.objects)) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the fs-gitobjects lane requires an objects array in the manifest");
  }
  const files: Record<string, string> = {};
  for (const entry of manifest.objects) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      throw edgelaneerror("INVALID_LANE_PAYLOAD", "the fs-gitobjects lane requires {type, data} object entries");
    }
    const record = entry as Record<string, unknown>;
    const type = manifesttext("fsgitobjects", record.type, "objects type");
    if (!gitobjecttypes.includes(type)) {
      throw edgelaneerror(
        "INVALID_LANE_PAYLOAD",
        `the fs-gitobjects object type ${type} is not one of the git object types (blob, tree, commit, tag)`,
      );
    }
    const bytes = fromhex("fsgitobjects", record.data, "objects data");
    const address = fnv1a(`${type} ${bytes.byteLength}\0${tohex(bytes)}`);
    files[`${repo}/objects/${address.slice(0, 2)}/${address.slice(2)}`] = tohex(bytes);
  }
  const paths = Object.keys(files).sort((left, right) => (left < right ? -1 : left > right ? 1 : 0));
  return lanereport(
    vfsmime,
    { repo, objects: manifest.objects.length, shards: new Set(paths.map((path) => path.split("/")[2])).size, paths },
    { repo, files },
  );
}

/** storage-sqlite: the sqlite vault lane. The code field is the query
 * manifest {"sql":"select ...","pagesize":4096}: the lane is the page-one
 * PLANNER — it composes the deterministic 100-byte sqlite database header
 * (the "SQLite format 3\0" magic, the page size big-endian at offset 16,
 * legacy write and read versions, the change counter and the
 * version-valid-for carrying the fnv-1a statement id of the sql text,
 * the database size of one page) beside the query envelope; the daemon
 * connection rides the host lane, this lane never opens a file. */
async function storagesqlitelane(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifestinproc("storagesqlite", code);
  const sql = manifesttext("storagesqlite", manifest.sql, "sql");
  const pagesize = manifestuint("storagesqlite", manifest.pagesize, "pagesize");
  if (pagesize < 512 || pagesize > 65536 || (pagesize & (pagesize - 1)) !== 0) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      "the storage-sqlite pagesize must be a power of two between 512 and 65536 (the page size law)",
    );
  }
  const statementid = fnv1a(sql);
  const counter = Number.parseInt(statementid, 16) >>> 0;
  const header = new Uint8Array(100);
  header.set(utf8.encode("SQLite format 3\0"), 0);
  const view = new DataView(header.buffer);
  view.setUint16(16, pagesize === 65536 ? 1 : pagesize);
  header[18] = 1;
  header[19] = 1;
  view.setUint32(24, counter);
  view.setUint32(28, 1);
  view.setUint32(92, counter);
  view.setUint32(96, sqliteversionnumber);
  const envelope = { dialect: "sqlite", sql, statementid, pagesize };
  return lanereport(
    storagemime,
    { statementid, pagesize, sqlbytes: utf8.encode(sql).byteLength, headerbytes: header.byteLength },
    {
      dialect: "sqlite",
      sql,
      statementid,
      pagesize,
      headerhex: tohex(header),
      envelopebytes: utf8.encode(JSON.stringify(envelope)).byteLength,
    },
  );
}

/** network-dns: the dns resolver lane. The code field is the query
 * manifest {"name":"example.dev","qtype":"A"}: the lane is the resolver
 * PLANNER — it composes the real rfc1035 query message (the fnv-1a
 * transaction id, the standard-query flags with recursion desired, the
 * qname labels, the qtype and the class IN) and answers the query bytes;
 * the socket ride stays with the sandbox seat, this lane never opens
 * one. */
async function networkdnslaneinproc(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifestinproc("networkdns", code);
  const name = manifesttext("networkdns", manifest.name, "name");
  const qtype = manifesttext("networkdns", manifest.qtype, "qtype");
  const { id, flags, query } = dnsquerymessage("networkdns", name, qtype);
  return lanereport(
    netmime,
    { name, qtype, querybytes: query.byteLength, id },
    { id, flags, name, qtype, queryhex: tohex(query) },
  );
}

/** network-doh: the dns over https lane. The code field is the request
 * manifest {"resolver":"https://.../dns-query","name":"example.dev","qtype":"AAAA"}:
 * the lane is the doh PLANNER — it composes the same rfc1035 query and
 * rides it base64url (rfc 8484, unpadded) as the ?dns= parameter of the
 * GET request under the application/dns-message accept; the https ride
 * stays with the sandbox seat, this lane never opens a socket, and a
 * plaintext resolver answers the honest refusal. */
async function networkdohlaneinproc(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifestinproc("networkdoh", code);
  const resolver = manifesttext("networkdoh", manifest.resolver, "resolver");
  if (!resolver.startsWith("https://")) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      "the network-doh resolver must be an https url (the doh law refuses plaintext resolvers)",
    );
  }
  const name = manifesttext("networkdoh", manifest.name, "name");
  const qtype = manifesttext("networkdoh", manifest.qtype, "qtype");
  const { query } = dnsquerymessage("networkdoh", name, qtype);
  const wire = Buffer.from(query).toString("base64url");
  const url = `${resolver}?dns=${wire}`;
  return lanereport(
    netmime,
    { resolver, name, qtype, urlbytes: utf8.encode(url).byteLength },
    { resolver, url, dns: wire, accept: "application/dns-message" },
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 8: the lane tables — the specs, the executors and the ids. */
/* ════════════════════════════════════════════════════════════════════ */

/** the in-process lane specs: one row per wired modality, the source of
 * truth of the lane order — every lane executes (live), the pure recipe
 * and wire lanes ride the pure typescript engine surface and the
 * webcontainer seat rides node:vm. */
export const inproclanespecs: readonly InprocLaneSpec[] = Object.freeze([
  // the ram family: the memory ladder recipes
  { modality: "ramtmpfs", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "rammmap", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "ramoverlayfs", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "ramzram", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "ramswapfile", kind: "live", runtime: "pure-ts", present: () => true },
  // the delivery family: the wire frame builders
  { modality: "deliverycdn", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "deliverywss", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "deliverygrpc", kind: "live", runtime: "pure-ts", present: () => true },
  // the storage wire family: the handshake speakers and the signer
  { modality: "storagelibsql", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "storagemysql", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "storagepostgres", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "storages3", kind: "live", runtime: "pure-ts", present: () => true },
  // the browser family: the server-side webcontainer seat (never the visitor's)
  {
    modality: "browserwebcontainer",
    kind: "live",
    runtime: "node:vm",
    present: () => typeof vm.runInNewContext === "function",
  },
  // the local family: the explicit consent gate
  { modality: "localoptin", kind: "live", runtime: "pure-ts", present: () => true },
  // the wiring wave seats: the serverless runner, the git objects vfs,
  // the sqlite vault and the dns and doh resolvers (every one live —
  // the seats execute in-process, deterministic and seeded)
  {
    modality: "runnerserverless",
    kind: "live",
    runtime: "node:vm",
    present: () => typeof vm.runInNewContext === "function",
  },
  { modality: "fsgitobjects", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "storagesqlite", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "networkdns", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "networkdoh", kind: "live", runtime: "pure-ts", present: () => true },
]);

/** the in-process executor table: every lane of the group b contract,
 * keyed by modality id — the nineteen of the first wave beside the five
 * of the wiring wave; the dispatcher refuses to boot over a lane it
 * cannot wire. */
export const edgelaneexecutorsinproc: Readonly<Record<string, EdgeLaneExecutor>> = Object.freeze({
  "ramtmpfs": ramtmpfslaneinproc,
  "rammmap": rammmaplane,
  "ramoverlayfs": ramoverlayfslane,
  "ramzram": ramzramlaneinproc,
  "ramswapfile": ramswapfilelaneinproc,
  "deliverycdn": deliverycdnlane,
  "deliverywss": deliverywsslane,
  "deliverygrpc": deliverygrpclane,
  "storagelibsql": storagelibsqllaneinproc,
  "storagemysql": storagemysqllaneinproc,
  "storagepostgres": storagepostgreslane,
  "storages3": storages3laneinproc,
  "browserwebcontainer": browserwebcontainerlane,
  "localoptin": localoptinlane,
  "runnerserverless": runnerserverlesslane,
  "fsgitobjects": fsgitobjectslane,
  "storagesqlite": storagesqlitelane,
  "networkdns": networkdnslaneinproc,
  "networkdoh": networkdohlaneinproc,
});

/** the wired lane ids in spec order — the pinned contract the parallel
 * waves and the api routes read exactly. */
export const inproclaneids: readonly string[] = Object.freeze(inproclanespecs.map((spec) => spec.modality));

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: edgelandesvirtual.ts — the virtual hardware composition       */
/* lanes (group c). (consolidation note: this section's own                */
/* parsemanifest keeps its logic verbatim under its group-suffixed name  */
/* — parsemanifestvirtual — because the net section owns the un-suffixed */
/* seat.)                                                                 */
/* ══════════════════════════════════════════════════════════════════════ */

// # edgelandesvirtual.ts — the virtual hardware composition lanes of
// the edge plane (the ninety modalities wave, group c, task wa-2c: the
// seven planned virtual-hardware modalities wired as honest composition
// lanes). every lane rides the engine's own virtual hardware payloads —
// sandbox.ts generates the procfs, smi, dmesg and mesa surfaces,
// virtualization.ts carries the qemu/kvm plan surface — and composes the
// per-modality machine report from them: a lane never boots anything on
// the host, the report says composed, never booted. the code field of
// every executor is the machine manifest (json: model, gpu, ramgb, boot
// with the optional vcpus and mig); an unparsable manifest answers
// invalid-machine-manifest, a catalog reference the engine does not
// carry answers catalog-entry-absent, a plan the recipe cannot compose
// answers kvm-composition-failed and a blown deadline answers
// run-deadline-exceeded. determinism is the lane law: the engine samples
// some payload values per run (crypto-random memory fractions, the smi
// timestamp and counters, the state token), so the lanes pin those
// ranges at their midpoints and keep only the run-invariant smi lines —
// the same manifest always composes the same report bytes.

/* the virtualization surface rides the one keyword file virtual.ts since
 * the virtual family fold (the edgelandes law) — the kvm lane still loads
 * the domain lazily inside the executor (the family law: a domain the
 * host cannot resolve degrades that one lane honestly, never the engine
 * boot). */
async function loadvirtualization(): Promise<{
  buildqemucmd: (opts: { vcpu: number; memMB: number }) => readonly string[];
  kvmcapnames: readonly string[];
  qemuversioncheck: () => string;
}> {
  try {
    return await import("./virtual.ts");
  } catch (error) {
    throw edgelaneerror(
      "KVM_MODULE_UNAVAILABLE",
      `the virtualization domain cannot load under this host (the .js specifier graph needs a full resolver): ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the manifest law — parse, resolve, hash and the budget.   */
/* ════════════════════════════════════════════════════════════════════ */

/** the raw machine manifest as parsed from the code field: every field
 * optional, every present field type-checked (the invalid-manifest law
 * answers invalid-machine-manifest for anything else). */
interface rawmanifest {
  model?: string;
  gpu?: string;
  ramgb?: number;
  vcpus?: number;
  boot?: boolean;
  mig?: string;
}

/** the resolved manifest every surface renders from: the catalog names,
 * the engine defaults and the topology-resolved vcpu count. */
interface machinemanifest {
  model: string;
  gpu: string;
  ramgb: number;
  vcpus: number;
  boot: boolean;
  mig: string;
}

/** the machine one lane composes: the resolved catalog specs and the
 * engine-solved topology beside the canonical manifest. */
interface composedmachine {
  manifest: machinemanifest;
  cpuspec: CpuSpec;
  gpuspec: GpuSpec;
  topology: CpuTopology;
}

/** the engine's virtual memory ceiling createSandboxState clamps under;
 * the lane law refuses a manifest above it instead of silently
 * rewriting the caller's machine. */
const ENGINERAMCEILINGGB = 18432;

/** parses the code field as the machine manifest: a json object carrying
 * the optional model, gpu, ramgb, vcpus, boot and mig fields, every
 * present field type-checked and bounded — anything else answers
 * invalid-machine-manifest with the reason. */
function parsemanifestvirtual(code: string): rawmanifest {
  const invalid = (detail: string): never => {
    throw edgelaneerror("INVALID_MACHINE_MANIFEST", detail);
  };
  let parsed: unknown;
  try {
    parsed = JSON.parse(code);
  } catch (error) {
    invalid(
      `the code field is not parsable json (the machine manifest law): ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    invalid("the machine manifest must be a json object carrying the machine fields");
  }
  const raw = parsed as Record<string, unknown>;
  if (raw.model !== undefined && typeof raw.model !== "string") {
    invalid("the model field must be a string when present");
  }
  if (raw.gpu !== undefined && typeof raw.gpu !== "string") {
    invalid("the gpu field must be a string when present");
  }
  if (raw.mig !== undefined && typeof raw.mig !== "string") {
    invalid("the mig field must be a string when present (a mig profile id or off)");
  }
  if (raw.boot !== undefined && typeof raw.boot !== "boolean") {
    invalid("the boot field must be a boolean when present");
  }
  if (raw.ramgb !== undefined) {
    if (typeof raw.ramgb !== "number" || !Number.isFinite(raw.ramgb)) {
      invalid("the ramgb field must be a finite number when present");
    }
    if (raw.ramgb <= 0) {
      invalid("the ramgb field must be a positive number of gigabytes");
    }
    if (raw.ramgb > ENGINERAMCEILINGGB) {
      invalid(
        `the ramgb field must stay under the engine's ${ENGINERAMCEILINGGB} gb virtual ceiling (createSandboxState clamps there; the lane refuses instead of rewriting the manifest)`,
      );
    }
  }
  if (raw.vcpus !== undefined) {
    if (typeof raw.vcpus !== "number" || !Number.isFinite(raw.vcpus)) {
      invalid("the vcpus field must be a finite number when present");
    }
    if (raw.vcpus < 1) {
      invalid("the vcpus field must be at least 1");
    }
  }
  return { model: raw.model, gpu: raw.gpu, ramgb: raw.ramgb, vcpus: raw.vcpus, boot: raw.boot, mig: raw.mig };
}

/** resolves the manifest against the engine catalogs: the model lookup
 * accepts the catalog model name or its slug id (getcpu then
 * getcpubyid), the gpu lookup accepts the id or the name, the mig
 * lookup accepts a mig profile id or off; an entry the catalog does not
 * carry answers catalog-entry-absent naming the known ids. the defaults
 * mirror the engine's own laws: the first catalog entry for model and
 * gpu (the vgpu lane overrides the gpu default with the first
 * mig-capable device), 32 gb ram and 8 vcpus (the SandboxSpec defaults
 * createSandboxState rides), the vcpus clamped by the engine's own
 * solvetopology. */
function composemachine(raw: rawmanifest, defaultgpu?: string): composedmachine {
  const modelwanted = raw.model ?? cpudata[0].model;
  const cpuspec = getcpu(modelwanted) ?? getcpubyid(modelwanted);
  if (cpuspec === undefined) {
    throw edgelaneerror(
      "CATALOG_ENTRY_ABSENT",
      `the cpu catalog carries no model "${modelwanted}"; known models: ${cpudata.map((entry) => entry.model).join(", ")}`,
    );
  }
  const gpuwanted = raw.gpu ?? defaultgpu ?? gpudata[0].id;
  const gpuspec = getgpu(gpuwanted);
  if (gpuspec === undefined) {
    throw edgelaneerror(
      "CATALOG_ENTRY_ABSENT",
      `the gpu catalog carries no device "${gpuwanted}"; known ids: ${gpudata.map((entry) => entry.id).join(", ")}`,
    );
  }
  const migwanted = raw.mig ?? "off";
  if (migwanted !== "off" && !migprofiles.some((profile) => profile.id === migwanted)) {
    throw edgelaneerror(
      "CATALOG_ENTRY_ABSENT",
      `the mig catalog carries no profile "${migwanted}"; known profiles: off, ${migprofiles.map((profile) => profile.id).join(", ")}`,
    );
  }
  const topology = solvetopology(cpuspec, raw.vcpus ?? 8);
  const manifest: machinemanifest = {
    model: cpuspec.model,
    gpu: gpuspec.id,
    ramgb: raw.ramgb ?? 32,
    vcpus: topology.vcpus,
    boot: raw.boot ?? false,
    mig: migwanted,
  };
  return { manifest, cpuspec, gpuspec, topology };
}

/** renders the canonical manifest json (fixed key order): the bytes the
 * session-otp gate hashes and the manifest the artifacts carry. */
function canonicalmanifest(manifest: machinemanifest): string {
  return JSON.stringify({
    model: manifest.model,
    gpu: manifest.gpu,
    ramgb: manifest.ramgb,
    vcpus: manifest.vcpus,
    boot: manifest.boot,
    mig: manifest.mig,
  });
}

/** hashes one text with 64-bit fnv-1a and renders 16 lowercase hex
 * characters: the deterministic digest the session-otp gate and the
 * sandbox id ride — the engine's token() samples crypto randomness per
 * run, the lane hashes the manifest instead so identical manifests
 * compose identical ids. */
function fnv1a64(text: string): string {
  let hash = 0xcbf29ce484222325n;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= BigInt(text.charCodeAt(index));
    hash = (hash * 0x100000001b3n) & 0xffffffffffffffffn;
  }
  return hash.toString(16).padStart(16, "0");
}

/** honors the deadline after the composition (the boot budget law: the
 * compositions are fast, a blown budget answers run-deadline-exceeded
 * instead of a report the caller never paid for). */
function guarddeadline(startedat: number, deadline: number): void {
  const budget = Number.isFinite(deadline) ? Math.max(0, deadline) : Number.POSITIVE_INFINITY;
  if (Date.now() - startedat > budget) {
    throw edgelaneerror(
      "RUN_DEADLINE_EXCEEDED",
      `the composition exceeded its ${deadline} ms deadline (the boot budget law)`,
    );
  }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the composed surfaces — memory, smi, display, quotas.     */
/* ════════════════════════════════════════════════════════════════════ */

/** the deterministic memory plan: memtotal, swap, the meminfo rows and
 * the free -h table. */
interface memoryplan {
  memtotalkb: number;
  swapgb: number;
  rows: string[];
  free: string;
}

/** composes the memory plan from the engine's own formulas: pagealign
 * and the MemTotal and swap laws meminfo/createSandboxState ride, with
 * every per-run sampled fraction pinned at the midpoint of the engine's
 * rnd range (the engine samples free, buffers, cached, shmem and
 * swapfree per run; the lane pins the midpoints so the same manifest
 * composes the same bytes) — the free -h table still renders through
 * the engine's own freeh over the pinned snapshot. */
function composememoryplan(ramgb: number, vcpus: number): memoryplan {
  const memtotalkb = pagealign(ramgb * 1024 * 1024 - 131072);
  const swapgb = Math.min(Math.max(Math.round(ramgb / 8), 2), 128);
  const swaptotalkb = swapgb * 1024 * 1024;
  const row = (key: string, kb: number): string => `${key}:${String(kb).padStart(24 - key.length - 1)} kB`;
  const rows = [
    row("MemTotal", memtotalkb),
    row("MemFree", pagealign(memtotalkb * 0.053)),
    row("MemAvailable", pagealign(memtotalkb * 0.895)),
    row("Buffers", pagealign(memtotalkb * 0.0065)),
    row("Cached", pagealign(memtotalkb * 0.36)),
    row("SReclaimable", 0),
    row("Shmem", pagealign(memtotalkb * 0.0085)),
    row("SwapTotal", swaptotalkb),
    row("SwapFree", pagealign(swaptotalkb * 0.915)),
    row("KernelStack", pagealign(vcpus * 320)),
  ];
  return { memtotalkb, swapgb, rows, free: freeh(rows.join("\n")) };
}

/** keeps the run-invariant lines of the engine's 89-char smi table: the
 * composer stamps a per-run timestamp and samples the fan, temperature,
 * memory and utilization counters, so the surface drops the timestamp
 * line, the sampled perf row and the mig-worker process rows and keeps
 * every deterministic line (the borders, the headers, the device row,
 * the mig line, the no-running-processes line). */
function smilines(gpu: string, mig: string): string[] {
  return nvidiaSmiTable(gpu, mig)
    .split("\n")
    .filter((line) => !/^(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat) /.test(line))
    .filter((line) => !/P0\s+\d+W \//.test(line))
    .filter((line) => !line.includes("mig-worker"));
}

/** the session law of the virtual display (the lane pins it; the
 * registry record charges the virtual-screen modality under the xvfb
 * and looking-glass drivers with the session-otp hardening gate):
 * display :0, geometry 1280x800x24 and the vnc endpoint on the symbolic
 * saddle-display host — the lane composes the tree, it never binds a
 * socket. */
const displaylaw = {
  display: ":0",
  screen: 0,
  geometry: "1280x800x24",
  vnc: "vnc://saddle-display:5900",
  driver: "looking-glass b7 (kvmfr ivshmem 128m, the guest-to-host frame bridge)",
} as const;

/** reads the driver-quota bound from the lane inputs: inputs.quota with
 * the default of 4 devices, clamped to 1-16 (the registry record's
 * driver-quota hardening gate — the nvml surface never answers more
 * devices than the quota bounds). */
function driverquota(inputs: unknown): number {
  const wanted = typeof inputs === "object" && inputs !== null ? (inputs as Record<string, unknown>).quota : undefined;
  if (typeof wanted !== "number" || !Number.isFinite(wanted)) {
    return 4;
  }
  return Math.max(1, Math.min(16, Math.round(wanted)));
}

/** reads the context-quota bound from the lane inputs: inputs.contexts
 * with the default of 8 contexts, clamped to 1-64 (the registry record's
 * context-quota hardening gate). */
function contextquota(inputs: unknown): number {
  const wanted =
    typeof inputs === "object" && inputs !== null ? (inputs as Record<string, unknown>).contexts : undefined;
  if (typeof wanted !== "number" || !Number.isFinite(wanted)) {
    return 8;
  }
  return Math.max(1, Math.min(64, Math.round(wanted)));
}

/** extracts the driver version strings from the engine's boot payload:
 * the kernel banner of the first line rides virtualcpu and the engine's
 * own version line rides virtualmemory (the boot sequence is
 * deterministic, so the driver table composes identical bytes). */
function driverversions(manifest: machinemanifest): { kernel: string; engine: string } {
  const boot = bootSequence(manifest.model, manifest.vcpus, manifest.ramgb, manifest.gpu);
  return {
    kernel: /Linux version (\S+) /.exec(boot[0])?.[1] ?? "6.12.0-saddle",
    engine: /virtual hardware engine v([0-9.]+)/.exec(boot.join("\n"))?.[1] ?? "2.0.162",
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: the seven lane executors — one per planned modality.      */
/* ════════════════════════════════════════════════════════════════════ */

/** the artifact encoder shared by the lanes. */
const textencoder = new TextEncoder();

/** virtual-full: the complete machine. composes the cpu (the catalog by
 * model, default the first entry), the gpu (by id, default the first),
 * the memory (the engine's meminfo/freeh formulas), the boot dmesg
 * sequence (when the manifest asks boot), the topology (solvetopology)
 * and the sandbox state facts; the report answers the model, the
 * cores/threads, the smi summary, the memory report, the state line and
 * the boot dmesg head, and the artifact carries the complete manifest. */
async function virtualfulllane(code: string, _inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const startedat = Date.now();
  const { manifest, cpuspec, gpuspec, topology } = composemachine(parsemanifestvirtual(code));
  const memory = composememoryplan(manifest.ramgb, manifest.vcpus);
  const smi = smilines(manifest.gpu, "off");
  const digest = fnv1a64(canonicalmanifest(manifest));
  const sandboxid = `sb-${digest.slice(0, 8)}`;
  const hostname = `saddle-${digest.slice(0, 8)}`;
  const kernel = cpuspec.arch === "arm64" ? "6.12.0-saddle-aarch64" : "6.12.0-saddle";
  const boot = manifest.boot ? bootSequence(manifest.model, manifest.vcpus, manifest.ramgb, manifest.gpu) : [];
  const stdout = [
    "saddle virtual-full: composed machine report (composed, never booted)",
    `  model: ${cpuspec.displayname} — ${cpuspec.cores} cores / ${cpuspec.threads} threads (${cpuspec.microarch}, ${cpuspec.socket})`,
    `  topology: ${topology.vcpus} vcpus, ${topology.coresonline} cores online, ${topology.threadspercore} threads per core, ${topology.sockets} socket (solved by the engine's solvetopology)`,
    `  gpu: ${gpuspec.name} (${gpuspec.id}) — ${gpuspec.memtype} ${gpuspec.vrammib / 1024} gb, driver ${gpuspec.driver}${gpuspec.cuda === null ? "" : `, cuda ${gpuspec.cuda}`}`,
    "  smi (the engine's 89-char table, the run-invariant lines):",
    ...smi.map((line) => `    ${line}`),
    "  memory (the engine's formulas, the sampled fractions pinned at their midpoints):",
    ...memory.rows.map((line) => `    ${line}`),
    "  free -h (the engine's free table over the pinned plan):",
    ...memory.free.split("\n").map((line) => `    ${line}`),
    `  state: hostname ${hostname}, kernel ${kernel}, sandbox ${sandboxid} (the id pinned from the manifest hash — the engine's state composer samples a per-run token and meminfo snapshot instead)`,
    ...(manifest.boot
      ? [
          `  boot dmesg head (${Math.min(8, boot.length)} of ${boot.length} lines):`,
          ...boot.slice(0, 8).map((line) => `    ${line}`),
        ]
      : ["  boot: the manifest asks for no boot sequence (boot false)"]),
  ].join("\n");
  guarddeadline(startedat, deadline);
  const artifact = {
    modality: "virtualfull",
    verdict: "composed",
    manifest,
    machine: {
      cpumodel: cpuspec.model,
      cores: cpuspec.cores,
      threads: cpuspec.threads,
      gpuid: gpuspec.id,
      gpuname: gpuspec.name,
      vrammib: gpuspec.vrammib,
      memtotalkb: memory.memtotalkb,
      swapgb: memory.swapgb,
    },
    topology,
    smi,
    memory: { rows: memory.rows, free: memory.free },
    state: { id: sandboxid, hostname, kernel },
    boot,
    lscpu: lscpu(manifest.model, manifest.vcpus),
  };
  return {
    stdout,
    artifact: { mime: "application/vnd.devthink.sandbox+json", bytes: textencoder.encode(JSON.stringify(artifact)) },
  };
}

/** virtual-vgpu: the vgpu slice. composes the mig-capable device (the
 * manifest's gpu selects it, default the first mig-capable entry), the
 * mig slicing (the engine's migprofiles catalog), the smi table for the
 * sliced device and the nvml shim surface (FAKE_MODEL/FAKE_VRAM under
 * the profile, the engine's env law); a non-mig device answers
 * catalog-entry-absent — the lane composes slices of the mig-class
 * devices only, it never pretends a gaming card slices. */
async function virtualvgpulane(code: string, _inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const startedat = Date.now();
  const defaultvgpu = gpudata.find((entry) => entry.mig) ?? gpudata[0];
  const { manifest, gpuspec } = composemachine(parsemanifestvirtual(code), defaultvgpu.id);
  if (!gpuspec.mig) {
    throw edgelaneerror(
      "CATALOG_ENTRY_ABSENT",
      `the gpu catalog carries no mig-capable entry for "${manifest.gpu}" (${gpuspec.name}); the vgpu lane composes slices of the mig-class devices only: ${gpudata
        .filter((entry) => entry.mig)
        .map((entry) => entry.id)
        .join(", ")}`,
    );
  }
  const profile = getmig(manifest.mig) ?? migprofiles[0];
  const smi = smilines(manifest.gpu, profile.id);
  const stdout = [
    "saddle virtual-vgpu: composed vgpu slice report (composed, never booted)",
    `  device: ${gpuspec.name} (${gpuspec.id}) — ${gpuspec.memtype} ${gpuspec.vrammib / 1024} gb class, mig capable (driver ${gpuspec.driver})`,
    `  profile: ${profile.id} — ${profile.slicegb} gb slices, up to ${profile.maxinstances} instances`,
    "  slice table (the engine's mig catalog for the 96 gb-class device):",
    ...migprofiles.map((entry) => `    ${entry.id}  ${entry.slicegb} gb  max ${entry.maxinstances} instances`),
    "  smi (the sliced device, the run-invariant lines):",
    ...smi.map((line) => `    ${line}`),
    "  nvml shim (the engine's FAKE_* law under mig, the env surface of the sandbox state):",
    `    FAKE_MODEL=${gpuspec.name}`,
    `    FAKE_VRAM=${profile.slicegb * 1024}`,
  ].join("\n");
  guarddeadline(startedat, deadline);
  const artifact = {
    modality: "virtualvgpu",
    verdict: "composed",
    manifest,
    device: { id: gpuspec.id, name: gpuspec.name, vrammib: gpuspec.vrammib, mig: gpuspec.mig },
    profile,
    slicetable: migprofiles,
    nvmlshim: { FAKE_MODEL: gpuspec.name, FAKE_VRAM: profile.slicegb * 1024 },
    smi,
  };
  return {
    stdout,
    artifact: { mime: "application/vnd.devthink.sandbox+json", bytes: textencoder.encode(JSON.stringify(artifact)) },
  };
}

/** virtual-screen: the vm plus vnc. composes the machine (cpu, gpu,
 * memory) plus the virtual display tree (xvfb :0 at 1280x800x24, the
 * looking-glass driver line, the vnc endpoint the session law pins) and
 * the session-otp hardening gate: the 64-bit fnv-1a digest of the
 * canonical manifest, deterministic per manifest (the same manifest
 * always answers the same otp); the lane composes the tree, it never
 * binds the endpoint. */
async function virtualscreenlane(code: string, _inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const startedat = Date.now();
  const { manifest, cpuspec, gpuspec } = composemachine(parsemanifestvirtual(code));
  const memory = composememoryplan(manifest.ramgb, manifest.vcpus);
  const otp = fnv1a64(canonicalmanifest(manifest));
  const stdout = [
    "saddle virtual-screen: composed display report (composed, never booted)",
    `  machine: ${cpuspec.displayname} + ${gpuspec.name} + ${manifest.ramgb} gb (the composed machine beneath the display)`,
    `  memory: memtotal ${memory.memtotalkb} kb, swap ${memory.swapgb} gb (the engine's formulas)`,
    "  display tree (the session law the lane pins):",
    `    ${displaylaw.display}  xvfb virtual display, screen ${displaylaw.screen}, geometry ${displaylaw.geometry}, nolisten tcp`,
    `    driver   ${displaylaw.driver}`,
    `    vnc      ${displaylaw.vnc} (the endpoint the session law pins; the lane composes, never binds)`,
    "  session otp hardening gate (fnv-1a 64 over the canonical manifest):",
    `    otp: ${otp}`,
  ].join("\n");
  guarddeadline(startedat, deadline);
  const artifact = {
    modality: "virtualscreen",
    verdict: "composed",
    manifest,
    display: {
      display: displaylaw.display,
      screen: displaylaw.screen,
      geometry: displaylaw.geometry,
      vnc: displaylaw.vnc,
    },
    otp,
    machine: { model: cpuspec.model, gpu: gpuspec.id, ramgb: manifest.ramgb, memtotalkb: memory.memtotalkb },
  };
  return {
    stdout,
    artifact: { mime: "application/vnd.devthink.screen+json", bytes: textencoder.encode(JSON.stringify(artifact)) },
  };
}

/** virtual-drivers: the virtual driver surface. composes the driver
 * table from the engine's own version strings (the kernel banner of the
 * boot payload rides virtualcpu, the gpu catalog's driver string rides
 * virtualgpu, the engine's own version line rides virtualmemory) and the
 * nvml shim answers under the driver-quota gate: inputs.quota devices
 * (default 4, clamped 1-16), each carrying the selected gpu identity
 * through FAKE_MODEL/FAKE_VRAM. */
async function virtualdriverslane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const startedat = Date.now();
  const { manifest, gpuspec } = composemachine(parsemanifestvirtual(code));
  const quota = driverquota(inputs);
  const versions = driverversions(manifest);
  const stdout = [
    "saddle virtual-drivers: composed driver report (composed, never booted)",
    "  driver table (the engine's own version strings):",
    `    virtualcpu      ${versions.kernel} (the kernel banner of the engine's boot sequence)`,
    `    virtualgpu      ${gpuspec.driver} (the driver string of the gpu catalog entry)`,
    `    virtualmemory   ${versions.engine} (the engine version line of the boot sequence)`,
    `  nvml shim (the driver-quota gate, quota ${quota}, clamped 1-16):`,
    ...Array.from(
      { length: quota },
      (_, index) => `    device ${index}: FAKE_MODEL=${gpuspec.name} FAKE_VRAM=${gpuspec.smireportedmib}`,
    ),
  ].join("\n");
  guarddeadline(startedat, deadline);
  const artifact = {
    modality: "virtualdrivers",
    verdict: "composed",
    manifest,
    drivers: { virtualcpu: versions.kernel, virtualgpu: gpuspec.driver, virtualmemory: versions.engine },
    quota,
    nvmlshim: Array.from({ length: quota }, (_, index) => ({
      device: index,
      FAKE_MODEL: gpuspec.name,
      FAKE_VRAM: gpuspec.smireportedmib,
    })),
  };
  return {
    stdout,
    artifact: { mime: "application/vnd.devthink.sandbox+json", bytes: textencoder.encode(JSON.stringify(artifact)) },
  };
}

/** virtual-kvm: the kvm machine planner. composes the qemu argv from the
 * engine's turbo builder (buildqemucmd over the manifest's ramgb and the
 * topology-resolved vcpus — the cpu model rides the recipe's own
 * DiamondRapids default, the qemu cpu model space is the recipe's law),
 * the kvm capability names and the clean-rootfs law; the report answers
 * the composed plan, never a booted machine — the actual boot rides the
 * firecracker/qemu host lanes. a manifest asking for more memory than
 * the model's catalog ceiling answers kvm-composition-failed (the
 * recipe cannot compose hardware the model cannot address). */
async function virtualkvmlane(code: string, _inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const startedat = Date.now();
  const { manifest, cpuspec } = composemachine(parsemanifestvirtual(code));
  if (manifest.ramgb > cpuspec.maxmemorygb) {
    throw edgelaneerror(
      "KVM_COMPOSITION_FAILED",
      `the manifest asks for ${manifest.ramgb} gb on ${cpuspec.model} whose catalog ceiling is ${cpuspec.maxmemorygb} gb — the recipe cannot compose hardware the model cannot address`,
    );
  }
  const domain = await loadvirtualization();
  const argv = domain.buildqemucmd({ vcpu: manifest.vcpus, memMB: manifest.ramgb * 1024 });
  const stdout = [
    "saddle virtual-kvm: composed kvm plan (the planner — the boot rides the host lanes, never this one)",
    `  manifest: model ${manifest.model} (validated against the cpu catalog), gpu ${manifest.gpu} (validated; the plan carries no display device, vga none), ${manifest.ramgb} gb, ${manifest.vcpus} vcpus`,
    `  qemu (the engine's turbo builder, qemu ${domain.qemuversioncheck().split(" ")[0]}):`,
    ...argv.map((arg, index) => (index === 0 ? `    ${arg}` : `      ${arg}`)),
    `  kvm caps: ${domain.kvmcapnames.length} (${domain.kvmcapnames.join(", ")})`,
    "  rootfs law: clean-rootfs — the plan ships a pristine rootfs image; this lane composes the plan, it never boots",
  ].join("\n");
  guarddeadline(startedat, deadline);
  const artifact = {
    modality: "virtualkvm",
    verdict: "composed-plan",
    manifest,
    qemu: { version: domain.qemuversioncheck(), argv },
    kvmcaps: domain.kvmcapnames,
    rootfslaw: "clean-rootfs",
  };
  return {
    stdout,
    artifact: { mime: "application/vnd.devthink.sandbox+json", bytes: textencoder.encode(JSON.stringify(artifact)) },
  };
}

/** microvm-gpuless: the gpuless render. composes the mesa software stack
 * (the engine's pinned summaries: llvmpipe opengl 4.6 through glxinfo,
 * lavapipe vulkan 1.4 through vulkaninfo, rusticl opencl 3.1 through
 * clinfo, the validated mesaenv record), the cpu and the memory, and
 * the xvfb display — the full software-render machine with no gpu
 * device in the composition (the render rides the cpu). */
async function microvmgpulesslane(code: string, _inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const startedat = Date.now();
  const { manifest, cpuspec } = composemachine(parsemanifestvirtual(code));
  const memory = composememoryplan(manifest.ramgb, manifest.vcpus);
  const env = mesaenv(manifest.vcpus);
  const glxinfo = glxinfoSummary();
  const vulkan = vulkanSummary();
  const clinfo = clinfoSummary(manifest.vcpus);
  const stdout = [
    "saddle microvm-gpuless: composed software-render machine (composed, never booted)",
    `  cpu: ${cpuspec.displayname} — ${manifest.vcpus} vcpus (${cpuspec.microarch})`,
    `  memory: ${manifest.ramgb} gb (memtotal ${memory.memtotalkb} kb, swap ${memory.swapgb} gb, the engine's formulas)`,
    "  mesa software stack (the engine's pinned summaries):",
    "    glxinfo (llvmpipe — opengl 4.6 core):",
    ...glxinfo.split("\n").map((line) => `      ${line}`),
    "    vulkaninfo (lavapipe — vulkan 1.4):",
    ...vulkan.split("\n").map((line) => `      ${line}`),
    "    clinfo (rusticl — opencl 3.1):",
    ...clinfo.split("\n").map((line) => `      ${line}`),
    "    env (the engine's mesaenv record):",
    ...Object.keys(env)
      .sort()
      .map((key) => `      ${key}=${env[key]}`),
    "  display (the gpuless virtual display):",
    `    ${displaylaw.display}  xvfb, screen ${displaylaw.screen}, geometry ${displaylaw.geometry} (the software-render display, nolisten tcp)`,
  ].join("\n");
  guarddeadline(startedat, deadline);
  const artifact = {
    modality: "microvmgpuless",
    verdict: "composed",
    manifest,
    memory: { memtotalkb: memory.memtotalkb, swapgb: memory.swapgb, free: memory.free },
    mesa: { glxinfo, vulkan, clinfo, env },
    display: { display: displaylaw.display, geometry: displaylaw.geometry },
  };
  return {
    stdout,
    artifact: { mime: "application/vnd.devthink.microvm+json", bytes: textencoder.encode(JSON.stringify(artifact)) },
  };
}

/** gpu-virgl: the virgl render slice. composes the gpu catalog entry for
 * the virtual device, the context-quota law (inputs.contexts, default
 * 8, clamped 1-64) and the 3d capability report — the virtio-gpu virgl
 * bridge carrying the device identity; the report never claims a host
 * gpu, the composition rides the catalog entry. */
async function gpuvirgllane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const startedat = Date.now();
  const { manifest, gpuspec } = composemachine(parsemanifestvirtual(code));
  const contexts = contextquota(inputs);
  const stdout = [
    "saddle gpu-virgl: composed virgl render slice (composed, never booted)",
    `  device: ${gpuspec.name} (${gpuspec.id}) — ${gpuspec.arch}, ${gpuspec.smarch}, ${gpuspec.smcount} sms`,
    `  vram: ${gpuspec.vrammib} MiB ${gpuspec.memtype} (the smi surface reports ${gpuspec.smireportedmib} MiB)`,
    `  driver: ${gpuspec.driver}${gpuspec.cuda === null ? "" : ` (cuda ${gpuspec.cuda})`}`,
    `  context quota: ${contexts} (the context-quota law; inputs.contexts overrides, clamped 1-64)`,
    "  3d capability report (the virtual device's catalog entry through the virtio-gpu virgl bridge):",
    "    virtio-gpu   virgl 3d acceleration on (the venus native context stays off — the virgl bridge is the composed path)",
    `    contexts     ${contexts} concurrent render contexts (ctx 0-${contexts - 1})`,
    "    render       the guest contexts render through the composed device identity above; the lane never claims a host gpu",
  ].join("\n");
  guarddeadline(startedat, deadline);
  const artifact = {
    modality: "gpuvirgl",
    verdict: "composed",
    manifest,
    device: {
      id: gpuspec.id,
      name: gpuspec.name,
      arch: gpuspec.arch,
      smarch: gpuspec.smarch,
      smcount: gpuspec.smcount,
      vrammib: gpuspec.vrammib,
      driver: gpuspec.driver,
    },
    contexts,
    caps: { virgl: true, venus: false, contexts: `ctx 0-${contexts - 1}` },
  };
  return {
    stdout,
    artifact: { mime: "application/vnd.devthink.gpu+json", bytes: textencoder.encode(JSON.stringify(artifact)) },
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: the lane tables — the specs, the executors, the ids.      */
/* ════════════════════════════════════════════════════════════════════ */

/** the declaration of one virtual lane: the modality id, the wiring
 * kind, the runtime surface and the synchronous presence probe. */
export interface VirtualLaneSpec {
  /** the modality id the registry and the dispatch plane read. */
  modality: string;
  /** the wiring kind: the virtual lanes compose in process today. */
  kind: "live" | "host";
  /** the runtime surface the lane composes from. */
  runtime: string;
  /** the honest presence probe: the composed engine surface really loads. */
  present: () => boolean;
}

/** the seven virtual lane specs (kind live — the lanes compose the
 * engine's own payloads in process; the present probes guard the
 * imported surfaces by typeof so a module graph that cannot load one
 * surface answers absent for that lane, never a fake presence). */
export const virtuallanespecs: readonly VirtualLaneSpec[] = Object.freeze([
  {
    modality: "virtualfull",
    kind: "live",
    runtime: "sandbox-hardware",
    present: () => typeof getcpu === "function" && typeof bootSequence === "function",
  },
  {
    modality: "virtualvgpu",
    kind: "live",
    runtime: "sandbox-mig",
    present: () => typeof nvidiaSmiTable === "function" && migprofiles.length > 0,
  },
  {
    modality: "virtualscreen",
    kind: "live",
    runtime: "sandbox-display",
    present: () => typeof getgpu === "function" && typeof freeh === "function",
  },
  {
    modality: "virtualdrivers",
    kind: "live",
    runtime: "sandbox-drivers",
    present: () => typeof bootSequence === "function" && typeof getgpu === "function",
  },
  {
    modality: "virtualkvm",
    kind: "live",
    runtime: "qemu-planner",
    present: () =>
      true /* the kvm lane composes from the lazy domain: the probe answers the engine ships the composition seat */,
  },
  {
    modality: "microvmgpuless",
    kind: "live",
    runtime: "mesa-llvmpipe",
    present: () => typeof glxinfoSummary === "function" && typeof mesaenv === "function",
  },
  {
    modality: "gpuvirgl",
    kind: "live",
    runtime: "virgl-virtio-gpu",
    present: () => typeof getgpu === "function" && typeof solvetopology === "function",
  },
]);

/** the lane executor table of the virtual lanes, keyed by modality id:
 * the dispatch plane refuses to boot over a lane it cannot wire. */
export const edgelaneexecutorsvirtual: Readonly<Record<string, EdgeLaneExecutor>> = Object.freeze({
  "virtualfull": virtualfulllane,
  "virtualvgpu": virtualvgpulane,
  "virtualscreen": virtualscreenlane,
  "virtualdrivers": virtualdriverslane,
  "virtualkvm": virtualkvmlane,
  "microvmgpuless": microvmgpulesslane,
  "gpuvirgl": gpuvirgllane,
});

/** the seven virtual lane ids derived from the spec table (the order is
 * the spec order; the ids are pinned — the orchestrator's edge plane and
 * the api routes read them exactly). */
export const virtuallaneids: readonly string[] = Object.freeze(virtuallanespecs.map((spec) => spec.modality));

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: edgelandesninety.ts — the merge seat of the ninety table      */
/* (the last seat). (consolidation note: the import block this seat      */
/* carried for its sibling files rides the single file now — every      */
/* name is local; the tables and the wiring self-check are verbatim.)   */
/* ══════════════════════════════════════════════════════════════════════ */

// # edgelandesninety — the merge seat of the ninety modalities wave: the
// six heavyweight host lanes the plane probes (the browser server, the
// mobile seats, the pod session and the confidential compute — every one
// an honest probe lane that names its runtime and never fakes a boot) and
// the merged lane tables the dispatch plane reads. the lane groups of the
// wave (edgelandeshost.ts — the host binary lanes, edgelandesinproc.ts
// — the in-process lanes and edgelandesvirtual.ts — the virtual hardware
// composition lanes) each own their executors, edgelandes.ts owns the
// base contract seats beside its executors (the sixteen lanes the plane
// drove before the waves merged — the docker surface, the vfs, the
// node:vm, bun, wasm, babel and webpack runners, the bash, python and
// java seats and the six host probes), and this file wires the
// heavyweight probes and answers the one merged surface the plane law
// demands: every lane in the table carries an executor, the wiring
// self-check never loads a gap, and the table owns the ninety unique
// modalities of the plan exactly — the completion wave closed the last
// sixteen-seat gap between the merged wave tables (seventy-four) and the
// ninety the plan charges. the visitor law holds everywhere: the
// heavyweight lanes probe server-side surfaces only, the visitor browser,
// gpu, cpu and storage are never touched.
//
// the dispatch reality law (the engine-real rung): the merged executor
// table prefers the real surfaces first — the host binary lanes and the
// base wire lanes (the s3 sigv4 signer, the libsql and mysql wire
// clients, the tmpfs / zram / swapfile kernel recipes) win over the
// in-process rehearsal lanes for every id they share, so a dispatched
// storage or ram lane answers the honest wire verdict (the configured
// roundtrip or the host-runtime-absent refusal that names its
// requirement) and never the composed rehearsal report. the in-process
// lanes remain the engine's deterministic rehearsal surface — importable
// directly (the battery drives their own map) and wired into the merged
// table only for the ids no real lane owns.

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the lane spec shape the heavyweight probes answer. */
/* ════════════════════════════════════════════════════════════════════ */

/** one heavyweight lane declaration: the modality id, the host kind
 * (every heavyweight lane probes, the execution wiring is the next
 * rung), the runtime surface it names and the synchronous probe. */
export interface HeavyweightLaneSpec {
  modality: string;
  kind: "live" | "host";
  runtime: string;
  present: () => boolean;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the heavyweight presence probes — server-side only. */
/* ════════════════════════════════════════════════════════════════════ */

/** probes the sandbox-side browser surface: any of the headless chromium
 * binaries on PATH or the playwright module through the node resolver —
 * the browser the lane drives lives inside the sandbox, never on the
 * visitor machine. */
function probebrowserserver(): boolean {
  return (
    probehostbinary("chromium") ||
    probehostbinary("chromium-browser") ||
    probehostbinary("google-chrome") ||
    probemoduleseat("playwright")
  );
}

/** probes the amd sev-snp confidential compute surface: the /dev/sev
 * device node the attested guest mounts through. */
function probesevsnp(): boolean {
  return existsSync("/dev/sev");
}

/** resolves one engine module through the node resolver without loading
 * it — the honest seat check for the optional module surfaces. */
function probemoduleseat(specifier: string): boolean {
  try {
    createRequire(import.meta.url).resolve(specifier);
    return true;
  } catch {
    return false;
  }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: the heavyweight probe executors — honest refusals only. */
/* ════════════════════════════════════════════════════════════════════ */

/** the honest probe executor of one heavyweight lane: the lane answers
 * HOST_RUNTIME_ABSENT when its surface is absent and the probe document
 * (the runtime it found and where) when present — the execution wiring
 * is the next rung and the lane never fakes a run. */
function heavyweightprobelane(modality: string, runtime: string, present: () => boolean): EdgeLaneExecutor {
  return async () => {
    if (!present()) {
      throw edgelaneerror(
        "HOST_RUNTIME_ABSENT",
        `the host runtime ${runtime} is absent from the engine host (the ${modality} lane probes and never fakes)`,
      );
    }
    return { stdout: `${runtime} probed for the ${modality} lane — the execution wiring is the next rung` };
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: the heavyweight lane table — the six probes of the wave. */
/* ════════════════════════════════════════════════════════════════════ */

/** the heavyweight lanes of the ninety modalities wave: the browser
 * server and the sev-snp confidential compute surface — every one
 * kind host (the probe law). the pr15 cull retired the capacitor,
 * postmarketos, pod and tdx seats (the ninety stay at ninety through
 * the master engine table of modalities.ts). */
export const heavyweightlanespecs: readonly HeavyweightLaneSpec[] = Object.freeze([
  { modality: "browserserver", kind: "host", runtime: "chromium-headless", present: probebrowserserver },
  { modality: "confidentialsevsnp", kind: "host", runtime: "sev-snp", present: probesevsnp },
]);

/** the executor table of the heavyweight lanes, keyed by modality id. */
export const edgelaneexecutorsheavy: Readonly<Record<string, EdgeLaneExecutor>> = Object.freeze({
  "browserserver": heavyweightprobelane("browserserver", "chromium-headless", probebrowserserver),
  "confidentialsevsnp": heavyweightprobelane("confidentialsevsnp", "sev-snp", probesevsnp),
});

/** the heavyweight lane ids in spec order. */
export const heavyweightlaneids: readonly string[] = Object.freeze(heavyweightlanespecs.map((lane) => lane.modality));

/* ════════════════════════════════════════════════════════════════════ */
/* Section 5: the merged tables — the one surface the plane reads. */
/* ════════════════════════════════════════════════════════════════════ */

/** the merged lane spec table of the plane: beside the thirty-seven
 * host binary lanes (the twenty-five of the first wave, the twelve host
 * seats of the wiring wave), the twenty-four in-process lanes (the
 * nineteen of the first wave, the five seats of the wiring wave), the
 * seven virtual hardware lanes and the six heavyweight probes, the
 * sixteen base contract lanes edgelandes.ts owns (the docker surface,
 * the engine vfs, the node:vm, bun, wasm, babel and webpack runners, the
 * bash, python and java seats and the six host probes the plane drove
 * before the waves merged) — ninety merged lanes exactly, the ninety the
 * plan wires through the plane (sixty-six live, twenty-four host), every
 * modality the ninety plan answers through one spec surface. the order
 * walks the groups in their file order, then the heavyweight probes,
 * then the base contract seats — the order the edge plane table always
 * answered, so the pinned lane contracts read the same sequence. */
export const edgelanespecsall: readonly (HeavyweightLaneSpec & { kind: "live" | "host" })[] = Object.freeze([
  ...hostlanespecs,
  ...inproclanespecs,
  ...virtuallanespecs,
  ...heavyweightlanespecs,
  ...baselanespecs,
]);

/** the merged executor table of the plane: the dispatch reality law rides
 * the spread order — the rehearsal lanes spread first (they fill only the
 * ids no real lane owns), the virtual composition and the heavyweight
 * probes next, then the base wire executors and the host binary executors
 * last so every shared id answers its real surface: the storage and ram
 * ids carry the wire signers and the kernel recipes of the base table
 * (never the in-process rehearsal composer), the container and clr ids
 * carry the host binary lanes (the hardened docker run and the dotnet
 * compile) over the base profile documents. the dispatch law demands an
 * executor for every lane and this table answers it with the real seat
 * first, the rehearsal seat only where no real seat exists. */
export const edgelaneexecutorsall: Readonly<Record<string, EdgeLaneExecutor>> = Object.freeze({
  ...edgelaneexecutorsinproc,
  ...edgelaneexecutorsvirtual,
  ...edgelaneexecutorsheavy,
  ...edgelaneexecutors,
  ...edgelaneexecutorshost,
});

/** the base lane ids of the plane contract: the sixteen contract seats
 * the completion wave lifted from the inline edgeplane table into the
 * owning edgelandes.ts (the merged executor table carries their
 * executors and the merged spec table carries their lanes, so the
 * reverse wiring check reads them as both — the constant stays the
 * documented contract of the base executor map keys). */
const BASELANEIDS: readonly string[] = baselaneids;

/** the wiring self-check of the merge: the plane refuses to load over a
 * lane it cannot wire (a table entry without an executor is a miswired
 * plane, and miswiring must fail loud at boot, never silently at run
 * time) — and over a duplicate id (two lanes claiming one modality is a
 * miswired catalog). */
const seenids = new Set<string>();
for (const lane of edgelanespecsall) {
  if (seenids.has(lane.modality)) {
    throw new Error(`the ninety plane is miswired: the modality ${lane.modality} is declared twice`);
  }
  seenids.add(lane.modality);
  if (edgelaneexecutorsall[lane.modality] === undefined) {
    throw new Error(`the ninety plane is miswired: no executor for the lane ${lane.modality}`);
  }
}
for (const key of Object.keys(edgelaneexecutorsall)) {
  if (!seenids.has(key) && !BASELANEIDS.includes(key)) {
    throw new Error(`the ninety plane is miswired: the executor ${key} wires no lane in the table`);
  }
}
