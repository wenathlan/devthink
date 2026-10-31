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
// lane, never the engine boot.

import { spawn, spawnSync } from "node:child_process";
import { createHash, createHmac } from "node:crypto";
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
      memorymodule = (await import("./virtualmemory.ts")) as MemoryRecipeModule;
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
  // the ninety law wave (the forty live law, wave w2 b1): the ten
  // promotions — the clr assembly lane, the docker profile pair and the
  // ghcr digest pin, the three storage adapter lanes and the three
  // kernel recipe lanes
  "runtime-clr": runtimeclrlane,
  "container-max": containermaxlane,
  "container-lite": containerlitelane,
  "container-ghcr": containerghcrlane,
  "storage-s3": storages3lane,
  "storage-libsql": storagelibsqllane,
  "storage-mysql": storagemysqllane,
  "ram-tmpfs": ramtmpfslane,
  "ram-zram": ramzramlane,
  "ram-swapfile": ramswapfilelane,
  "container-runsc": hostprobelane("runsc"),
  "emulator-qemu": hostprobelane("qemu-system-x86_64"),
  "microvm-firecracker": hostprobelane("firecracker"),
  "runtime-jvm": hostprobelane("java"),
  "language-go": hostprobelane("go"),
  "language-ruby": hostprobelane("ruby"),
});
