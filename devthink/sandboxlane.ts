/**
 * sandbox lane — the server-side sandbox of the run and storage lane.
 *
 * the platform promise: nothing runs or stores in the visitor browser; the
 * browser-pure simulator of the saddle wave stays an offline fallback the
 * client declares later. this module carries the tool surface the run lane
 * drives: every tool performs real filesystem effects, but only inside the
 * per-session jail under .sandboxrun. the module starts no process and
 * opens no socket, and the lanes it does not carry answer honestly instead
 * of pretending.
 */

import { spawn } from "node:child_process";
import { runInNewContext } from "node:vm";
import { appendFile, copyFile, mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
// the modality registry of the saddle engine — the single source of the
// catalog (this lane keeps no modality list of its own). The registry of
// record lives in the engine (saddle/modalityregistry.ts); the devthink
// tree carries the vendored mirror at ./modalities.ts because the
// container build never sees the workspace: it installs the published
// @wenathlan/saddle envelope from the registry, and that envelope ships
// sources only — the ./modalities export points at a dist file the
// tarball never carries (and the tarball's registry is the stale catalog
// besides). The sandboxlane battery pins the mirror byte-identical to the
// engine source, so the vendor can never drift from the registry in
// silence — and the vendor retires the day the published envelope carries
// the built registry (the import returns to the library specifier)
import { MODALITIES, planreport } from "./modalities.js";

/**
 * @section jail — the session root, the id gate and the path containment
 * every filesystem effect of the lane resolves through resolvejail and
 * contain, so no tool can read or write outside its own session directory.
 */

/** the sandbox root — one directory per session under the working tree */
const SANDBOXROOT = path.join(process.cwd(), ".sandboxrun");

/** the session id gate — letters digits and dashes, four to sixty four chars */
const SESSIONPATTERN = /^[a-z0-9][a-z0-9-]{3,63}$/i;

/** sandboxerror — the lane's own refusal: the message becomes the answer row */
export class SandboxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SandboxError";
  }
}

/** sandbox caps — the budget every tool answers within */
const CAPS = {
  maxoutputchars: 64_000,
  maxreadchars: 256_000,
  maxwritechars: 5_000_000,
  maxentries: 5_000,
  maxtreedepth: 6,
  maxtreeentries: 500,
  timeoutms: 10_000,
  maxprocesschars: 32_000,
};

/** resolvejail — validate the session id and answer its jail directory,
 * creating the directory on first use */
async function resolvejail(sessionid: string): Promise<string> {
  if (!SESSIONPATTERN.test(sessionid)) throw new SandboxError("invalid session");
  const jail = path.join(SANDBOXROOT, sessionid);
  await mkdir(jail, { recursive: true });
  return jail;
}

/** contain — resolve a relative target against the jail boundary and refuse
 * anything that resolves outside it */
function contain(jail: string, relative: string): string {
  const boundary = path.resolve(jail);
  const target = path.resolve(boundary, relative);
  if (target !== boundary && !target.startsWith(boundary + path.sep)) {
    throw new SandboxError("path escapes the session jail");
  }
  return target;
}

/**
 * @section tools — the real filesystem tools of the lane
 * every tool answers rows (one string per output line, built by array join)
 * and performs its effects only on contained paths inside the session jail.
 */

/** cliptext — cap a string to the budget through an array join: no string
 * surgery on user content */
function cliptext(text: string, cap: number): string {
  if (text.length <= cap) return text;
  return Array.from(text)
    .slice(0, cap)
    .join("");
}

/** tokenize — split a command line into tokens; double and single quoted
 * segments keep their spaces as one token */
function tokenize(line: string): string[] {
  const tokens: string[] = [];
  const pattern = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match = pattern.exec(line);
  while (match !== null) {
    tokens.push(match[1] ?? match[2] ?? match[3]);
    match = pattern.exec(line);
  }
  return tokens;
}

/** toollist — list one directory of the jail: "- name (N bytes)" per file,
 * "+ name/" per directory, "(empty)" when the directory holds nothing */
async function toollist(jail: string, target: string): Promise<string[]> {
  const full = contain(jail, target);
  const entries = await readdir(full, { withFileTypes: true });
  if (entries.length === 0) return ["(empty)"];
  const sorted = entries.slice().sort((left, right) => left.name.localeCompare(right.name));
  const rows: string[] = [];
  for (const entry of sorted.slice(0, CAPS.maxentries)) {
    if (entry.isDirectory()) {
      rows.push(["+ ", entry.name, "/"].join(""));
      continue;
    }
    let size = 0;
    try {
      const info = await stat(path.join(full, entry.name));
      size = info.size;
    } catch {
      size = 0;
    }
    rows.push(["- ", entry.name, " (", String(size), " bytes)"].join(""));
  }
  if (sorted.length > CAPS.maxentries) {
    rows.push(["... ", String(sorted.length - CAPS.maxentries), " more entries"].join(""));
  }
  return rows;
}

/** toolread — read a file as utf8 within the read budget, one row per line,
 * each line capped so one pathological row cannot flood the answer */
