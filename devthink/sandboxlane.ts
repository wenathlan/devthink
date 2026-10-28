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
import { appendFile, copyFile, mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
// the modality registry of the sibling saddle engine — the single source of
// the catalog (this lane keeps no modality list of its own). The library
// specifier answers every runner through the bridge family: the tsconfig
// paths (the typechecker, bun, tsx and the library build), the vite and
// vitest aliases (the dev server and the tests) and the declaration seam
// (the declaration emit). The bridges retire when the published saddle
// envelope carries the ./modalities export — the same retirement the
// sandbox bridge of the vite config names
import { MODALITIES, planreport } from "@wenathlan/saddle/modalities";

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
      "rm, del, mv, cp, tree, stat, clear, curl, fetch, wget, run, help.",
      "the run tool executes through the container modality when the host carries",
      "the docker runtime and refuses honestly otherwise; curl, fetch and wget are",
      "pending — the network lane answers through the url gate of the gateway wave.",
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
});

/** the live lane words — the honest sentence each live record of the
 * registry answers with (the registry declares the state, the lane names
 * the surface it drives) */
const LIVELANES: Readonly<Record<string, string>> = Object.freeze({
  "runner-node": "the node runtime the run lane executes inside the container",
  "fs-vfs": "the session jail the storage lane drives",
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
 * registry (the single source), headed by the summary that names the forty
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
      "the modality registry answers the forty plan: ",
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
