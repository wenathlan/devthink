// # edgelandes.host.ts — the host binary lane executors of the ninety
// modalities wave, group a: twenty-five planned sandbox modalities
// wired as honest host-binary execution lanes — the sandbox jails, the
// container extensions, the runtimes, the screens, the mobile seat, the
// builds, the ci runners, the network tunnels and the storage daemons
// the engine host may carry. Every lane follows the spawn pattern of
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
// surface — the same law with its own seat. All twenty-five lanes are
// kind live: the executor exists and drives the runtime when present,
// exactly like language-ruby rides live though a host may not carry it.

import { type ChildProcess, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { connect } from "node:net";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import process from "node:process";
import { type EdgeLaneExecutor, type EdgeLaneOutput, edgelaneerror, probehostbinary } from "./edgelandes.ts";

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the lane contract — the host lane spec and the executor seat. */
/* ════════════════════════════════════════════════════════════════════ */

/** one host lane declaration: the modality id, the kind (every lane
 * here is live — the executor drives the runtime when present), the
 * runtime surface it rides and the synchronous presence probe. */
export interface HostLaneSpec {
  /** the modality id the lane wires (the registry id). */
  modality: string;
  /** live lanes execute, host lanes probe (all twenty-five are live). */
  kind: "live" | "host";
  /** the runtime surface the lane rides ("bwrap", "docker", "tor"...). */
  runtime: string;
  /** the honest presence probe of the runtime on this engine host. */
  present: () => boolean;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the shared host execution surface — spawn, deadline, temp. */
/* ════════════════════════════════════════════════════════════════════ */

/** the per stream capture ceiling: 256 kb of stdout or stderr, the honest
 * bound every host lane reports under. */
const OUTPUTCAPBYTES = 262144;

/** the result of one host process run. */
interface ProcessRun {
  stdout: string;
  stderr: string;
}

/** spawns one host runtime under a hard deadline, captures both streams
 * (capped), optionally feeds a stdin payload, kills on timeout and
 * answers the coded failures honestly: a missing binary answers
 * HOST_RUNTIME_ABSENT, a nonzero exit answers RUN_EXITED_NONZERO
 * carrying the stderr, a blown deadline answers RUN_DEADLINE_EXCEEDED. */
function runhostprocess(
  command: string,
  args: string[],
  options: { cwd: string; deadline: number; env?: Record<string, string>; stdin?: string },
): Promise<ProcessRun> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env === undefined ? process.env : { ...process.env, ...options.env },
      stdio: [options.stdin === undefined ? "ignore" : "pipe", "pipe", "pipe"],
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
async function writeinputsfile(dir: string, inputs: unknown): Promise<Record<string, string> | undefined> {
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
  const inputenv = (await writeinputsfile(dir, inputs)) ?? {};
  const run = await runhostprocess(command, args, { cwd: dir, deadline, env: { ...inputenv, ...extraenv } });
  return { stdout: run.stdout, stderr: run.stderr };
}

/** the safe message of an unknown thrown value (no stack ever rides a lane answer). */
function errormessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error ?? "unknown lane failure");
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
    absentruntime("sandbox-bubblewrap", "bwrap");
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
    absentruntime("sandbox-nsjail", "nsjail");
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
    const deps = await runhostprocess("ldd", ["/bin/bash"], { cwd: root, deadline: 2000 });
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
    absentruntime("sandbox-chroot", "chroot", "(and fakechroot, the unprivileged seat, is absent too)");
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
    const run = await runhostprocess(command, args, { cwd: dir, deadline, env });
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
    absentruntime("container-podman", "podman");
  }
  return withtempdirhost(async (dir) => {
    await writeFile(join(dir, "script.sh"), code, "utf8");
    const inputenv = await writeinputsfile(dir, inputs);
    const env = inputenv === undefined ? undefined : { ...inputenv, SADDLE_EDGE_INPUTS: "/work/inputs.json" };
    const run = await runhostprocess(
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
    absentruntime("container-containerd", "ctr");
  }
  return withtempdirhost(async (dir) => {
    const inputenv = await writeinputsfile(dir, inputs);
    const run = await runhostprocess(
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
  const seat = await runhostprocess("bash", ["-c", "command -v busybox"], { cwd: dir, deadline: 2000 });
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
    const inputenv = await writeinputsfile(dir, inputs);
    const run = await runhostprocess(runtime, ["run", nextlaneid(`saddleedge-${runtime}`)], {
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
  return runocilane("container-runc", "runc", code, inputs, deadline);
}

/** container-crun: the same oci bundle law through the crun runtime. */
async function containercrunlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  return runocilane("container-crun", "crun", code, inputs, deadline);
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
  const inputenv = await writeinputsfile(dir, inputs);
  const env = inputenv === undefined ? undefined : { ...inputenv, SADDLE_EDGE_INPUTS: "/work/inputs.json" };
  const run = await runhostprocess(
    "docker",
    ["run", "--rm", "-v", `${dir}:/work`, "-w", "/work", ...profileargs, "/bin/bash", "/work/script.sh"],
    { cwd: dir, deadline, env },
  );
  return { stdout: run.stdout, stderr: run.stderr };
}

/** container-max: the docker max profile — no network, every capability
 * dropped, the pid limit raised to 256 and the memory swap left open:
 * more resources than the lite seat, the same honest spawn law. */
async function containermaxlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probedockersurface()) {
    absentruntime("container-max", "docker", "(no docker binary and no /var/run/docker.sock)");
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
async function containerlitelane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probedockersurface()) {
    absentruntime("container-lite", "docker", "(no docker binary and no /var/run/docker.sock)");
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
async function containerghcrlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probedockersurface()) {
    absentruntime("container-ghcr", "docker", "(no docker binary and no /var/run/docker.sock)");
  }
  return withtempdirhost(async (dir) => {
    const record = (inputs ?? {}) as { image?: unknown; script?: unknown };
    const image =
      typeof record.image === "string" && record.image.length > 0 ? record.image : "ghcr.io/distroless/cc:latest";
    const script = typeof record.script === "string" ? record.script : code;
    const inputenv = await writeinputsfile(dir, inputs);
    const run = await runhostprocess(
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
async function runtimeclrlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("dotnet")) {
    absentruntime("runtime-clr", "dotnet");
  }
  const scripttool = probehostbinary("dotnet-script");
  return withtempdirhost(async (dir) => {
    const inputenv = await writeinputsfile(dir, inputs);
    if (scripttool) {
      await writeFile(join(dir, "program.csx"), code, "utf8");
      const run = await runhostprocess("dotnet", ["script", "program.csx"], { cwd: dir, deadline, env: inputenv });
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
    const run = await runhostprocess("dotnet", ["run", "--project", "lane.csproj"], {
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
    absentruntime("runtime-workerd", "workerd");
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
    const inputenv = await writeinputsfile(dir, inputs);
    const run = await runhostprocess("workerd", ["serve", "workerd.capnp"], { cwd: dir, deadline, env: inputenv });
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
    absentruntime("screen-xvfb", "xvfb-run");
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

/** screen-wayland: the headless compositor lane. cage is the first seat
 * (the wlroots headless backend, the runtime dir as the xdg seat so the
 * socket lands inside the private temp dir); weston is the fallback —
 * one bash spawn drives the compositor and the script in sequence, the
 * deadline covers the whole session and the compositor dies with the
 * script. A host carrying neither answers the coded absence. */
async function screenwaylandlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const cagepresent = probehostbinary("cage");
  const westonpresent = probehostbinary("weston");
  if (!cagepresent && !westonpresent) {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      "the host runtime cage is absent: the lane screen-wayland requires it on PATH (weston, the alternative seat, is absent too)",
    );
  }
  return withtempdirhost(async (dir) => {
    if (cagepresent) {
      return await runscript("cage", ["--", "/bin/bash", "script.sh"], dir, code, inputs, deadline, {
        XDG_RUNTIME_DIR: dir,
        WLR_BACKENDS: "headless",
      });
    }
    await writeFile(join(dir, "script.sh"), code, "utf8");
    const inputenv = (await writeinputsfile(dir, inputs)) ?? {};
    const session = [
      `XDG_RUNTIME_DIR="${dir}" weston --backend=headless-backend.so --socket=wayland-0 >/dev/null 2>&1 &`,
      "westonpid=$!",
      "sleep 0.3",
      `WAYLAND_DISPLAY=wayland-0 XDG_RUNTIME_DIR="${dir}" /bin/bash script.sh`,
      "status=$?",
      'kill "$westonpid" 2>/dev/null',
      'wait "$westonpid" 2>/dev/null',
      "exit $status",
    ].join("\n");
    const run = await runhostprocess("bash", ["-c", session], { cwd: dir, deadline, env: inputenv });
    return { stdout: run.stdout, stderr: run.stderr };
  });
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
    absentruntime("mobile-termux", "termux", "(the termux host prefix exists only inside a termux device host)");
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
    absentruntime("build-bazel", "bazel");
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

/** build-buck: the buck2 lane. A minimal BUCK file wires the script as
 * one sh_binary and buck2 runs it with HOME at the temp dir so the
 * buck caches stay inside the private seat. */
async function buildbucklane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("buck2")) {
    absentruntime("build-buck", "buck2");
  }
  return withtempdirhost(async (dir) => {
    await writeFile(join(dir, ".buckconfig"), "[repositories]\nroot = .\n", "utf8");
    await writeFile(join(dir, "BUCK"), 'sh_binary(\n  name = "lane",\n  srcs = ["script.sh"],\n)\n', "utf8");
    return await runscript("buck2", ["run", "//:lane"], dir, code, inputs, deadline, { HOME: dir });
  });
}

/** the turbo seat: the binary on PATH or the engine module graph's
 * turbo package (the bin shim it ships) — the honest probe answers
 * present only when one of the two seats resolves. */
function turboseat(): { present: boolean; binpath: string; viabinary: boolean } {
  if (probehostbinary("turbo")) {
    return { present: true, binpath: "turbo", viabinary: true };
  }
  try {
    const resolved = createRequire(import.meta.url).resolve("turbo");
    let dir = dirname(resolved);
    while (dir !== dirname(dir)) {
      if (basename(dir) === "turbo" && basename(dirname(dir)) === "node_modules") {
        const binpath = join(dir, "bin", "turbo");
        if (existsSync(binpath)) {
          return { present: true, binpath, viabinary: false };
        }
      }
      dir = dirname(dir);
    }
  } catch {
    // the module seat is absent: the binary seat already answered
  }
  return { present: false, binpath: "", viabinary: false };
}

/** build-turborepo: the turbo lane. A minimal package.json whose build
 * script is the code field plus a minimal turbo.json, then turbo run
 * build — through the binary seat when the host carries it, through the
 * engine module seat's bin shim (spawned under node) when the repo
 * carries turbo only as a dependency. */
async function buildturborepolane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  const seat = turboseat();
  if (!seat.present) {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      "the host runtime turbo is absent: the lane build-turborepo requires it on PATH (neither the turbo binary nor the engine module seat resolved)",
    );
  }
  return withtempdirhost(async (dir) => {
    const manifest = {
      name: "saddle-edge-turbo-lane",
      private: true,
      version: "0.0.0",
      scripts: { build: code },
    };
    await writeFile(join(dir, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    await writeFile(
      join(dir, "turbo.json"),
      `${JSON.stringify({ $schema: "https://turbo.build/schema.json", tasks: { build: { outputs: [] } } }, null, 2)}\n`,
      "utf8",
    );
    const inputenv = (await writeinputsfile(dir, inputs)) ?? {};
    const command = seat.viabinary ? "turbo" : "node";
    const args = seat.viabinary ? ["run", "build"] : [seat.binpath, "run", "build"];
    const run = await runhostprocess(command, args, { cwd: dir, deadline, env: { ...inputenv, HOME: dir } });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 9: the ci runner lanes — the actions and gitlab seats. */
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
    absentruntime("ci-actions", "actions-runner", "(no Runner.Listener on PATH and no ACTIONS_RUNNER_ROOT directory)");
  }
  return withtempdirhost(async (dir) => {
    let runnerroot = root;
    if (runnerroot.length === 0) {
      const seat = await runhostprocess("bash", ["-c", "command -v Runner.Listener"], {
        cwd: dir,
        deadline: Math.min(deadline, 2000),
      });
      runnerroot = dirname(seat.stdout.trim());
    }
    await writeFile(join(dir, "script.sh"), code, "utf8");
    const inputenv = await writeinputsfile(dir, inputs);
    const run = await runhostprocess("./Runner.Listener", ["run", "--once"], {
      cwd: runnerroot,
      deadline,
      env: inputenv,
    });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/** ci-gitlab: the gitlab runner lane. The job script rides a minimal
 * .gitlab-ci.yml (one job, one block scalar script) and the runner
 * executes it through `exec docker`; a modern runner that removed the
 * exec command answers RUNTIME_CAPABILITY_ABSENT with the message
 * naming the removal — the runtime exists, the capability is gone. */
async function cigitlablane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("gitlab-runner")) {
    absentruntime("ci-gitlab", "gitlab-runner");
  }
  return withtempdirhost(async (dir) => {
    const body = code
      .split("\n")
      .map((line) => `      ${line}`)
      .join("\n");
    await writeFile(join(dir, ".gitlab-ci.yml"), `lane:\n  script:\n    - |\n${body}\n`, "utf8");
    const inputenv = await writeinputsfile(dir, inputs);
    try {
      const run = await runhostprocess("gitlab-runner", ["exec", "docker", "lane"], {
        cwd: dir,
        deadline,
        env: inputenv,
      });
      return { stdout: run.stdout, stderr: run.stderr };
    } catch (error) {
      const stderr = (error as { stderr?: string }).stderr ?? "";
      if (typeof (error as { code?: unknown }).code === "string" && /unknown command/i.test(stderr)) {
        throw edgelaneerror(
          "RUNTIME_CAPABILITY_ABSENT",
          "the host runtime gitlab-runner refused the exec command: exec was removed from the modern runners (the lane ci-gitlab requires a runner that still carries exec)",
          { stderr },
        );
      }
      throw error;
    }
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
    absentruntime("network-tor", "tor");
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
      "network-i2p",
      "i2p",
      "(the i2prouter binary is absent and the router console 7657 cannot be managed)",
    );
  }
  return withtempdirhost(async (dir) => {
    let startedrouter = false;
    try {
      const consoleopen = await waitforport(7657, 300);
      if (!consoleopen) {
        await runhostprocess("i2prouter", ["start"], { cwd: dir, deadline: Math.min(deadline, 8000) });
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
          await runhostprocess("i2prouter", ["graceful"], { cwd: dir, deadline: Math.min(deadline, 8000) });
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
    absentruntime("network-wireguard", "wg");
  }
  return withtempdirhost(async (dir) => {
    const inputenv = (await writeinputsfile(dir, inputs)) ?? {};
    if (code.trim().length === 0) {
      let report = "";
      let reporterr = "";
      try {
        const show = await runhostprocess("wg", ["show"], { cwd: dir, deadline, env: inputenv });
        report = show.stdout;
        reporterr = show.stderr;
      } catch (error) {
        // wg show on a host without interfaces or privileges answers
        // nonzero: the report is informational, the failure rides stderr
        reporterr = `${errormessage(error)}${(error as { stderr?: string }).stderr ?? ""}`;
      }
      const pair = await runhostprocess("bash", ["-c", "wg genkey | wg pubkey"], {
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
    const run = await runhostprocess("bash", ["script.sh"], { cwd: dir, deadline, env: inputenv });
    return { stdout: run.stdout, stderr: run.stderr };
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 11: the storage daemon lanes — the minio and garage clients. */
/* ════════════════════════════════════════════════════════════════════ */

/** storage-minio: the minio client lane. The code field is a shell
 * script riding the mc CLI; the inputs {alias, url, accesskey,
 * secretkey} (all optional) derive the MC_HOST_<alias> env so the
 * script addresses the vault — without them mc answers its own honest
 * error and the lane wraps it, never invents a vault. */
async function storageminiolane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("mc")) {
    absentruntime("storage-minio", "mc");
  }
  return withtempdirhost(async (dir) => {
    const record = (inputs ?? {}) as { alias?: unknown; url?: unknown; accesskey?: unknown; secretkey?: unknown };
    const alias = typeof record.alias === "string" && record.alias.length > 0 ? record.alias : "lane";
    const extraenv: Record<string, string> = {};
    if (typeof record.url === "string" && record.url.length > 0) {
      const accesskey = typeof record.accesskey === "string" ? record.accesskey : "";
      const secretkey = typeof record.secretkey === "string" ? record.secretkey : "";
      extraenv[`MC_HOST_${alias}`] = `https://${accesskey}:${secretkey}@${record.url}`;
    }
    return await runscript("bash", ["script.sh"], dir, code, inputs, deadline, extraenv);
  });
}

/** storage-garage: the garage client lane. The same script law — the
 * code field rides bash with the garage CLI on PATH, and the inputs
 * {rpchost, rpcsecret} derive the GARAGE_RPC_HOST and
 * GARAGE_RPC_SECRET env when the caller sent them. */
async function storagegaragelane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (!probehostbinary("garage")) {
    absentruntime("storage-garage", "garage");
  }
  return withtempdirhost(async (dir) => {
    const record = (inputs ?? {}) as { rpchost?: unknown; rpcsecret?: unknown };
    const extraenv: Record<string, string> = {};
    if (typeof record.rpchost === "string" && record.rpchost.length > 0) {
      extraenv.GARAGE_RPC_HOST = record.rpchost;
    }
    if (typeof record.rpcsecret === "string" && record.rpcsecret.length > 0) {
      extraenv.GARAGE_RPC_SECRET = record.rpcsecret;
    }
    return await runscript("bash", ["script.sh"], dir, code, inputs, deadline, extraenv);
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 12: the lane table — the specs, the executors, the ids. */
/* ════════════════════════════════════════════════════════════════════ */

/** the host lane table of the ninety modalities wave, group a: the
 * twenty-five host binary lanes, every one kind live — the executor
 * exists and drives the runtime when the host carries it. The ids are
 * pinned — the dispatcher merge and the api surface read them exactly. */
export const hostlanespecs: readonly HostLaneSpec[] = Object.freeze([
  { modality: "sandbox-bubblewrap", kind: "live", runtime: "bwrap", present: () => probehostbinary("bwrap") },
  { modality: "sandbox-nsjail", kind: "live", runtime: "nsjail", present: () => probehostbinary("nsjail") },
  {
    modality: "sandbox-chroot",
    kind: "live",
    runtime: "chroot",
    present: () => probehostbinary("chroot") || probehostbinary("fakechroot"),
  },
  { modality: "container-podman", kind: "live", runtime: "podman", present: () => probehostbinary("podman") },
  { modality: "container-containerd", kind: "live", runtime: "ctr", present: () => probehostbinary("ctr") },
  { modality: "container-runc", kind: "live", runtime: "runc", present: () => probehostbinary("runc") },
  { modality: "container-crun", kind: "live", runtime: "crun", present: () => probehostbinary("crun") },
  { modality: "container-max", kind: "live", runtime: "docker", present: probedockersurface },
  { modality: "container-lite", kind: "live", runtime: "docker", present: probedockersurface },
  { modality: "container-ghcr", kind: "live", runtime: "docker", present: probedockersurface },
  { modality: "runtime-clr", kind: "live", runtime: "dotnet", present: () => probehostbinary("dotnet") },
  { modality: "runtime-workerd", kind: "live", runtime: "workerd", present: () => probehostbinary("workerd") },
  { modality: "screen-xvfb", kind: "live", runtime: "xvfb-run", present: () => probehostbinary("xvfb-run") },
  {
    modality: "screen-wayland",
    kind: "live",
    runtime: "cage",
    present: () => probehostbinary("cage") || probehostbinary("weston"),
  },
  { modality: "mobile-termux", kind: "live", runtime: "termux", present: () => probehostbinary("termux") },
  { modality: "build-bazel", kind: "live", runtime: "bazel", present: () => probehostbinary("bazel") },
  { modality: "build-buck", kind: "live", runtime: "buck2", present: () => probehostbinary("buck2") },
  { modality: "build-turborepo", kind: "live", runtime: "turbo", present: () => turboseat().present },
  {
    modality: "ci-actions",
    kind: "live",
    runtime: "actions-runner",
    present: () => probehostbinary("Runner.Listener") || actionsrunnerroot().length > 0,
  },
  { modality: "ci-gitlab", kind: "live", runtime: "gitlab-runner", present: () => probehostbinary("gitlab-runner") },
  { modality: "network-tor", kind: "live", runtime: "tor", present: () => probehostbinary("tor") },
  { modality: "network-i2p", kind: "live", runtime: "i2p", present: () => probehostbinary("i2prouter") },
  { modality: "network-wireguard", kind: "live", runtime: "wg", present: () => probehostbinary("wg") },
  { modality: "storage-minio", kind: "live", runtime: "mc", present: () => probehostbinary("mc") },
  { modality: "storage-garage", kind: "live", runtime: "garage", present: () => probehostbinary("garage") },
]);

/** the host lane executor table: one executor per lane id, keyed by the
 * modality id in the same order as the spec table; the dispatch plane
 * refuses to boot over a lane it cannot wire. */
export const edgelaneexecutorshost: Readonly<Record<string, EdgeLaneExecutor>> = Object.freeze({
  "sandbox-bubblewrap": sandboxbubblewraplane,
  "sandbox-nsjail": sandboxnsjaillane,
  "sandbox-chroot": sandboxchrootlane,
  "container-podman": containerpodmanlane,
  "container-containerd": containercontainerdlane,
  "container-runc": containerrunclane,
  "container-crun": containercrunlane,
  "container-max": containermaxlane,
  "container-lite": containerlitelane,
  "container-ghcr": containerghcrlane,
  "runtime-clr": runtimeclrlane,
  "runtime-workerd": runtimeworkerdlane,
  "screen-xvfb": screenxvfblane,
  "screen-wayland": screenwaylandlane,
  "mobile-termux": mobiletermuxlane,
  "build-bazel": buildbazellane,
  "build-buck": buildbucklane,
  "build-turborepo": buildturborepolane,
  "ci-actions": ciactionslane,
  "ci-gitlab": cigitlablane,
  "network-tor": networktorlane,
  "network-i2p": networki2plane,
  "network-wireguard": networkwireguardlane,
  "storage-minio": storageminiolane,
  "storage-garage": storagegaragelane,
});

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