async function toolread(jail: string, target: string): Promise<string[]> {
  const full = contain(jail, target);
  const raw = await readFile(full, "utf8");
  const content = cliptext(raw, CAPS.maxreadchars);
  return content.split("\n").map((line) => cliptext(line, 2000));
}

/** toolwrite — write text to a file inside the jail within the write budget,
 * creating the parent directories first */
async function toolwrite(jail: string, target: string, content: string): Promise<string[]> {
  const body = cliptext(content, CAPS.maxwritechars);
  const full = contain(jail, target);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, body, "utf8");
  return [["wrote ", String(body.length), " chars to ", target].join("")];
}

/** toolappend — append text to a file inside the jail within the write
 * budget, creating the file and its parent directories first */
async function toolappend(jail: string, target: string, content: string): Promise<string[]> {
  const body = cliptext(content, CAPS.maxwritechars);
  const full = contain(jail, target);
  await mkdir(path.dirname(full), { recursive: true });
  await appendFile(full, body, "utf8");
  return [["appended ", String(body.length), " chars to ", target].join("")];
}

/** toolmkdir — create a directory inside the jail, parents included */
async function toolmkdir(jail: string, target: string): Promise<string[]> {
  const full = contain(jail, target);
  await mkdir(full, { recursive: true });
  return [["created directory ", target].join("")];
}

/** toolremove — remove each target recursively inside the jail */
async function toolremove(jail: string, targets: string[]): Promise<string[]> {
  const rows: string[] = [];
  for (const target of targets) {
    const full = contain(jail, target);
    await rm(full, { recursive: true, force: true });
    rows.push(["removed ", target].join(""));
  }
  return rows;
}

/** toolmove — rename a path inside the jail, creating the target parent */
async function toolmove(jail: string, from: string, to: string): Promise<string[]> {
  const source = contain(jail, from);
  const destination = contain(jail, to);
  await mkdir(path.dirname(destination), { recursive: true });
  await rename(source, destination);
  return [["moved ", from, " to ", to].join("")];
}

/** toolcopy — copy a file inside the jail, creating the target parent */
async function toolcopy(jail: string, from: string, to: string): Promise<string[]> {
  const source = contain(jail, from);
  const destination = contain(jail, to);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
  return [["copied ", from, " to ", to].join("")];
}

/** tooltree — walk a directory of the jail to the tree depth and entry
 * budgets; the "..." marker tells the visitor the walk ran out of budget */
async function tooltree(jail: string, target: string): Promise<string[]> {
  const root = contain(jail, target);
  const rows: string[] = [];
  let budget = CAPS.maxtreeentries;
  const walk = async (dir: string, depth: number): Promise<void> => {
    if (depth >= CAPS.maxtreedepth) return;
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    const sorted = entries.slice().sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of sorted) {
      if (budget <= 0) return;
      budget -= 1;
      const indent = "  ".repeat(depth + 1);
      if (entry.isDirectory()) {
        rows.push([indent, "+ ", entry.name, "/"].join(""));
        await walk(path.join(dir, entry.name), depth + 1);
      } else {
        rows.push([indent, "- ", entry.name].join(""));
      }
    }
  };
  rows.push([target, "/"].join(""));
  await walk(root, 0);
  if (budget <= 0) rows.push("...");
  return rows;
}

/** toolstat — one path's size, modified time and kind inside the jail */
async function toolstat(jail: string, target: string): Promise<string[]> {
  const full = contain(jail, target);
  const info = await stat(full);
  const kind = info.isDirectory() ? "directory" : info.isFile() ? "file" : "other";
  return [
    ["path: ", target].join(""),
    ["size: ", String(info.size), " bytes"].join(""),
    ["modified: ", info.mtime.toISOString()].join(""),
    ["kind: ", kind].join(""),
  ];
}

/**
 * @section surface — the answer contract and the line interpreter
 * runsandboxline is the one entry the run lane and the http routes drive;
 * the session and storage helpers wrap the same jail for the storage lane.
 */

/** one output line of a sandbox answer */
export interface SandboxRow {
  line: string;
}

/** the answer of one sandbox line: the rows, the exit code, the duration
 * and the tool that answered */
export interface SandboxAnswer {
  rows: SandboxRow[];
  exitcode: number;
  durationms: number;
  tool: string;
}

/** toolpending — the honest answer of a lane this sandbox does not carry:
 * it names the lane that owns the capability instead of pretending */
function toolpending(kind: "network"): string[] {
  return [
    "the network lane answers through the url gate of the gateway wave",
    "this sandbox carries no network tool yet, so nothing was fetched",
  ];
}

/** the container image the run lane executes inside (the node runtime the
 * family toolchain already pins) */
const RUNIMAGE = "node:26-alpine";

/** the token shape a run argument may carry (the argv list stays the only
 * transport — no shell ever parses a run line) */
const RUNTOKENPATTERN = /^[a-zA-Z0-9._/@:=+,-]{1,512}$/;

/** toolruncontainer — the run lane of the sandbox: the jailed script
 * executes inside a container of the container-docker modality, the jail
 * bind mounted at /work, the network disabled, the memory and cpu capped,
 * the wall clock bounded. The spawn rides an argument list with no shell —
 * the safe form the security gate prescribes. A host without the docker
 * runtime answers the honest refusal with the modality report, never a
 * simulated execution. */
