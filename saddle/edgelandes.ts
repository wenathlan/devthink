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
// compile through webpack when the module graph carries it. Every
// absence answers an honest coded error — a lane whose runtime is not on
// the host says so, a lane never fakes a run. Pure node builtins ride
// the static import surface (the webserver's plain node host strips
// types and resolves only .ts specifiers); the engine root domain
// (virtual.ts) and the optional runtimes (@babel/core, webpack) load
// lazily inside the executors so a missing module degrades that one
// lane, never the engine boot.

import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

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
/* Section 8: the executor table — one executor per lane id, no gaps. */
/* ════════════════════════════════════════════════════════════════════ */

/** the lane executor table: every live lane and every host lane of the
 * edge plane, keyed by modality id; the dispatch plane refuses to boot
 * over a lane it cannot wire. */
export const edgelaneexecutors: Readonly<Record<string, EdgeLaneExecutor>> = Object.freeze({
  "container-docker": containerdockerlane,
  "fs-vfs": fsvfslane,
  "runner-node": runnernodelane,
  "runner-bun": runnerbunlane,
  "runner-wasm": runnerwasmlane,
  "runner-babel": runnerbabellane,
  "runner-webpack": runnerwebpacklane,
  "runner-universal": runneruniversallane,
  "language-python": languagepythonlane,
  "language-java": languagejavalane,
  "container-runsc": hostprobelane("runsc"),
  "emulator-qemu": hostprobelane("qemu-system-x86_64"),
  "microvm-firecracker": hostprobelane("firecracker"),
  "runtime-jvm": hostprobelane("java"),
  "language-go": hostprobelane("go"),
  "language-ruby": hostprobelane("ruby"),
});