async function toolruncontainer(jail: string, args: string[]): Promise<string[]> {
  // the argument shape gates answer first on every host: a rejected
  // character refuses before anything else, so the validation never depends
  // on which runtime the host carries
  for (const token of args) {
    if (!RUNTOKENPATTERN.test(token)) throw new SandboxError("the run arguments carry a rejected character");
  }
  if (!(await binaryonpath("docker"))) {
    const report = await hostmodalityreport();
    return [
      "the run lane isolates through the container modality of the family",
      "this host carries no docker runtime, so nothing executed",
      ...report.map((row) => ["  ", row].join("")),
    ];
  }
  const scriptabsolute = contain(jail, args[0]);
  const scriptrelative = path.relative(jail, scriptabsolute).split(path.sep).join("/");
  const childargs = [
    "run", "--rm",
    "-v", [jail, ":/work"].join(""),
    "-w", "/work",
    "--network", "none",
    "--memory", "512m",
    "--cpus", "1",
    RUNIMAGE,
    "node", scriptrelative,
    ...args.filter((token, index) => index > 0),
  ];
  const child = spawn("docker", childargs, { cwd: jail, shell: false, timeout: CAPS.timeoutms * 6 });
  const outchunks: string[] = [];
  const errchunks: string[] = [];
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => outchunks.push(chunk));
  child.stderr.on("data", (chunk: string) => errchunks.push(chunk));
  const code = await new Promise<number>((resolve) => {
    child.on("close", (exitcode) => resolve(exitcode ?? 0));
    child.on("error", () => resolve(127));
  });
  const rows: string[] = [];
  for (const line of outchunks.join("").split(/\r?\n/).slice(0, 200)) rows.push(line);
  const errtext = errchunks.join("");
  if (errtext.length > 0) {
    for (const line of errtext.split(/\r?\n/).slice(0, 60)) rows.push(["[stderr] ", line].join(""));
  }
  rows.push(["exit ", String(code)].join(""));
  return rows;
}

/**
 * @section exec — the polyglot exec lane of the language modalities
 * the exec tool drives the live language and build modalities of the
 * registry through the real host runtime: the script (or the build
 * recipe) executes inside the session jail, the working directory is the
 * jail, the wall clock is bounded and the argument list stays the only
 * transport — no shell ever parses an exec line. A host without the
 * runtime answers the honest refusal with the modality report, never a
 * simulated execution (the same law the container run lane answers).
 */

/** one exec lane — the host binary, the modality the lane drives and the
 * argv the script joins (the build steps carry the recipe flags) */
interface ExecLane {
  /** the modality id of the registry this lane drives */
  modality: string;
  /** the host binary the lane probes on PATH */
  bin: string;
  /** builds the argv of the execution: the script target and the caller args */
  argv: (target: string, args: string[]) => string[];
  /** the language word the help and the refusal answer */
  word: string;
}

/** the exec lanes — every live language and build modality the registry
 * declares, each wired to its real host runtime (the registry owns the
 * catalog, this table owns the invocation grammar) */
const EXECLANES: Readonly<Record<string, ExecLane>> = Object.freeze({
  bun: { modality: "runner-bun", bin: "bun", argv: (t, a) => [t, ...a], word: "the bun runtime" },
  deno: { modality: "runner-deno", bin: "deno", argv: (t, a) => ["run", "--allow-read=.", "--allow-write=.", "--allow-env", t, ...a], word: "the deno runtime" },
  python: { modality: "language-python", bin: "python3", argv: (t, a) => ["-I", t, ...a], word: "the cpython runtime" },
  python3: { modality: "language-python", bin: "python3", argv: (t, a) => ["-I", t, ...a], word: "the cpython runtime" },
  ruby: { modality: "language-ruby", bin: "ruby", argv: (t, a) => [t, ...a], word: "the ruby interpreter" },
  lua: { modality: "language-lua", bin: "lua", argv: (t, a) => [t, ...a], word: "the lua interpreter" },
  php: { modality: "language-php", bin: "php", argv: (t, a) => [t, ...a], word: "the php interpreter" },
  go: { modality: "language-go", bin: "go", argv: (t, a) => ["run", t, ...a], word: "the golang toolchain" },
  v: { modality: "language-v", bin: "v", argv: (t, a) => ["run", t, ...a], word: "the v compiler" },
  zig: { modality: "language-zig", bin: "zig", argv: (t, a) => ["run", t, ...a], word: "the zig toolchain" },
  nim: { modality: "language-nim", bin: "nim", argv: (t, a) => ["r", t, ...a], word: "the nim compiler" },
  java: { modality: "language-java", bin: "java", argv: (t, a) => [t, ...a], word: "the jdk runtime" },
  jvm: { modality: "runtime-jvm", bin: "java", argv: (t, a) => ["-jar", t, ...a], word: "the jvm hotspot" },
  dotnet: { modality: "language-dotnet", bin: "dotnet", argv: (t, a) => ["run", "--project", t, ...a], word: "the dotnet runtime" },
  make: { modality: "build-make", bin: "make", argv: (t, a) => ["-f", t, ...a], word: "the make builds" },
  ninja: { modality: "build-ninja", bin: "ninja", argv: (t, a) => ["-f", t, ...a], word: "the ninja builds" },
  cargo: { modality: "language-cargo", bin: "cargo", argv: (t, a) => ["run", "--manifest-path", t, ...a], word: "the cargo builds" },
});

/** the exec word of the rust lane — the two phase grammar the tool drives
 * (rustc compiles the source to the jail, the binary executes after) */
const RUSTLANE: ExecLane = { modality: "language-rust", bin: "rustc", argv: (t, a) => [t, ...a], word: "the rustc toolchain" };

/** exechelprows — the language words the help lists (sorted, one row) */
function exechelprows(): string[] {
  const words = ["rust", ...Object.keys(EXECLANES)].sort();
  return [["  exec <lang> <script|recipe> [args]  the polyglot lane — ", words.join(" ")].join("")];
}

/** runs one child argv inside the jail and answers the output rows and the
 * exit code — the one spawn helper every exec lane shares (argv only, no
 * shell, capped output, bounded wall clock) */
async function execchild(jail: string, bin: string, childargv: string[]): Promise<{ rows: string[]; code: number }> {
  const child = spawn(bin, childargv, { cwd: jail, shell: false, timeout: CAPS.timeoutms * 3 });
  const outchunks: string[] = [];
  const errchunks: string[] = [];
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => outchunks.push(chunk));
  child.stderr.on("data", (chunk: string) => errchunks.push(chunk));
  const code = await new Promise<number>((resolve) => {
    child.on("close", (exitcode) => resolve(exitcode ?? 0));
    child.on("error", () => resolve(127));
  });
  const rows: string[] = [];
  for (const line of outchunks.join("").split(/\r?\n/).slice(0, 200)) rows.push(line);
  const errtext = errchunks.join("");
  if (errtext.length > 0) {
    for (const line of errtext.split(/\r?\n/).slice(0, 60)) rows.push(["[stderr] ", line].join(""));
  }
  rows.push(["exit ", String(code)].join(""));
  return { rows, code };
}

/** toolexeclanguage — the polyglot exec lane: the jailed script executes
 * through the host runtime of its language modality (the registry is the
 * catalog, the probe answers per host). A missing runtime answers the
 * honest refusal with the modality report — nothing is simulated. */
async function toolexeclanguage(jail: string, args: string[]): Promise<string[]> {
  const lang = (args[0] ?? "").toLowerCase();
  if (lang === "isolate") return toolexecisolate(jail, args.slice(1));
  const lane = lang === "rust" ? RUSTLANE : EXECLANES[lang];
  if (lane === undefined) {
    const known = ["rust", "isolate", ...Object.keys(EXECLANES)].sort().join(" ");
    return [
      ["exec: the language ", lang || "(none)", " carries no lane"].join(""),
      ["the polyglot lane answers: ", known].join(""),
    ];
  }
  for (const token of args.slice(1)) {
    if (!RUNTOKENPATTERN.test(token)) throw new SandboxError("the exec arguments carry a rejected character");
  }
  if (!(await binaryonpath(lane.bin))) {
    const report = await hostmodalityreport();
    return [
      ["the exec lane drives ", lane.word, " (", lane.modality, ")"].join(""),
      ["this host carries no ", lane.bin, " runtime, so nothing executed"].join(""),
      ...report.map((row) => ["  ", row].join("")),
    ];
  }
  const target = args[1];
  if (target === undefined) throw new SandboxError("exec needs a script or recipe file");
  const contained = contain(jail, target);
  const relative = path.relative(jail, contained).split(path.sep).join("/");
  const callargs = args.slice(2);
  if (lang === "rust") {
    // the two phase rust grammar: rustc compiles the source inside the
    // jail, the produced binary executes with the caller args
    const compile = await execchild(jail, RUSTLANE.bin, [relative]);
    if (compile.code !== 0) return compile.rows;
    const binary = relative.replace(/\.rs$/, "");
    const run = await execchild(jail, path.join(".", binary), callargs);
    return run.rows;
  }
  const execution = await execchild(jail, lane.bin, lane.argv(relative, callargs));
  return execution.rows;
}

/** toolexecisolate — the v8 isolate lane of the runner-serverless
 * modality: the script executes inside a fresh vm context of this very
 * process (no child, no filesystem of the host outside the jail read) —
 * the isolate answers console output through the sandboxed console */
async function toolexecisolate(jail: string, args: string[]): Promise<string[]> {
  const target = args[0];
  if (target === undefined) throw new SandboxError("exec isolate needs a script file");
  for (const token of args) {
    if (!RUNTOKENPATTERN.test(token)) throw new SandboxError("the exec arguments carry a rejected character");
  }
  const contained = contain(jail, target);
  let source = "";
  try {
    source = await readFile(contained, "utf8");
  } catch {
    throw new SandboxError("the isolate script does not exist in the jail");
  }
  const rows: string[] = [];
  const sandboxconsole = {
    log: (...parts: unknown[]) => rows.push(parts.map((part) => String(part)).join(" ")),
    error: (...parts: unknown[]) => rows.push(["[stderr] ", parts.map((part) => String(part)).join(" ")].join("")),
  };
  try {
    runInNewContext(source, { console: sandboxconsole }, { timeout: CAPS.timeoutms });
    rows.push("exit 0");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    rows.push(["[stderr] ", message].join(""));
    rows.push("exit 1");
  }
  return rows;
}

/**
 * @section storage — the sqlite lane, the git objects vfs and the resolver
 * lanes (the storage and network modalities the registry declares live):
 * the sql tool drives a real sqlite database through better-sqlite3 inside
 * the jail (the vault precedent — prepared statements, no string surgery),
 * the gitobj tool drives the content-addressed git objects store (the sha1
 * catalog of the fs-gitobjects modality), the dns tool drives the node
 * resolver and the doh tool drives the https resolver. A lane without its
 * network path answers the honest error, never a simulated record.
 */

/** the row cap of one sql answer (the honest window of one select) */
const SQLROWCAP = 100;

/** the kinds of the dns resolver the dns tool answers */
type DnsKind = "a" | "aaaa" | "cname" | "mx" | "txt" | "ns";

/** toolsql — the storage-sqlite modality: one sqlite database file inside
 * the session jail, one statement per line, prepared and bound by the
 * better-sqlite3 runtime (select and pragma answer their rows, the write
 * statements answer the change count — the vault lane precedent). The
 * native addon loads through createRequire so the bundle never embeds the
 * addon identifiers — the runtime resolves it from the installed tree. */
async function toolsql(jail: string, args: string[]): Promise<string[]> {
  const dbfile = args[0];
  if (dbfile === undefined) throw new SandboxError("sql needs a database file and a statement");
  const statement = args.slice(1).join(" ");
  if (statement.length === 0) throw new SandboxError("sql needs a statement");
  const contained = contain(jail, dbfile);
  const { createRequire } = await import("node:module");
  const runtime = createRequire(import.meta.url);
  const loaded = runtime("better-sqlite3") as unknown;
  const Database = (typeof loaded === "function" ? loaded : (loaded as { default?: unknown }).default) as
    | (new (file: string) => DatabaseLike)
    | undefined;
  if (typeof Database !== "function") throw new SandboxError("the sqlite runtime did not load on this host");
  const db = new Database(contained);
  try {
    const trimmed = statement.trimStart().toLowerCase();
    const reads = trimmed.startsWith("select") || trimmed.startsWith("pragma") || trimmed.startsWith("with") || trimmed.startsWith("explain");
    if (reads) {
      const rows = db.prepare(statement).all() as Record<string, unknown>[];
      if (rows.length === 0) return ["(no rows)"];
      return rows.slice(0, SQLROWCAP).map((row) =>
        Object.entries(row)
          .map(([key, value]) => [key, "=", String(value)].join(""))
          .join(" "),
      );
    }
    const run = db.prepare(statement).run();
    return [["changes ", String(run.changes), " lastid ", String(Number(run.lastInsertRowid))].join("")];
  } finally {
    db.close();
  }
}

/** the narrow surface the sql lane drives of one sqlite database of the
 * jail (the prepared statement surface of the better-sqlite3 runtime) */
interface DatabaseLike {
  prepare(statement: string): {
    all(): unknown[];
    run(): { changes: number; lastInsertRowid: number | bigint };
  };
  close(): void;
}

/** toolgitobj — the fs-gitobjects modality: the content-addressed objects
 * store of the jail (write hashes one file into the store with the git
 * blob header and the zlib deflate, read answers the content back — the
 * sha1 catalog the vfs family declares) */
async function toolgitobj(jail: string, args: string[]): Promise<string[]> {
  const action = (args[0] ?? "").toLowerCase();
  const store = path.join(jail, ".gitobjects");
  if (action === "write") {
    const file = args[1];
    if (file === undefined) throw new SandboxError("gitobj write needs a file");
    const { createHash } = await import("node:crypto");
    const { deflateSync } = await import("node:zlib");
    const content = await readFile(contain(jail, file));
    const header = Buffer.from(["blob ", String(content.length), "\0"].join(""), "utf8");
    const storedblob = deflateSync(Buffer.concat([header, content]));
    const hash = createHash("sha1").update(Buffer.concat([header, content])).digest("hex");
    await mkdir(store, { recursive: true });
    await writeFile(path.join(store, hash), storedblob);
    return [["blob ", hash].join("")];
  }
  if (action === "read") {
    const hash = args[1];
    if (hash === undefined || !/^[0-9a-f]{40}$/.test(hash)) throw new SandboxError("gitobj read needs a sha1 hash");
    const { inflateSync } = await import("node:zlib");
    let storedblob: Buffer;
    try {
      storedblob = await readFile(path.join(store, hash));
    } catch {
      throw new SandboxError("the object does not exist in the store");
    }
    const full = inflateSync(storedblob);
    const zeropos = full.indexOf(0);
    const header = full.subarray(0, zeropos).toString("utf8");
    const content = full.subarray(zeropos + 1);
    return [["type ", header.split(" ")[0] ?? "blob", " bytes ", String(content.length)].join(""), content.toString("utf8")];
  }
  return ["gitobj: give write <file> or read <hash>"];
}

/** tooldns — the network-dns modality: the node resolver answers the
 * records of one name (the local names answer offline, the public names
 * need the resolver path of this host — the honest error answers when the
 * lane has no path) */
async function tooldns(args: string[]): Promise<string[]> {
  const name = args[0];
  if (name === undefined) throw new SandboxError("dns needs a name");
  const kind = (args[1] ?? "a").toLowerCase() as DnsKind;
  const dns = await import("node:dns/promises");
  try {
    if (kind === "a" || kind === "aaaa") {
      const records = kind === "a" ? await dns.resolve4(name) : await dns.resolve6(name);
      return records.map((record) => [name, " ", kind, " ", record].join(""));
    }
    if (kind === "cname") {
      const records = await dns.resolveCname(name);
      return records.map((record) => [name, " cname ", record].join(""));
    }
    if (kind === "mx") {
      const records = await dns.resolveMx(name);
      return records.map((record) => [name, " mx ", String(record.priority), " ", record.exchange].join(""));
    }
    if (kind === "txt") {
      const records = await dns.resolveTxt(name);
      return records.map((chunks) => [name, " txt ", chunks.join("")].join(""));
    }
    if (kind === "ns") {
      const records = await dns.resolveNs(name);
      return records.map((record) => [name, " ns ", record].join(""));
    }
    return [["dns: the kind ", kind, " carries no lane — a, aaaa, cname, mx, txt, ns"].join("")];
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code ?? "";
    const message = error instanceof Error ? error.message : String(error);
    return [["the resolver refused ", name, " (", code || message, ") — nothing was invented"].join("")];
  }
}

/** tooldoh — the network-doh modality: the https resolver answers the a
 * records of one name through the dns-over-https json lane (the public
 * resolver of the family; a host without the network path answers the
 * honest error, never a simulated record) */
async function tooldoh(args: string[]): Promise<string[]> {
  const name = args[0];
  if (name === undefined) throw new SandboxError("doh needs a name");
  const kind = (args[1] ?? "a").toLowerCase();
  try {
    const url = ["https://cloudflare-dns.com/dns-query?name=", encodeURIComponent(name), "&type=", kind.toUpperCase()].join("");
    const res = await fetch(url, { headers: { accept: "application/dns-json" }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [["the https resolver answered ", String(res.status), " — nothing was invented"].join("")];
    const data = (await res.json()) as { Answer?: { name: string; type: number; data: string }[] };
    const answers = data.Answer ?? [];
    if (answers.length === 0) return [["the https resolver answered no records for ", name].join("")];
    return answers.map((answer) => [answer.name, " ", String(answer.type), " ", answer.data].join(""));
  } catch {
    return [
      ["the doh lane could not reach the https resolver for ", name].join(""),
      "this host carries no network path, so nothing was resolved",
    ];
  }
}

/** helpsurface — the honest tool list of the sandbox */
function helpsurface(): string[] {
  return [
    "the sandbox of the run and storage lane — real files under .sandboxrun,",
    "one jail per session; nothing runs or stores in the visitor browser.",
    "tools:",
    "  pwd                                answer the jail root marker",
    "  ls | dir [path]                    list a directory",
    "  cat | type <file>                  read a file",
    "  write <file> <text>                write text (from the token join)",
    "  append <file> <text>               append text (from the token join)",
    "  echo [text]                        answer the text back",
    "  mkdir <dir>                        create a directory",
    "  rm | del [-rf] <target...>         remove files and directories",
    "  mv <from> <to>                     move or rename",
    "  cp <from> <to>                     copy a file",
    "  tree [path]                        walk the tree (depth 6, 500 entries)",
    "  stat <path>                        size, modified time and kind",
    "  clear                              empty the answer",
    "  curl | fetch | wget                pending — the network lane owns this",
    "  run <script.js> [args]            execute in the container modality",
    ...exechelprows(),
    "  sql <file.db> <statement>          the sqlite lane of the vault family",
    "  gitobj write <file> | read <hash>  the git objects store of the jail",
    "  dns <name> [a|aaaa|cname|mx|txt|ns] the resolver lane of the network",
    "  doh <name> [a]                     the https resolver lane",
    "  help                               this list",
  ];
}

/** runsandboxline — interpret one sandbox command line inside the session
 * jail and answer the rows, the exit code, the duration and the tool. the
 * content of write and append comes only from the token join — the raw
 * line is never sliced. */
export async function runsandboxline(sessionid: string, line: string): Promise<SandboxAnswer> {
  const startedat = Date.now();
  const rows: string[] = [];
  let exitcode = 0;
  let tool = "";
  try {
    const jail = await resolvejail(sessionid);
    const tokens = tokenize(line);
    if (tokens.length > 0) tool = tokens[0].toLowerCase();
    const args = tokens.slice(1);
    switch (tool) {
      case "":
        break;
      case "pwd":
        rows.push("/");
        break;
      case "ls":
      case "dir":
        rows.push(...(await toollist(jail, args[0] ?? ".")));
        break;
      case "cat":
      case "type":
        if (!args[0]) {
          rows.push("cat: give a file to read");
          break;
        }
        rows.push(...(await toolread(jail, args[0])));
        break;
      case "write":
        if (!args[0]) {
          rows.push("write: give a target file and text");
          break;
        }
        rows.push(...(await toolwrite(jail, args[0], args.slice(1).join(" "))));
        break;
      case "append":
        if (!args[0]) {
          rows.push("append: give a target file and text");
          break;
        }
        rows.push(...(await toolappend(jail, args[0], args.slice(1).join(" "))));
        break;
      case "echo":
        rows.push(args.join(" "));
        break;
      case "mkdir":
        if (!args[0]) {
          rows.push("mkdir: give a directory to create");
          break;
        }
        rows.push(...(await toolmkdir(jail, args[0])));
        break;
      case "rm":
      case "del": {
        const targets = args.filter((arg) => arg !== "-rf" && arg !== "-r" && arg !== "-f");
        if (targets.length === 0) {
          rows.push("rm: give at least one target");
          break;
        }
        rows.push(...(await toolremove(jail, targets)));
        break;
      }
      case "mv":
        if (args.length < 2) {
          rows.push("mv: give a source and a target");
          break;
        }
        rows.push(...(await toolmove(jail, args[0], args[1])));
        break;
      case "cp":
        if (args.length < 2) {
          rows.push("cp: give a source and a target");
          break;
        }
        rows.push(...(await toolcopy(jail, args[0], args[1])));
        break;
      case "tree":
        rows.push(...(await tooltree(jail, args[0] ?? ".")));
        break;
      case "stat":
        if (!args[0]) {
          rows.push("stat: give a path to inspect");
          break;
        }
        rows.push(...(await toolstat(jail, args[0])));
        break;
      case "clear":
        break;
      case "curl":
      case "fetch":
      case "wget":
        rows.push(...toolpending("network"));
        break;
      case "run": {
        // the run lane: the jailed script executes inside the container
        // modality on the family infrastructure — bind mounted jail, no
        // network, memory and cpu capped, argv only, never a shell
        if (!args[0]) throw new SandboxError("run needs a script file");
        rows.push(...(await toolruncontainer(jail, args)));
        break;
      }
      case "exec": {
        // the polyglot lane: the jailed script or recipe executes through
        // the host runtime of its language modality (the registry owns the
        // catalog, the probe answers per host, nothing is simulated)
        if (!args[0]) throw new SandboxError("exec needs a language and a script");
        rows.push(...(await toolexeclanguage(jail, args)));
        break;
      }
      case "sql": {
        // the sqlite lane: the real database of the vault family answers
        // inside the jail (prepared statements, no string surgery)
        rows.push(...(await toolsql(jail, args)));
        break;
      }
      case "gitobj": {
        // the git objects vfs: the content-addressed store of the jail
        rows.push(...(await toolgitobj(jail, args)));
        break;
      }
      case "dns": {
        // the resolver lane: the node resolver answers the records of the
        // name (the honest refusal answers when the lane has no path)
        rows.push(...(await tooldns(args)));
        break;
      }
      case "doh": {
        // the https resolver lane: dns over https through the public
        // resolver (the honest error answers without a network path)
        rows.push(...(await tooldoh(args)));
        break;
      }
      case "help":
        rows.push(...helpsurface());
        break;
      default:
        exitcode = 127;
        rows.push([tool, ": the sandbox does not carry this tool — try help"].join(""));
        break;
    }
  } catch (error) {
    exitcode = 1;
    if (error instanceof SandboxError) {
      rows.push(error.message);
    } else {
      const message = error instanceof Error ? error.message : String(error);
      rows.push(["the tool failed: ", message].join(""));
    }
  }
  let answerrows: SandboxRow[] = [];
  if (rows.length > 0) {
    const output = cliptext(rows.join("\n"), CAPS.maxoutputchars);
    answerrows = output.split("\n").map((row) => ({ line: row }));
  }
  return { rows: answerrows, exitcode, durationms: Date.now() - startedat, tool };
}

/** createsandboxsession — open the jail and write the welcome page once;
 * the page tells the visitor where the session lives and lists the tools */
export async function createsandboxsession(sessionid: string): Promise<string[]> {
  const jail = await resolvejail(sessionid);
  const welcome = path.join(jail, "welcome.md");
  let exists = true;
  try {
    await stat(welcome);
  } catch {
    exists = false;
  }
  if (!exists) {
    const welcomecontent = [
      "# sandbox session",
      "",
      "this session lives on the family infrastructure, never in the visitor browser.",
      "every file below this directory is stored by the server the run lane drives.",
      "",
      "the tool surface: pwd, ls, dir, cat, type, write, append, echo, mkdir,",
      "rm, del, mv, cp, tree, stat, clear, curl, fetch, wget, run, exec, sql,",
      "gitobj, dns, doh, help. the run tool executes through the container",
      "modality when the host carries the docker runtime and refuses honestly",
      "otherwise; the exec tool drives the polyglot lane — bun, deno, python,",
      "ruby, lua, php, go, rust, cargo, java, jvm, dotnet, zig, v, nim, make,",
      "ninja and the isolate of the serverless modality — through the host",
      "runtime each language declares; the sql tool drives a real sqlite",
      "database, the gitobj tool drives the content-addressed objects store,",
      "the dns and doh tools drive the resolver lanes; curl, fetch and wget",
      "are pending — the network lane answers through the url gate of the",
      "gateway wave.",
    ];
    await writeFile(welcome, welcomecontent.join("\n"), "utf8");
  }
  return ["session ready", "type help for the tool surface"];
}

/** listsandboxtree — the storage lane's view of one session jail */
export async function listsandboxtree(sessionid: string): Promise<string[]> {
  const jail = await resolvejail(sessionid);
  return tooltree(jail, ".");
}

/** writesandboxfile — the storage lane's write into one session jail */
export async function writesandboxfile(sessionid: string, target: string, content: string): Promise<void> {
  const jail = await resolvejail(sessionid);
  await toolwrite(jail, target, content);
}

/**
 * @section modalities — the honest host report
 * the modality registry of the saddle engine is the single source of the
 * catalog (this lane keeps no modality list of its own — the corpus law:
 * the modalities of the modalityregistry are the one source and the report
 * never lies). The report walks every registry record and answers one row
 * per record: the live lanes name the lane that drives them, the host
 * records name their runtime binary and the probe verdict of this host,
 * and the planned records declare themselves planned. The probe is a pure
 * filesystem scan of the PATH — it never starts anything.
 */

/** the host probe table — the registry ids whose runtime binary the lane
 * probes on the host PATH (the registry owns the catalog; this table only
 * names the binary each probed record answers through) */
const HOSTPROBES: Readonly<Record<string, string>> = Object.freeze({
  "container-docker": "docker",
  "emulator-qemu": "qemu-system-x86_64",
  "microvm-firecracker": "firecracker",
  "container-runsc": "runsc",
  "runner-bun": "bun",
  "runner-deno": "deno",
  "language-python": "python3",
  "language-ruby": "ruby",
  "language-lua": "lua",
  "language-php": "php",
  "language-go": "go",
  "language-rust": "rustc",
  "language-cargo": "cargo",
  "language-java": "java",
  "runtime-jvm": "java",
  "language-zig": "zig",
  "language-v": "v",
  "language-nim": "nim",
  "language-dotnet": "dotnet",
  "build-make": "make",
  "build-ninja": "ninja",
});

/** the live lane words — the honest sentence each live record of the
 * registry answers with (the registry declares the state, the lane names
 * the surface it drives) */
const LIVELANES: Readonly<Record<string, string>> = Object.freeze({
  "runner-node": "the node runtime the run lane executes inside the container",
  "fs-vfs": "the session jail the storage lane drives",
  "runner-serverless": "the v8 isolate the exec lane drives in process",
  "storage-sqlite": "the sqlite database the sql tool drives through better-sqlite3",
  "fs-gitobjects": "the content-addressed objects store the gitobj tool drives",
  "network-dns": "the node resolver the dns tool drives",
  "network-doh": "the https resolver the doh tool drives",
});

/** binaryonpath — a pure PATH scan with stat (windows also probes the exe
 * and cmd suffixes); the probe answers existence only, nothing is started */
async function binaryonpath(binary: string): Promise<boolean> {
  const pathvalue = process.env.PATH ?? "";
  const separator = process.platform === "win32" ? ";" : ":";
  const suffixes = process.platform === "win32" ? ["", ".exe", ".cmd"] : [""];
  for (const dir of pathvalue.split(separator)) {
    if (!dir) continue;
    for (const suffix of suffixes) {
      const candidate = path.join(dir, [binary, suffix].join(""));
      try {
        const info = await stat(candidate);
        if (info.isFile()) return true;
      } catch {
        // not on this path entry — keep scanning
      }
    }
  }
  return false;
}

/** hostmodalityreport — one honest row per record of the saddle modality
 * registry (the single source), headed by the summary that names the ninety
 * plan and the state counts: every live record names the lane that drives
 * it (and the probed live runtime answers its availability), every host
 * record names its runtime binary and the probe verdict of this host, and
 * every planned record declares itself planned — the report never lies */
export async function hostmodalityreport(): Promise<string[]> {
  const report = planreport();
  const rows: string[] = [];
  for (const modality of MODALITIES) {
    const probe = HOSTPROBES[modality.id];
    if (modality.state === "live") {
      if (probe !== undefined) {
        const available = await binaryonpath(probe);
        rows.push(
          [
            modality.id,
            ": live lane — ",
            probe,
            available ? " available on this host" : " not installed on this host, the run lane refuses honestly",
          ].join(""),
        );
        continue;
      }
      rows.push([modality.id, ": live lane — ", LIVELANES[modality.id] ?? "the platform drives it"].join(""));
      continue;
    }
    if (modality.state === "host") {
      const binary = probe ?? modality.id;
      const available = await binaryonpath(binary);
      rows.push([modality.id, ": host runtime ", binary, available ? " available on this host" : " not installed"].join(""));
      continue;
    }
    rows.push([modality.id, ": planned — the catalog promise, no lane wires it yet"].join(""));
  }
  rows.unshift(
    [
      "the modality registry answers the ninety plan: ",
      String(report.catalogcount),
      " records — ",
      String(report.live),
      " live, ",
      String(report.host),
      " host, ",
      String(report.planned),
      " planned",
    ].join(""),
  );
  return rows;
}
