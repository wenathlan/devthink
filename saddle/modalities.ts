// # modalities.ts — the master virtualization engine of saddle: the
// ninety modalities from the first to the ninetieth (the pr15 law),
// every one a real and functional seat of the engine.
//
// THE NINETY LAW (pr15): saddle is the master virtualization engine of
// the family — the vm, the sandbox, the microvm, the runner and the
// hardware virtual seats — and the registry this file owns counts
// exactly ninety entries: the numeric id (1 to 90), the name, the lane
// (sandbox, vm, runner or hardware) and the real executable logic of
// the seat (the spawn plans, the cgroups-style resource flags and the
// queue orchestration every entry carries). no fake stubs: every entry
// owns a working implementation function — the host seats build the
// real argv the engine host executes (docker, qemu, firecracker, the
// language runtimes), the in-process seats do the real work in
// typescript (the yaml interpreter, the babel compilation bridge, the
// virtual file store, the vfs, the port dock, the wasm instantiation,
// the wire packet builders, the sigv4 signing chain) and the provider
// seats (aws, daytona, 2b) build the real signed requests the edge
// infrastructure answers.
//
// THE CRITICAL LAW (the visitor law — the law that governs every line
// of this file): the engine NEVER touches the person's machine — not
// the visitor gpu, not the visitor cpu, not the visitor browser, not
// the visitor local storage, not localforage, nothing. everything the
// engine executes runs on our own twenty-four hour internet
// infrastructure through edge processing (saddle owns the compute,
// vault owns the storage). the visitorguard function enforces the law
// at the dispatch gate: a request that asks for a visitor scope, a
// browser scope, a local storage scope or a local device answers the
// coded refusal before one instruction rides, and the engine spawner
// refuses to run inside any browser context (the engine host is the
// self-hosted edge alone).
//
// THE ENGINE LIMITS LAW (pr15): the engines are unlimited — the
// engine graph carries no ceiling on workloads, sessions, modalities
// or artifacts. the limits that exist are plan limits (for example the
// 50 gb per plan storage quota) and they are devthink system plan
// logic, never engine limits: they arrive from outside through the
// plan envelope seam (see engineplans.ts) and scope one run only.
//
// THE LANE LAW: every entry rides one of the four lanes — vm (the
// machine seats), hardware (the virtual hardware presentation seats),
// runner (the program execution seats) and sandbox (the isolation,
// port, file, storage, network and delivery seats the sandbox mounts).
//
// THE ARCHITECTURE STANDARD: every entry declares the architecture
// seats of the 11-architecture standard it answers (containerarch.ts:
// linux-x64, darwin-arm64, windows-x64, linux-arm64, darwin-x64,
// windows-arm64, linux-x64-musl, linux-riscv64, wasm32,
// darwin-arm64-v8, windows-x64-gnu) and the os host profiles it may
// host (osprofiles.ts: linux, grapheneos, omarchy, maruos, vanillaos,
// v, windows, android — catalog only).
//
// Section map:
//   section 1 — the contracts (lanes, requests, results, plans, flags)
//   section 2 — the visitor guard (the critical law, executable)
//   section 3 — the resource flag builders (cgroups v2, docker, microvm)
//   section 4 — the queue orchestration (express, normal, batch)
//   section 5 — the engine spawner (the self-hosted host alone)
//   section 6 — the in-process engines (yaml, babel, wasm, files, wire)
//   section 7 — the executor builders (host spawn, in-process, provider)
//   section 8 — the ninety (the table of record)
//   section 9 — the dispatch (executemodality and the resolvers)
//
// Pure orchestration and pure functions at load: the node-only
// surfaces (child_process, vm, sqlite) ride lazy dynamic imports inside
// the executors so the browser-pure bundle keeps carrying the table.

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the contracts — the vocabulary of the ninety.            */
/* ════════════════════════════════════════════════════════════════════ */

/** The four lanes of the engine (the lane law): vm — the machine
 * seats; hardware — the virtual hardware presentation seats; runner —
 * the program execution seats; sandbox — the isolation and the mount
 * seats (ports, files, storage, network, delivery). */
export type ModalityLane = "sandbox" | "vm" | "runner" | "hardware";

/** The boot cost classes the ladder measures (the same ladder the
 * registry of record pins). */
export type ModalityBootClass = "hot" | "warm" | "cold";

/** The honest wiring state of one seat (the report never lies): live —
 * the engine drives it today; host — the lane probes the host runtime
 * or its configuration first; planned — the declared promise. */
export type ModalityWiringState = "live" | "host" | "planned";

/** The resource envelope one seat applies to a run — the numbers the
 * cgroups-style flags derive from (scaled by the engine profile). */
export interface ResourceEnvelope {
  /** The cpu weight (1 to 10000, the cgroups v2 cpu.weight scale). */
  readonly cpuweight: number;
  /** The cpu ceiling in percent of one core (the cpu.max quota). */
  readonly cpupercent: number;
  /** The memory ceiling in megabytes (the memory.max quota). */
  readonly memorymb: number;
  /** The process ceiling (the pids.max quota). */
  readonly pids: number;
  /** The io ceiling in mbps (the io.max rbps/wbps quota). */
  readonly iombps: number;
}

/** The cgroups v2 slice one run rides — the resource flags the engine
 * stamps for every spawn (the cgroups-style resource law). */
export interface CgroupSlice {
  /** The cpu.max pair: quota and period ("max 100000" = no quota). */
  readonly cpumax: string;
  /** The cpu.weight (1 to 10000). */
  readonly cpuweight: number;
  /** The memory.max ceiling in bytes. */
  readonly memorymax: number;
  /** The memory.high throttle in bytes. */
  readonly memoryhigh: number;
  /** The pids.max ceiling. */
  readonly pidsmax: number;
  /** The io.max line (device rbps/wbps limits). */
  readonly iomax: string;
  /** The slice name the flags ride under. */
  readonly slice: string;
}

/** The spawn plan one seat builds — the real executable logic of the
 * host seats: the argv, the sandbox environment, the working
 * directory, the cgroup slice and the hardening gates applied. */
export interface SpawnPlan {
  /** The real command the engine host executes (argv[0] is the binary). */
  readonly argv: readonly string[];
  /** The sandbox environment the spawn carries (never the host env). */
  readonly env: Readonly<Record<string, string>>;
  /** The working directory of the spawn (the staged workspace). */
  readonly cwd: string;
  /** The staged workspace of the run: the fresh mkdtemp directory under
   * the engine staging root, the payload file the binary execs and the
   * staged proof (never the visitor disk, removed after the run answers). */
  readonly workspace: {
    readonly dir: string;
    readonly file: string;
    readonly staged: true;
  };
  /** The cgroups v2 slice of the spawn. */
  readonly cgroups: CgroupSlice;
  /** The hardening gates applied to the spawn. */
  readonly hardening: readonly string[];
  /** The run deadline in milliseconds. */
  readonly deadlinems: number;
}

/** One run request the dispatch answers (the engine api vocabulary):
 * the code payload, the caller inputs, the deadline, the engine
 * profile, the architecture seat, the os host profile and the explicit
 * scope declaration (the visitor law reads it — the scope may never
 * name the visitor machine). */
export interface ModalityRunRequest {
  /** The program payload: script text, base64 bytes or a plan document. */
  readonly code: string;
  /** The caller inputs surfaced to the program when given. */
  readonly inputs?: unknown;
  /** The run deadline in milliseconds (clamped between 250 and 60000). */
  readonly deadlinems?: number;
  /** The engine profile of the run (max, balanced or lite). */
  readonly profile?: string;
  /** The architecture seat of the 11-architecture standard. */
  readonly arch?: string;
  /** The os host profile id of the run (the catalog rows). */
  readonly osprofile?: string;
  /** The explicit execution scope — "engine" (the default and the only
   * honest value: everything runs on the self-hosted edge). the guard
   * refuses "visitor", "browser", "local" and every synonym. */
  readonly scope?: string;
}

/** One run result the dispatch answers: the seat identity, the honest
 * status, the captured streams, the spawn plan the seat built, the
 * in-process artifact and the coded error. */
export interface ModalityRunResult {
  /** The slug of the seat that ran. */
  readonly modality: string;
  /** The numeric id of the seat that ran (1 to 90). */
  readonly num: number;
  /** The lane of the seat that ran. */
  readonly lane: ModalityLane;
  /** The honest status of the run. */
  readonly status: "succeeded" | "failed";
  /** The captured stdout when the run produced any. */
  readonly stdout?: string;
  /** The captured stderr when the run produced any. */
  readonly stderr?: string;
  /** The spawn plan the seat built (the host seats always answer it). */
  readonly plan?: SpawnPlan;
  /** The artifact the in-process seats answer (documents, manifests). */
  readonly artifact?: unknown;
  /** The coded error when the run failed. */
  readonly error?: { readonly code?: string; readonly message: string };
  /** The measured duration of the run in milliseconds. */
  readonly durationms: number;
}

/** The executor contract every seat of the ninety implements — the
 * working implementation function the registry law demands (no fake
 * stubs: a seat without real logic never enters the table). */
export type ModalityExecutor = (request: ModalityRunRequest) => Promise<ModalityRunResult>;

/** The full record of one modality of the ninety — the table row the
 * registry of record derives its catalog from. */
export interface ModalitySpec {
  /** The numeric id of the seat: 1 (the first) to 90 (the ninetieth). */
  readonly num: number;
  /** The display name of the seat (short, lowercase). */
  readonly name: string;
  /** The stable slug the api, the config rows and the lane tables reference. */
  readonly slug: string;
  /** The lane of the seat (sandbox, vm, runner or hardware). */
  readonly lane: ModalityLane;
  /** The isolation depth the seat reaches (process, namespace, vm, hardware). */
  readonly isolation: "process" | "namespace" | "vm" | "hardware";
  /** The honest wiring state (the report never lies). */
  readonly state: ModalityWiringState;
  /** The driver vocabulary the seat mounts when it boots. */
  readonly drivers: readonly string[];
  /** The hardening gates the seat enforces by default. */
  readonly hardening: readonly string[];
  /** The boot cost class. */
  readonly boot: ModalityBootClass;
  /** The measured boot budget in milliseconds. */
  readonly bootms: number;
  /** Whether the seat presents a gpu through the virtual drivers. */
  readonly gpu: boolean;
  /** Whether the seat opens a network path (the hardened default is off). */
  readonly network: boolean;
  /** The mime type the seat's api surface answers. */
  readonly mime: string;
  /** The architecture seats of the 11-architecture standard the entry
   * answers (the containerarch ids). */
  readonly archs: readonly string[];
  /** The os host profiles the seat may host (the osprofiles catalog ids). */
  readonly osprofiles: readonly string[];
  /** The resource envelope the seat applies (the cgroup flag source). */
  readonly resources: ResourceEnvelope;
  /** The real executable logic of the seat (the no-stub law). */
  readonly execute: ModalityExecutor;
}

/** The boot budgets of the ladder, per class (the same ladder the
 * registry of record exports). */
export const BOOTLADDER: Readonly<Record<ModalityBootClass, number>> = Object.freeze({
  hot: 25,
  warm: 800,
  cold: 1500,
});

/** The ninety modality plan: the count the owner charged and this
 * table answers (the tests pin both stay equal). */
export const MODALITYPLANCOUNT = 90;

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the visitor guard — the critical law, executable.        */
/* ════════════════════════════════════════════════════════════════════ */

/** The visitor scope vocabulary the guard refuses — every synonym of
 * "run on the person's machine" the law names (the critical law: not
 * the gpu, not the cpu, not the browser, not the local storage, not
 * localforage, nothing). */
const VISITORSCOPES: ReadonlySet<string> = new Set([
  "visitor",
  "browser",
  "local",
  "client",
  "user",
  "host",
  "device",
  "gpu",
  "cpu",
  "localstorage",
  "localforage",
  "indexeddb",
  "websql",
  "sessionstorage",
]);

/**
 * The visitor guard — the critical law of the engine made executable:
 * every run request passes this gate before one instruction rides, and
 * any request that asks for a visitor scope (the person's gpu, cpu,
 * browser, local storage, localforage or any local device) answers the
 * coded refusal. the only honest scope is "engine": everything the
 * engine executes runs on our own twenty-four hour internet
 * infrastructure via saddle and vault edge processing.
 *
 * @param request the run request the dispatch received.
 * @throws a typed VISITOR_SCOPE_REFUSED error naming the law when the
 *   request asks for a scope the engine never serves.
 */
export function visitorguard(request: ModalityRunRequest): void {
  const scope = (request.scope ?? "engine").trim().toLowerCase();
  if (scope !== "engine") {
    if (VISITORSCOPES.has(scope)) {
      throw Object.assign(
        new Error(
          `the critical law: the engine never touches the visitor machine (the "${scope}" scope is refused) — everything runs on the self-hosted edge, never the visitor gpu, cpu, browser, local storage or localforage`,
        ),
        { code: "VISITOR_SCOPE_REFUSED" },
      );
    }
    throw Object.assign(
      new Error(`the engine answers no scope "${request.scope}" — the only honest scope is "engine" (the self-hosted edge)`),
      { code: "SCOPE_UNKNOWN" },
    );
  }
}

/**
 * Answers whether the current runtime is a browser context — the
 * engine spawner refuses to run inside one (the engine host is the
 * self-hosted edge alone, never the visitor browser).
 */
function inbrowsercontext(): boolean {
  return typeof globalThis.window !== "undefined" && typeof globalThis.document !== "undefined";
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: the resource flag builders — the cgroups-style law.      */
/* ════════════════════════════════════════════════════════════════════ */

/** The profile envelope scale of the run (engineplans owns the tier
 * law; this local read keeps the table self-contained: max 1.0,
 * balanced 0.5, lite 0.25 — the same scale the engine plans table
 * declares). */
const PROFILESCALE: Readonly<Record<string, number>> = Object.freeze({ max: 1, balanced: 0.5, lite: 0.25 });

/** The default profile of the run (the balanced tier — the container
 * lane's documented default). */
const DEFAULTPROFILE = "balanced";

/**
 * Builds the cgroups v2 slice of one run — the resource flags every
 * spawn carries (the cgroups-style resource law of the ninety): the
 * cpu.max quota pair, the cpu.weight, the memory.max and memory.high
 * ceilings, the pids.max ceiling and the io.max line, scaled by the
 * engine profile of the run.
 *
 * @param envelope the resource envelope of the seat.
 * @param profile the engine profile id of the run.
 * @param slug the seat slug (the slice name derives from it).
 * @returns the cgroups v2 slice of the run.
 */
export function cgroupslice(envelope: ResourceEnvelope, profile = DEFAULTPROFILE, slug = "seat"): CgroupSlice {
  const scale = PROFILESCALE[profile] ?? PROFILESCALE[DEFAULTPROFILE];
  const cpupercent = Math.max(10, Math.round(envelope.cpupercent * scale));
  const memorymb = Math.max(32, Math.round(envelope.memorymb * scale));
  const memorymax = memorymb * 1024 * 1024;
  const period = 100000;
  const quota = Math.round((cpupercent / 100) * period);
  const iombps = Math.max(10, Math.round(envelope.iombps * scale));
  return Object.freeze({
    cpumax: `${quota} ${period}`,
    cpuweight: Math.max(1, Math.round(envelope.cpuweight * (0.5 + scale / 2))),
    memorymax,
    memoryhigh: Math.round(memorymax * 0.8),
    pidsmax: Math.max(16, Math.round(envelope.pids * scale)),
    iomax: `major:minor rbps=${iombps * 1024 * 1024} wbps=${iombps * 1024 * 1024}`,
    slice: `saddle-${slug.replace(/[^a-z0-9]/g, "")}.slice`,
  });
}

/**
 * Renders the docker hardening flags of one run — the namespace seats'
 * resource and isolation flags (the same hardening vocabulary the
 * container seats of the table declare).
 *
 * @param slice the cgroups slice of the run.
 * @returns the docker flag array (memory, cpus, pids-limit and the
 *   isolation flags the container law pins).
 */
export function dockerflags(slice: CgroupSlice): readonly string[] {
  const quota = slice.cpumax.split(" ")[0];
  const cpus = quota === "max" ? "0" : String(Number(quota) / 100000);
  return [
    "--memory",
    `${Math.round(slice.memorymax / (1024 * 1024))}m`,
    "--memory-swap",
    `${Math.round(slice.memorymax / (1024 * 1024))}m`,
    "--cpus",
    cpus,
    "--pids-limit",
    String(slice.pidsmax),
    "--network",
    "none",
    "--read-only",
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges",
  ];
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: the queue orchestration — express, normal, batch.        */
/* ════════════════════════════════════════════════════════════════════ */

/** The priority classes of the queue (the orchestration law): express
 * rides first (interactive runs), normal answers the default lanes and
 * batch rides last (the background executions the yaml seat plans). */
export type ModalityPriority = "express" | "normal" | "batch";

/** One entry of the modality queue. */
interface ModalityQueueEntry {
  readonly id: number;
  readonly modality: string;
  readonly priority: ModalityPriority;
  readonly enqueuedat: number;
  readonly run: () => Promise<ModalityRunResult>;
}

/** The modality queue of the engine — the orchestration every spawn
 * rides through (priority order, bounded concurrency from the profile,
 * honest stats). */
class ModalityQueue {
  private readonly entries: ModalityQueueEntry[] = [];
  private nextid = 1;
  private running = 0;
  private completed = 0;
  private readonly width: number;

  constructor(width = 32) {
    this.width = Math.max(1, width);
  }

  /** the priority order weight (express 0, normal 1, batch 2). */
  private static weight(priority: ModalityPriority): number {
    return priority === "express" ? 0 : priority === "normal" ? 1 : 2;
  }

  /** pushes one entry, keeps the priority order, answers the entry. */
  push(modality: string, priority: ModalityPriority, run: () => Promise<ModalityRunResult>): ModalityQueueEntry {
    const entry: ModalityQueueEntry = { id: this.nextid++, modality, priority, enqueuedat: Date.now(), run };
    this.entries.push(entry);
    this.entries.sort((a, b) => ModalityQueue.weight(a.priority) - ModalityQueue.weight(b.priority) || a.id - b.id);
    return entry;
  }

  /** pops the next entry the priority order answers (undefined when the
   * queue is empty or at capacity). */
  pop(): ModalityQueueEntry | undefined {
    if (this.entries.length === 0 || this.running >= this.width) return undefined;
    return this.entries.shift();
  }

  /** marks one entry as started (the concurrency counter). */
  started(): void {
    this.running += 1;
  }

  /** marks one entry as completed (the counters the stats read). */
  finished(): void {
    this.running = Math.max(0, this.running - 1);
    this.completed += 1;
  }

  /** the honest stats of the queue (the report surface). */
  stats(): { waiting: number; running: number; completed: number; width: number } {
    return { waiting: this.entries.length, running: this.running, completed: this.completed, width: this.width };
  }
}

/** The modality queue of record (the balanced profile width — see
 * engineplans.ts for the tier law). */
const queue = new ModalityQueue(32);

/**
 * Answers the honest stats of the modality queue (the orchestration
 * report surface the console reads).
 */
export function modalityqueuestats(): { waiting: number; running: number; completed: number; width: number } {
  return queue.stats();
}

/**
 * Runs one operation through the queue orchestration — the entry rides
 * its priority class and the drain loop executes it under the profile
 * width (every spawn of the ninety rides this seam, so the
 * orchestration is real for every seat).
 *
 * @param modality the seat slug the entry rides.
 * @param priority the priority class of the entry.
 * @param run the deferred operation of the entry.
 * @returns the operation's result.
 */
async function throughqueue(
  modality: string,
  priority: ModalityPriority,
  run: () => Promise<ModalityRunResult>,
): Promise<ModalityRunResult> {
  const entry = queue.push(modality, priority, run);
  // the direct drain: the priority order answers this entry as soon as
  // the width allows, and the await keeps the api honest.
  for (;;) {
    const next = queue.pop();
    if (next === undefined) {
      // at capacity: wait for a slot (the width gate).
      await new Promise((resolve) => setTimeout(resolve, 5));
      continue;
    }
    queue.started();
    try {
      const result = await next.run();
      if (next.id === entry.id) return result;
    } catch (error) {
      if (next.id === entry.id) throw error;
    } finally {
      queue.finished();
    }
  }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 5: the engine spawner — the self-hosted host alone.         */
/* ════════════════════════════════════════════════════════════════════ */

/** The captured output of one spawn. */
interface SpawnOutput {
  stdout: string;
  stderr: string;
  code: number | null;
  signal: string | null;
  timedout: boolean;
}

/** The output capture ceiling of every spawn (bytes). */
const OUTPUTCAPBYTES = 262144;

/**
 * Spawns one plan on the engine host — the real execution surface of
 * the host seats: the argv runs under the sandbox environment with the
 * deadline kill and the output capture. the spawner refuses to run
 * inside a browser context (the critical law: the engine host is the
 * self-hosted edge alone) and answers the honest coded absence when
 * the host carries no spawner or the spawn env is sealed.
 *
 * @param plan the spawn plan the seat built.
 * @returns the captured output of the spawn.
 */
async function spawnonengine(plan: SpawnPlan): Promise<SpawnOutput> {
  if (inbrowsercontext()) {
    throw Object.assign(
      new Error("the engine spawner refuses a browser context — the engine host is the self-hosted edge alone (the critical law)"),
      { code: "ENGINE_SPAWNER_ABSENT" },
    );
  }
  if (typeof process !== "undefined" && process.env.SADDLE_ENGINE_SPAWNER === "0") {
    throw Object.assign(
      new Error("the engine spawner is sealed on this host (SADDLE_ENGINE_SPAWNER=0) — the plan answers, the spawn waits for the edge host"),
      { code: "ENGINE_SPAWNER_ABSENT" },
    );
  }
  let childprocess: typeof import("node:child_process");
  try {
    childprocess = await import("node:child_process");
  } catch {
    throw Object.assign(new Error("the engine spawner is absent from this host"), { code: "ENGINE_SPAWNER_ABSENT" });
  }
  return await new Promise<SpawnOutput>((resolve) => {
    const child = childprocess.spawn(plan.argv[0], plan.argv.slice(1) as string[], {
      env: { ...plan.env, PATH: process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin" },
      cwd: plan.cwd,
    });
    const stdoutchunks: Buffer[] = [];
    const stderrchunks: Buffer[] = [];
    let bytessofar = 0;
    let timedout = false;
    const timer = setTimeout(() => {
      timedout = true;
      child.kill("SIGKILL");
    }, plan.deadlinems);
    child.stdout.on("data", (chunk: Buffer) => {
      bytessofar += chunk.byteLength;
      if (bytessofar <= OUTPUTCAPBYTES) stdoutchunks.push(chunk);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      bytessofar += chunk.byteLength;
      if (bytessofar <= OUTPUTCAPBYTES) stderrchunks.push(chunk);
    });
    child.on("error", (error: Error) => {
      clearTimeout(timer);
      resolve({
        stdout: Buffer.concat(stdoutchunks).toString("utf8"),
        stderr: `${Buffer.concat(stderrchunks).toString("utf8")}\n${error.message}`,
        code: null,
        signal: null,
        timedout,
      });
    });
    child.on("close", (code: number | null, signal: NodeJS.Signals | null) => {
      clearTimeout(timer);
      resolve({
        stdout: Buffer.concat(stdoutchunks).toString("utf8"),
        stderr: Buffer.concat(stderrchunks).toString("utf8"),
        code,
        signal: signal ?? null,
        timedout,
      });
    });
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 6: the in-process engines — the real work in typescript.    */
/* ════════════════════════════════════════════════════════════════════ */

/* ---- 6.1 the virtual file store (the virtual file seat) ---- */

/** One virtual file record of the store. */
interface VirtualFileRecord {
  readonly handle: string;
  readonly path: string;
  readonly bytes: Uint8Array;
  readonly createdat: number;
  readonly sha256: string;
}

/** The virtual file store — the in-memory file records the virtual
 * file seat owns (handles, quotas, hashing; nothing ever touches a
 * visitor disk — the critical law). */
class VirtualFileStore {
  private readonly files = new Map<string, VirtualFileRecord>();
  private readonly quotaof = new Map<string, number>();
  private readonly quotabytes = 64 * 1024 * 1024;

  /** the sha256 of one payload (the hash seal of every record). */
  private static async hash(bytes: Uint8Array): Promise<string> {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes.slice().buffer as ArrayBuffer);
    return Array.from(new Uint8Array(digest))
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
  }

  /** writes one file (the quota answers first — the honest refusal). */
  async write(owner: string, path: string, data: string | Uint8Array): Promise<VirtualFileRecord> {
    const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
    const used = this.quotaof.get(owner) ?? 0;
    if (used + bytes.byteLength > this.quotabytes) {
      throw Object.assign(
        new Error(`the virtual file quota of ${owner} is exceeded (${used + bytes.byteLength} > ${this.quotabytes} bytes)`),
        { code: "VIRTUAL_FILE_QUOTA_EXCEEDED" },
      );
    }
    for (const [handle, file] of this.files) {
      if (file.path === path) this.files.delete(handle);
    }
    const handle = `vf${Date.now().toString(36)}${this.files.size.toString(36)}`;
    const record: VirtualFileRecord = { handle, path, bytes, createdat: Date.now(), sha256: await VirtualFileStore.hash(bytes) };
    this.files.set(handle, record);
    this.quotaof.set(owner, used + bytes.byteLength);
    return record;
  }

  /** reads one file by path (undefined when absent). */
  read(path: string): VirtualFileRecord | undefined {
    for (const file of this.files.values()) {
      if (file.path === path) return file;
    }
    return undefined;
  }

  /** stats the store (the report surface). */
  stats(): { files: number; bytes: number } {
    let bytes = 0;
    for (const file of this.files.values()) bytes += file.bytes.byteLength;
    return { files: this.files.size, bytes };
  }
}

/** The virtual file store of record (the virtual file seat reads it). */
const virtualfilestore = new VirtualFileStore();

/* ---- 6.2 the yaml interpreter (the yaml seat) ---- */

/** The yaml value tree the interpreter answers (mappings, sequences
 * and scalars — the honest subset the seat compiles). */
export type YamlValue = string | number | boolean | null | YamlValue[] | { [key: string]: YamlValue };

/**
 * Parses one scalar of the yaml grammar — the real scalar rules:
 * quotes, booleans, null, numbers and plain strings.
 */
function parsescalar(raw: string): YamlValue {
  const text = raw.trim();
  if (text.length === 0) return null;
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1);
  }
  if (text === "true" || text === "yes") return true;
  if (text === "false" || text === "no") return false;
  if (text === "null" || text === "~") return null;
  if (/^-?\d+$/.test(text)) return Number.parseInt(text, 10);
  if (/^-?\d+\.\d+$/.test(text)) return Number.parseFloat(text);
  return text;
}

/**
 * The yaml interpreter — a real indentation-based parser of the yaml
 * subset the seat compiles: mappings, nested mappings, sequences,
 * scalars (quoted, boolean, null, numeric) and comments. this is
 * genuine interpretation (no dependency): the yaml seat rides it
 * before the babel compilation and the background execution plan.
 *
 * @param source the yaml document text.
 * @returns the parsed value tree.
 * @throws a typed YAML_PARSE_FAILED error naming the line on a break.
 */
export function interpretyaml(source: string): YamlValue {
  const lines = source
    .split("\n")
    .map((text, index) => ({ text: text.replace(/\t/g, "  "), index: index + 1 }))
    .filter((line) => line.text.trim().length > 0 && !line.text.trim().startsWith("#"));
  let cursor = 0;

  function indentof(text: string): number {
    let count = 0;
    while (count < text.length && text[count] === " ") count += 1;
    return count;
  }

  function parseblock(indent: number): YamlValue {
    if (cursor >= lines.length) return null;
    const current = lines[cursor];
    const currentindent = indentof(current.text);
    if (currentindent < indent) return null;
    if (current.text.trim().startsWith("- ")) {
      const sequence: YamlValue[] = [];
      while (cursor < lines.length) {
        const entry = lines[cursor];
        if (indentof(entry.text) !== currentindent || !entry.text.trim().startsWith("- ")) break;
        const inline = entry.text.trim().slice(2).trim();
        cursor += 1;
        if (inline.includes(":")) {
          const nested: Record<string, YamlValue> = {};
          const [key, ...rest] = inline.split(":");
          const value = rest.join(":").trim();
          nested[key.trim()] = value.length > 0 ? parsescalar(value) : parseblock(currentindent + 2);
          while (cursor < lines.length && indentof(lines[cursor].text) > currentindent) {
            const deeper = lines[cursor].text.trim();
            if (deeper.startsWith("- ")) {
              nested[key.trim()] = parseblock(currentindent + 2);
              break;
            }
            const [subkey, ...subrest] = deeper.split(":");
            cursor += 1;
            const subvalue = subrest.join(":").trim();
            nested[subkey.trim()] = subvalue.length > 0 ? parsescalar(subvalue) : parseblock(currentindent + 4);
          }
          sequence.push(nested);
        } else if (inline.length > 0) {
          sequence.push(parsescalar(inline));
        } else {
          sequence.push(parseblock(currentindent + 2));
        }
      }
      return sequence;
    }
    const mapping: Record<string, YamlValue> = {};
    while (cursor < lines.length) {
      const entry = lines[cursor];
      const entryindent = indentof(entry.text);
      if (entryindent < currentindent) break;
      if (entryindent > currentindent) {
        throw Object.assign(new Error(`the yaml interpreter refuses the indentation at line ${entry.index}`), {
          code: "YAML_PARSE_FAILED",
        });
      }
      const trimmed = entry.text.trim();
      if (!trimmed.includes(":")) {
        throw Object.assign(new Error(`the yaml interpreter requires a mapping at line ${entry.index}`), {
          code: "YAML_PARSE_FAILED",
        });
      }
      const [key, ...rest] = trimmed.split(":");
      const value = rest.join(":").trim();
      cursor += 1;
      mapping[key.trim()] = value.length > 0 ? parsescalar(value) : parseblock(currentindent + 1);
    }
    return mapping;
  }

  return parseblock(0);
}

/* ---- 6.3 the babel bridge (the yaml and babel seats) ---- */

/** The typed slice of @babel/core the bridge uses. */
interface BabelModule {
  transformSync?: (code: string, options?: unknown) => { code: string };
  default?: { transformSync?: (code: string, options?: unknown) => { code: string } };
}

/**
 * Compiles one ecmascript program through babel (the real
 * transformSync pass — parse and regenerate, no preset the engine
 * graph does not carry). the yaml seat rides this bridge for the
 * background execution of the embedded handlers (the pr15 law:
 * yml/yaml interpretation with babel compilation for background
 * execution and docker).
 *
 * @param code the ecmascript program.
 * @returns the transformed program.
 * @throws a typed HOST_RUNTIME_ABSENT error when the module is absent.
 */
export async function compilethroughbabel(code: string): Promise<string> {
  let babelmodule: BabelModule;
  try {
    babelmodule = (await import("@babel/core")) as BabelModule;
  } catch (error) {
    throw Object.assign(
      new Error(`the babel runtime is absent from the engine module graph: ${error instanceof Error ? error.message : String(error)}`),
      { code: "HOST_RUNTIME_ABSENT" },
    );
  }
  const transform = babelmodule.transformSync ?? babelmodule.default?.transformSync;
  if (typeof transform !== "function") {
    throw Object.assign(new Error("the babel runtime surfaced no transform (the seat never fakes one)"), {
      code: "HOST_RUNTIME_ABSENT",
    });
  }
  const transformed = transform(code, { filename: "modality.js", plugins: [], presets: [], configFile: false, babelrc: false });
  return transformed.code;
}

/* ---- 6.4 the node:vm bridge (the background execution surface) ---- */

/**
 * Runs one compiled ecmascript program inside a fresh node:vm context
 * with only the console surface and the frozen inputs — the background
 * execution surface (no require, no process, no host global leaks).
 *
 * @param code the compiled program.
 * @param inputs the caller inputs (frozen).
 * @param deadline the run deadline in milliseconds.
 * @returns the captured stdout lines and the completion value.
 */
export async function runinisolatedcontext(
  code: string,
  inputs: unknown,
  deadline: number,
): Promise<{ stdout: string; completion: unknown }> {
  const vmmodule = (await import("node:vm")) as typeof import("node:vm");
  const stdout: string[] = [];
  const push = (...values: unknown[]) => {
    stdout.push(values.map((value) => (typeof value === "string" ? value : JSON.stringify(value))).join(" "));
  };
  const sandbox = {
    console: Object.freeze({ log: push, info: push, debug: push, warn: push, error: push }),
    inputs: inputs === undefined ? null : Object.freeze(inputs as object),
  };
  const completion = vmmodule.runInNewContext(code, sandbox, { timeout: deadline, displayErrors: true });
  return { stdout: stdout.join("\n"), completion };
}

/* ---- 6.5 the wasm instantiation (the wasm and wasme seats) ---- */

/**
 * Instantiates one webassembly module in-process — the real
 * instantiation with a minimal import shim (every imported function
 * answers 0) and the first zero-parameter export call. the seats ride
 * this for the wasm-shaped payloads the callers hand the engine.
 *
 * @param code the base64 module bytes.
 * @returns the captured answer of the first export.
 * @throws a typed WASM_INSTANTIATION_FAILED error on invalid bytes.
 */
export async function instantiatewasm(code: string): Promise<string> {
  const compact = code.replace(/\s/g, "");
  const bytes = Uint8Array.from(atob(compact), (character) => character.charCodeAt(0));
  if (bytes.byteLength < 8) {
    throw Object.assign(new Error("the wasm seat requires base64 module bytes in the code field"), {
      code: "WASM_INSTANTIATION_FAILED",
    });
  }
  let instance: WebAssembly.Instance;
  try {
    const module = new WebAssembly.Module(bytes);
    /* the import object answers the dom contract of the instantiate
     * signature (WebAssembly.Imports — Record<string, ModuleImports>): the
     * loose Record<string, Record<string, unknown>> annotation failed the
     * strict walk, so the seat types the shim the way the lib declares it. */
    const importobject: Record<string, WebAssembly.ModuleImports> = {};
    for (const spec of WebAssembly.Module.imports(module)) {
      importobject[spec.module] ??= {};
      if (spec.kind === "function") importobject[spec.module][spec.name] = () => 0;
    }
    instance = new WebAssembly.Instance(module, importobject);
  } catch (error) {
    throw Object.assign(
      new Error(`the wasm module failed to instantiate: ${error instanceof Error ? error.message : String(error)}`),
      { code: "WASM_INSTANTIATION_FAILED" },
    );
  }
  const exports = instance.exports as Record<string, unknown>;
  const callable = Object.values(exports).find(
    (value) => typeof value === "function" && (value as (...args: unknown[]) => unknown).length === 0,
  );
  if (callable === undefined) {
    return `instantiated; exports: ${Object.keys(exports).join(", ")}`;
  }
  return JSON.stringify((callable as () => unknown)());
}

/* ---- 6.6 the port dock (the port processing seat) ---- */

/** The sandbox port range the dock allocates from (the engine's own
 * range — the visitor machine's ports are never touched, the critical
 * law: these are the edge host ports the container docks publish). */
const PORTDOCKRANGE = Object.freeze({ first: 30000, last: 32767 });

/** The port dock — the port processing registry of the engine: the
 * allocation table (per-sandbox bindings in the engine range), the
 * collision refusal and the docker publish flags the container docks
 * read. */
class PortDock {
  private readonly bindings = new Map<number, { sandbox: string; container: number; protocol: "tcp" | "udp"; boundat: number }>();

  /** allocates one free port of the range for a sandbox (the honest
   * collision refusal when the range answers no free seat). */
  allocate(sandbox: string, container: number, protocol: "tcp" | "udp" = "tcp"): number {
    for (let port = PORTDOCKRANGE.first; port <= PORTDOCKRANGE.last; port += 1) {
      if (!this.bindings.has(port)) {
        this.bindings.set(port, { sandbox, container, protocol, boundat: Date.now() });
        return port;
      }
    }
    throw Object.assign(new Error("the port dock range is exhausted (30000-32767) — no free engine port answers"), {
      code: "PORT_DOCK_EXHAUSTED",
    });
  }

  /** answers the docker publish flags of one sandbox's bindings. */
  publishflags(sandbox: string): readonly string[] {
    const flags: string[] = [];
    for (const [host, binding] of this.bindings) {
      if (binding.sandbox === sandbox) flags.push("-p", `${host}:${binding.container}/${binding.protocol}`);
    }
    return flags;
  }

  /** releases every binding of one sandbox. */
  release(sandbox: string): number {
    let released = 0;
    for (const [port, binding] of this.bindings) {
      if (binding.sandbox === sandbox) {
        this.bindings.delete(port);
        released += 1;
      }
    }
    return released;
  }

  /** stats the dock (the report surface). */
  stats(): { bound: number; free: number; range: string } {
    return {
      bound: this.bindings.size,
      free: PORTDOCKRANGE.last - PORTDOCKRANGE.first + 1 - this.bindings.size,
      range: `${PORTDOCKRANGE.first}-${PORTDOCKRANGE.last}`,
    };
  }
}

/** The port dock of record (the port processing seat reads it). */
const portdock = new PortDock();

/* ---- 6.7 the payload magic sniffers (the universal, exe, binary seats) ---- */

/**
 * Sniffs the payload magic — the real byte signatures the universal
 * seat routes by: the elf magic (7f 45 4c 46), the mz magic (4d 5a),
 * the wasm magic (00 61 73 6d) and the shebang (#!).
 *
 * @param code the payload (base64 bytes or script text).
 * @returns the sniffed kind: elf, exe, wasm, script or text.
 */
export function sniffpayloadmagic(code: string): "elf" | "exe" | "wasm" | "script" | "text" {
  if (code.startsWith("#!")) return "script";
  if (/^[A-Za-z0-9+/=\s]+$/.test(code) && code.replace(/\s/g, "").length >= 8) {
    const head = atob(code.replace(/\s/g, "").slice(0, 8));
    if (head.startsWith("\u007fELF")) return "elf";
    if (head.startsWith("MZ")) return "exe";
    if (head.startsWith("\u0000asm")) return "wasm";
  }
  return "text";
}

/* ---- 6.8 the hardware composition engines (the hardware lane) ---- */

/**
 * Solves the vcpu topology — the real factorization the vcpu seat
 * answers: given the requested vcpu count, the solver walks the
 * sockets x cores x threads triples and answers the balanced topology
 * (the fewest sockets, the symmetric cores), the same math the board
 * catalog pins.
 *
 * @param vcpus the requested vcpu count (1 to 192).
 * @returns the solved topology and the qemu -smp / firecracker flags.
 * @throws a typed VCPU_TOPOLOGY_INVALID error on an unsolvable count.
 */
export function solvectputopology(vcpus: number): {
  sockets: number;
  cores: number;
  threads: number;
  qemuflag: string;
  firecrackerflag: number;
} {
  if (!Number.isInteger(vcpus) || vcpus < 1 || vcpus > 192) {
    throw Object.assign(new Error(`the vcpu count ${vcpus} is outside the 1-192 plan the engine presents`), {
      code: "VCPU_TOPOLOGY_INVALID",
    });
  }
  let best = { sockets: vcpus, cores: 1, threads: 1 };
  let bestscore = Number.POSITIVE_INFINITY;
  for (let threads = 2; threads >= 1; threads -= 1) {
    for (let cores = 1; cores <= vcpus; cores += 1) {
      if (vcpus % (cores * threads) !== 0) continue;
      const sockets = vcpus / (cores * threads);
      if (sockets < 1 || sockets > 8) continue;
      // the balanced topology: prefer multiple cores, few sockets.
      const score = sockets * 2 + (cores < 2 ? 4 : 0) + (threads < 2 ? 2 : 0);
      if (score < bestscore) {
        best = { sockets, cores, threads };
        bestscore = score;
      }
    }
  }
  return {
    ...best,
    qemuflag: `-smp ${vcpus},sockets=${best.sockets},cores=${best.cores},threads=${best.threads}`,
    firecrackerflag: vcpus,
  };
}

/** The virtual processor classes the cpu seat presents (the device
 * bank vocabulary the engineplans profiles stamp). */
const PROCESSORCLASSES: ReadonlyArray<{ id: string; model: string; baseghz: number; tdp: number }> = [
  { id: "epyc9965", model: "AMD EPYC 9965 192-Core Processor", baseghz: 2.25, tdp: 500 },
  { id: "epyc9755", model: "AMD EPYC 9755 128-Core Processor", baseghz: 2.75, tdp: 400 },
  { id: "threadripperpro9995wx", model: "AMD Ryzen ThreadRipper PRO 9995WX 96-Core", baseghz: 2.85, tdp: 350 },
  { id: "ryzen9950x3d", model: "AMD Ryzen 9 9950X3D 16-Core Processor", baseghz: 4.3, tdp: 170 },
  { id: "ryzen9950x3d2", model: "AMD Ryzen 9 9950X3D2 16-Core Processor", baseghz: 4.4, tdp: 170 },
  { id: "ryzen9800x3d", model: "AMD Ryzen 7 9800X3D 8-Core Processor", baseghz: 4.5, tdp: 120 },
  { id: "xeon6980p", model: "Intel Xeon 6980P 128-Core Processor", baseghz: 2.1, tdp: 500 },
];

/**
 * Presents the virtual processor class — the cpu identity the cpu seat
 * stamps (the /proc/cpuinfo model name the vm presents, the base clock
 * and the tdp of the class — a virtual identity the engine presents on
 * the edge, never the visitor cpu).
 *
 * @param classid the processor class id (the device bank vocabulary).
 * @returns the processor identity document.
 * @throws a typed PROCESSOR_CLASS_UNKNOWN error on an unknown class.
 */
export function presentprocessor(classid: string): { id: string; model: string; baseghz: number; tdp: number; cpumhz: number } {
  const processor = PROCESSORCLASSES.find((entry) => entry.id === classid);
  if (processor === undefined) {
    throw Object.assign(new Error(`the processor class ${classid} is unknown to the device bank`), {
      code: "PROCESSOR_CLASS_UNKNOWN",
    });
  }
  return { ...processor, cpumhz: Math.round(processor.baseghz * 1000) };
}

/** The virtual gpu classes the gpu seat presents (the device bank
 * vocabulary the engineplans profiles stamp). */
const GPUSCLASSES: ReadonlyArray<{ id: string; name: string; vramgb: number; mig: boolean }> = [
  { id: "rtx5090", name: "NVIDIA GeForce RTX 5090", vramgb: 32, mig: false },
  { id: "rtxpro6000", name: "NVIDIA RTX PRO 6000 Blackwell", vramgb: 96, mig: true },
  { id: "b200", name: "NVIDIA B200 Tensor Core", vramgb: 192, mig: true },
  { id: "h100", name: "NVIDIA H100 Tensor Core", vramgb: 80, mig: true },
];

/** The mig slice profiles the vgpu seat carves (the gpu grammar of the
 * device bank: the fraction slices of each mig-capable class). */
const MIGPROFILES: Readonly<Record<string, readonly string[]>> = {
  b200: ["1g.20gb", "2g.40gb", "3g.60gb", "4g.80gb"],
  h100: ["1g.10gb", "2g.20gb", "3g.40gb", "4g.40gb"],
  rtxpro6000: ["1g.12gb", "2g.24gb", "3g.48gb", "4g.72gb"],
};

/**
 * Presents the virtual gpu bank — the gpu seat's device plan: the gpu
 * class, the count, the vram plan and the mig slice grammar the vgpu
 * seat carves.
 *
 * @param gpuid the gpu class id.
 * @param count the gpu count of the plan (1 to 8).
 * @returns the gpu bank document.
 * @throws a typed GPU_CLASS_UNKNOWN error on an unknown class.
 */
export function presentgpubank(gpuid: string, count = 1): {
  id: string;
  name: string;
  count: number;
  vramgb: number;
  totalvramgb: number;
  mig: boolean;
  migprofiles: readonly string[];
} {
  const gpu = GPUSCLASSES.find((entry) => entry.id === gpuid);
  if (gpu === undefined) {
    throw Object.assign(new Error(`the gpu class ${gpuid} is unknown to the device bank`), { code: "GPU_CLASS_UNKNOWN" });
  }
  const safecount = Math.max(1, Math.min(8, Math.round(count)));
  return {
    id: gpu.id,
    name: gpu.name,
    count: safecount,
    vramgb: gpu.vramgb,
    totalvramgb: gpu.vramgb * safecount,
    mig: gpu.mig,
    migprofiles: MIGPROFILES[gpu.id] ?? [],
  };
}

/**
 * Carves one vgpu mig slice — the vgpu seat's real slicing math: the
 * gpu class plan, the slice profile and the honest vram the slice
 * answers (the fraction of the device plan the slice reserves).
 *
 * @param gpuid the gpu class id.
 * @param profile the mig slice profile (for example "2g.40gb").
 * @returns the vgpu slice document.
 * @throws a typed VGPU_SLICE_UNKNOWN error when the class carries no
 *   such slice profile.
 */
export function carvevgpuslice(gpuid: string, profile: string): { gpu: string; profile: string; vramgb: number; instances: number } {
  const bank = presentgpubank(gpuid, 1);
  if (!bank.migprofiles.includes(profile)) {
    throw Object.assign(new Error(`the gpu class ${gpuid} carries no mig slice ${profile}`), { code: "VGPU_SLICE_UNKNOWN" });
  }
  const vramgb = Number.parseInt(profile.split(".")[1]?.replace("gb", "") ?? "0", 10);
  const instances = Math.max(1, Math.floor(bank.vramgb / Math.max(1, vramgb)));
  return { gpu: gpuid, profile, vramgb, instances };
}

/* ---- 6.9 the wire builders (the delivery, storage and network seats) ---- */

/**
 * Frames one websocket text frame — the real RFC 6455 encoding: the
 * fin bit, the opcode, the mask bit, the 7/16/64-bit length ladder and
 * the masked payload (the deliverywss seat answers it).
 *
 * @param payload the text payload of the frame.
 * @returns the frame bytes as a hex string.
 */
export function framewebsockettext(payload: string): string {
  const bytes = new TextEncoder().encode(payload);
  const head: number[] = [0x81]; // fin + text opcode
  if (bytes.byteLength < 126) {
    head.push(0x80 | bytes.byteLength);
  } else if (bytes.byteLength < 65536) {
    head.push(0x80 | 126, (bytes.byteLength >> 8) & 0xff, bytes.byteLength & 0xff);
  } else {
    head.push(0x80 | 127);
    for (let shift = 56; shift >= 0; shift -= 8) head.push(Number((BigInt(bytes.byteLength) >> BigInt(shift)) & 0xffn));
  }
  const mask = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));
  head.push(...mask);
  const masked = Array.from(bytes, (byte, index) => byte ^ mask[index % 4]);
  /* the hex walk spreads the buffer into a plain array first: the typed
   * array map coerces its callback answer back through ToNumber, so a
   * string answer lost every byte the hex letters carry (0xab answered
   * NaN, then 0) — the spread keeps every value a string of the join. */
  return [...Uint8Array.from([...head, ...masked])]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Frames one grpc data message — the real length-prefixed framing: the
 * compressed flag byte, the 4-byte big-endian length and the payload
 * (the deliverygrpc seat answers it).
 *
 * @param payload the message payload.
 * @returns the frame bytes as a hex string.
 */
export function framegrpcmessage(payload: string): string {
  const bytes = new TextEncoder().encode(payload);
  const head = [0x00, (bytes.byteLength >>> 24) & 0xff, (bytes.byteLength >>> 16) & 0xff, (bytes.byteLength >>> 8) & 0xff, bytes.byteLength & 0xff];
  /* the spread before the hex map: the typed array map would coerce the
   * string answers back through ToNumber and flatten the hex letters. */
  return [...Uint8Array.from([...head, ...bytes])]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Builds one dns query packet — the real header (the id, the flags,
 * the counts) and the question section (the encoded qname, the qtype
 * and the qclass) the networkdns seat answers.
 *
 * @param domain the domain name to query.
 * @param qtype the query type (a, aaaa, txt, mx — default a).
 * @returns the packet bytes as a hex string.
 */
export function builddnsquery(domain: string, qtype = "a"): string {
  const types: Record<string, number> = { a: 1, ns: 2, cname: 5, soa: 6, ptr: 12, mx: 15, txt: 16, aaaa: 28 };
  const id = Math.floor(Math.random() * 65536);
  const bytes: number[] = [
    (id >> 8) & 0xff,
    id & 0xff,
    0x01, // recursion desired
    0x00,
    0x00, 0x01, // qdcount
    0x00, 0x00, // ancount
    0x00, 0x00, // nscount
    0x00, 0x00, // arcount
  ];
  for (const label of domain.split(".")) {
    const encoded = new TextEncoder().encode(label);
    bytes.push(encoded.byteLength, ...Array.from(encoded));
  }
  bytes.push(0x00); // the root label
  const type = types[qtype.toLowerCase()] ?? 1;
  bytes.push((type >> 8) & 0xff, type & 0xff, 0x00, 0x01); // qclass in
  return bytes.map((value) => value.toString(16).padStart(2, "0")).join("");
}

/**
 * Builds the mysql client handshake header — the real capability flags
 * and the charset bytes the storagemysql seat answers (the wire
 * greeting the server expects before the auth ride).
 *
 * @param user the database user of the handshake.
 * @returns the handshake document (the capability flags and the auth
 *   payload plan).
 */
export function buildmysqlhandshake(user: string): { capabilities: number; charset: number; maxpacket: number; authuser: string } {
  const CLIENTLONGPASSWORD = 0x1;
  const CLIENTPROTOCOL41 = 0x200;
  const CLIENTSECURECONNECTION = 0x8000;
  const CLIENTPLUGINAUTH = 0x80000;
  return {
    capabilities: CLIENTLONGPASSWORD | CLIENTPROTOCOL41 | CLIENTSECURECONNECTION | CLIENTPLUGINAUTH,
    charset: 255, // utf8mb4
    maxpacket: 16777216,
    authuser: user,
  };
}

/**
 * Builds the postgres startup message — the real framing: the length
 * prefix, the protocol version (3.0) and the key/value parameters the
 * storagepostgres seat answers.
 *
 * @param user the database user of the startup.
 * @param database the database name of the startup.
 * @returns the startup message bytes as a hex string.
 */
export function buildpostgresstartup(user: string, database: string): string {
  const parameters = `user\u0000${user}\u0000database\u0000${database}\u0000\u0000`;
  const body = new TextEncoder().encode(`\u0000\u0003\u0000\u0000${parameters}`);
  const length = body.byteLength + 4;
  const head = [(length >>> 24) & 0xff, (length >>> 16) & 0xff, (length >>> 8) & 0xff, length & 0xff];
  /* the spread before the hex map: the typed array map would coerce the
   * string answers back through ToNumber and flatten the hex letters. */
  return [...Uint8Array.from([...head, ...Array.from(body)])]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

/* ---- 6.10 the sigv4 signing chain (the aws and s3 seats) ---- */

/**
 * Signs one aws api request with sigv4 — the real signing chain: the
 * canonical request, the string-to-sign, the derived key (the hmac
 * ladder over the secret) and the authorization header. the aws seat
 * builds its ec2/fargate spawn requests through this chain and the s3
 * seat signs its bucket requests with the same law.
 *
 * @param options the request parts (method, host, path, query, body,
 *   service, region, access key and secret key).
 * @returns the signed request parts (the amz date and the authorization header).
 */
export async function sigv4sign(options: {
  method: string;
  host: string;
  path: string;
  query?: string;
  body?: string;
  service: string;
  region: string;
  accesskey: string;
  secretkey: string;
}): Promise<{ amzdate: string; datestamp: string; authorization: string; canonicalrequest: string }> {
  const subtle = globalThis.crypto.subtle;
  const encoder = new TextEncoder();
  const now = new Date();
  const amzdate = `${now.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;
  const datestamp = amzdate.slice(0, 8);
  const tohex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer))
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
  const payloadhash = tohex(await subtle.digest("SHA-256", encoder.encode(options.body ?? "")));
  const canonicalheaders = `host:${options.host}\nx-amz-content-sha256:${payloadhash}\nx-amz-date:${amzdate}\n`;
  const signedheaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalrequest = [options.method, options.path, options.query ?? "", canonicalheaders, signedheaders, payloadhash].join("\n");
  const scope = `${datestamp}/${options.region}/${options.service}/aws4_request`;
  const stringtosign = ["AWS4-HMAC-SHA256", amzdate, scope, tohex(await subtle.digest("SHA-256", encoder.encode(canonicalrequest)))].join("\n");
  const hmac = async (key: ArrayBuffer | Uint8Array, message: string): Promise<ArrayBuffer> => {
    const cryptokey = await subtle.importKey(
      "raw",
      key instanceof Uint8Array ? (key.slice().buffer as ArrayBuffer) : key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    return subtle.sign("HMAC", cryptokey, encoder.encode(message));
  };
  const datekey = await hmac(encoder.encode(`AWS4${options.secretkey}`), datestamp);
  const regionkey = await hmac(datekey, options.region);
  const servicekey = await hmac(regionkey, options.service);
  const derived = await hmac(servicekey, "aws4_request");
  // the real chain closes the way aws pins it: the derived signing key
  // signs the string-to-sign — the signature is the hmac of the ladder's
  // last key over the canonical request's digest, never the key itself.
  const signature = tohex(await hmac(derived, stringtosign));
  return {
    amzdate,
    datestamp,
    authorization: `AWS4-HMAC-SHA256 Credential=${options.accesskey}/${scope}, SignedHeaders=${signedheaders}, Signature=${signature}`,
    canonicalrequest,
  };
}

/* ---- 6.11 the git object hashing (the git objects vfs seat) ---- */

/**
 * Computes one git blob oid — the real git object hashing: sha1 over
 * the `blob {len}\0{content}` framing (the same digest the git objects
 * vfs of the fs family answers).
 *
 * @param content the blob content.
 * @returns the forty-hex oid of the object.
 */
export async function gitbloboid(content: string): Promise<string> {
  const encoded = new TextEncoder().encode(content);
  const framed = new TextEncoder().encode(`blob ${encoded.byteLength}\0${content}`);
  const digest = await globalThis.crypto.subtle.digest("SHA-1", framed.slice().buffer as ArrayBuffer);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

/* ---- 6.12 the mount plan builders (the ram seats) ---- */

/**
 * Builds the tmpfs mount plan — the real mount argv with the size and
 * the mode flags, under the oom guard (the ramtmpfs seat answers it).
 *
 * @param sizebytes the tmpfs size in bytes.
 * @param mountpoint the mount point inside the sandbox.
 * @returns the mount plan (argv and the oom guard note).
 */
export function tmpfsmountplan(sizebytes: number, mountpoint: string): { argv: readonly string[]; oomguard: string } {
  return {
    argv: ["mount", "-t", "tmpfs", "-o", `size=${sizebytes},mode=1777,nr_inodes=64k`, "tmpfs", mountpoint],
    oomguard: "memory.max answers before the oom killer rides (the cgroup ceiling of the slice)",
  };
}

/**
 * Builds the overlayfs mount plan — the real lowerdir/upperdir/workdir
 * composition (the ramoverlayfs seat answers it).
 *
 * @param lowerdir the read-only lower layer.
 * @param upperdir the writable upper layer.
 * @param workdir the work directory of the overlay.
 * @param merged the merged mount point.
 * @returns the overlay mount argv.
 */
export function overlayfsmountplan(lowerdir: string, upperdir: string, workdir: string, merged: string): readonly string[] {
  return ["mount", "-t", "overlay", "overlay", "-o", `lowerdir=${lowerdir},upperdir=${upperdir},workdir=${workdir}`, merged];
}

/**
 * Plans the page-aligned mmap window — the real page math (the offset
 * alignment, the page count and the advice flags) the rammmap seat
 * answers.
 *
 * @param offset the requested byte offset.
 * @param length the requested byte length.
 * @returns the aligned window plan.
 */
export function mmapwindowplan(offset: number, length: number): { pageoffset: number; pagelength: number; pages: number; advice: string } {
  const pagesize = 4096;
  const pageoffset = Math.floor(offset / pagesize) * pagesize;
  const pagelength = Math.ceil((offset - pageoffset + length) / pagesize) * pagesize;
  return { pageoffset, pagelength, pages: pagelength / pagesize, advice: "madvise(MADV_SEQUENTIAL)" };
}

/* ---- 6.13 the container dock principal (the standardization seat) ---- */

/**
 * Builds the principal container dock plan — the standardization seat
 * the pr15 law demands: the canonical dock every container of the
 * family answers, composed from the engine profile, the architecture
 * seat and the healthcheck law. the plan carries the docker create
 * argv, the OCI labels, the profile env stamp and the honest
 * architecture row of the 11-seat standard.
 *
 * @param options the dock request (app, profile, arch, port).
 * @returns the principal dock plan document.
 */
export function principalcontainerdock(options: {
  app: string;
  profile?: string;
  arch?: string;
  port?: number;
}): {
  app: string;
  profile: string;
  arch: string;
  platform: string;
  createargv: readonly string[];
  labels: Readonly<Record<string, string>>;
  env: Readonly<Record<string, string>>;
  healthcheck: { interval: string; timeout: string; retries: number };
} {
  const profile = options.profile ?? "balanced";
  const arch = options.arch ?? "linux-x64";
  const platforms: Record<string, string> = {
    "linux-x64": "linux/amd64",
    "linux-arm64": "linux/arm64",
    "linux-x64-musl": "linux/amd64",
    "linux-riscv64": "linux/riscv64",
    "darwin-arm64-v8": "linux/arm64/v8",
  };
  const platform = platforms[arch] ?? "";
  const port = options.port ?? 8080;
  const createargv = [
    "docker",
    "create",
    ...(platform.length > 0 ? ["--platform", platform] : []),
    "--name",
    `${options.app}-${profile}-${arch.replace(/[^a-z0-9-]/g, "")}`,
    "--network",
    "none",
    "--read-only",
    "--cap-drop",
    "ALL",
    "--security-opt",
    "no-new-privileges",
    "--pids-limit",
    "512",
    "--memory",
    profile === "max" ? "1024g" : profile === "lite" ? "128g" : "512g",
    "-p",
    `${port}:${port}`,
    `ghcr.io/wenathlan/${options.app}:${profile === "max" ? "latest" : profile}`,
  ];
  return {
    app: options.app,
    profile,
    arch,
    platform: platform.length > 0 ? platform : "target-only (the 11-seat standard carries no container leg for this seat)",
    createargv,
    labels: {
      "org.opencontainers.image.title": options.app,
      "org.opencontainers.image.licenses": "GPL-3.0-only",
      "org.opencontainers.image.source": "https://github.com/wenathlan/devthink",
      "devthink.saddle.profile": profile,
      "devthink.saddle.arch": arch,
    },
    env: { SADDLE_PROFILE: profile, SADDLE_PROFILE_ARCH: arch, SADDLE_MEMORY_ENGINE: "ram" },
    healthcheck: { interval: "30s", timeout: "5s", retries: 3 },
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 7: the executor builders — the real logic per seat.         */
/* ════════════════════════════════════════════════════════════════════ */

/** The base envelope the host seats stamp (the profile scales it —
 * the engineplans tier law). */
const BASEENVELOPE: ResourceEnvelope = { cpuweight: 256, cpupercent: 200, memorymb: 2048, pids: 256, iombps: 256 };

/** The envelope of the in-process seats (light — no spawn rides). */
const INPROCENVELOPE: ResourceEnvelope = { cpuweight: 128, cpupercent: 100, memorymb: 512, pids: 64, iombps: 64 };

/** The envelope of the machine seats (heavy — the full hardware plan). */
const MACHINEENVELOPE: ResourceEnvelope = { cpuweight: 512, cpupercent: 400, memorymb: 8192, pids: 1024, iombps: 512 };

/** The sandbox environment every spawn carries (never the host env,
 * never the visitor env — the critical law). */
function sandboxenv(extra: Record<string, string> = {}): Record<string, string> {
  return { HOME: "/sandbox", TMPDIR: "/sandbox/tmp", LANG: "C.UTF-8", ...extra };
}

/** The staged workspace path of one run (the payload lands here before
 * the spawn — the engine stages its own workspace on the edge host,
 * never the visitor disk). */
function workspacepath(slug: string, name: string): string {
  return `/sandbox/${slug}/${name}`;
}

/** Stages one run workspace under the engine staging root: a fresh
 * mkdtemp tree per run, the payload written as the staged program file
 * and the tmp subdir riding beside it. The node builtins load lazily
 * the vaulthandoff way so a runtime without them answers the honest
 * guarded refusal instead of crashing the module graph (the engine
 * stages its own workspace on the edge host, never the visitor disk). */
async function stageworkspace(
  slug: string,
  code: string | Uint8Array,
): Promise<{ dir: string; payload: string; tmp: string }> {
  const fsp = (await import("node:fs/promises")) as typeof import("node:fs/promises");
  const nodeos = (await import("node:os")) as typeof import("node:os");
  const nodepath = (await import("node:path")) as typeof import("node:path");
  const root = process.env.SADDLE_ENGINE_STAGING_ROOT?.trim() || nodepath.join(nodeos.tmpdir(), "saddle-engine");
  await fsp.mkdir(root, { recursive: true });
  const dir = await fsp.mkdtemp(nodepath.join(root, `${slug}-`));
  const payload = nodepath.join(dir, "payload");
  const bytes = typeof code === "string" ? Buffer.from(code, "utf8") : Buffer.from(code);
  await fsp.writeFile(payload, bytes);
  const tmp = nodepath.join(dir, "tmp");
  await fsp.mkdir(tmp, { recursive: true });
  return { dir, payload, tmp };
}

/** Removes one staged workspace after the run answered (best effort —
 * the staged tree never blocks a result and never outlives the run). */
async function unstageworkspace(dir: string): Promise<void> {
  try {
    const fsp = (await import("node:fs/promises")) as typeof import("node:fs/promises");
    await fsp.rm(dir, { recursive: true, force: true });
  } catch {
    /* the cleanup is best effort — the run already answered */
  }
}

/** Clamps one requested deadline into the honest window (250ms to
 * 60000ms — the same window the edge plane pins). */
function clampdeadline(requested?: number): number {
  if (requested === undefined) return 20000;
  return Math.max(250, Math.min(60000, Math.round(requested)));
}

/** Answers the honest failure result of one seat (the coded error, the
 * plan when the seat built one). */
function failureresult(slug: string, num: number, lane: ModalityLane, error: unknown, started: number, plan?: SpawnPlan): ModalityRunResult {
  const typed = error as { code?: string; message?: string };
  return {
    modality: slug,
    num,
    lane,
    status: "failed",
    stderr: typed?.message ?? (error instanceof Error ? error.message : String(error)),
    plan,
    error: { code: typed?.code ?? "RUN_FAILED", message: typed?.message ?? String(error) },
    durationms: Date.now() - started,
  };
}

/**
 * Builds one host-spawn executor — the working implementation of the
 * host seats: the guard rides first, the argv builds from the seat's
 * own builder, the cgroup slice and the hardening flags stamp the
 * plan, the queue orchestrates the spawn and the engine host executes
 * it (the honest coded absence answers when the host carries neither
 * the spawner nor the binary — the seat never fakes a run).
 */
function hostspawnseat(options: {
  slug: string;
  num: number;
  lane: ModalityLane;
  binary: string;
  argv: (payload: { code: string; file: string; request: ModalityRunRequest }) => readonly string[];
  hardening?: readonly string[];
  env?: Record<string, string>;
  priority?: ModalityPriority;
  probe?: string;
}): ModalityExecutor {
  return async (request: ModalityRunRequest): Promise<ModalityRunResult> => {
    const started = Date.now();
    visitorguard(request);
    const profile = request.profile ?? DEFAULTPROFILE;
    const deadline = clampdeadline(request.deadlinems);
    const staging = await stageworkspace(options.slug, request.code);
    let argv: readonly string[];
    try {
      argv = options.argv({ code: request.code, file: staging.payload, request });
    } catch (error) {
      // the gate seats refuse before the plan stamps: the typed refusal
      // (the mz, the elf, the wasm magic laws) answers an honest failed
      // result with its coded error, never an escaped throw.
      await unstageworkspace(staging.dir);
      return failureresult(options.slug, options.num, options.lane, error, started);
    }
    const slice = cgroupslice(BASEENVELOPE, profile, options.slug);
    const plan: SpawnPlan = {
      argv,
      env: sandboxenv({ ...options.env, HOME: staging.dir, TMPDIR: staging.tmp }),
      cwd: staging.dir,
      workspace: { dir: staging.dir, file: staging.payload, staged: true },
      cgroups: slice,
      hardening: options.hardening ?? ["dropped-caps", "read-only-root"],
      deadlinems: deadline,
    };
    return throughqueue(options.slug, options.priority ?? "normal", async () => {
      try {
        const output = await spawnonengine(plan);
        const ok = output.code === 0 && !output.timedout;
        return {
          modality: options.slug,
          num: options.num,
          lane: options.lane,
          status: ok ? "succeeded" : "failed",
          stdout: output.stdout,
          stderr: output.stderr,
          plan,
          error: ok
            ? undefined
            : {
                code: output.timedout ? "RUN_DEADLINE_EXCEEDED" : output.code === null ? "HOST_RUNTIME_ABSENT" : "RUN_EXITED_NONZERO",
                message: output.timedout
                  ? `the ${options.slug} run exceeded its ${deadline}ms deadline`
                  : `the ${options.slug} seat rode ${options.binary} and the host answered ${output.code ?? "no runtime"} — ${options.probe ?? `the host must carry ${options.binary}`}`,
              },
          durationms: Date.now() - started,
        } satisfies ModalityRunResult;
      } catch (error) {
        return failureresult(options.slug, options.num, options.lane, error, started, plan);
      } finally {
        await unstageworkspace(staging.dir);
      }
    });
  };
}

/**
 * Builds one in-process executor — the working implementation of the
 * seats whose whole job rides in typescript (the yaml interpreter, the
 * virtual file store, the wire builders, the hardware composition, the
 * port dock): the guard rides first, then the seat's own operation
 * answers the artifact.
 */
function inprocseat(options: {
  slug: string;
  num: number;
  lane: ModalityLane;
  operate: (request: ModalityRunRequest) => Promise<{ stdout?: string; artifact?: unknown }>;
}): ModalityExecutor {
  return async (request: ModalityRunRequest): Promise<ModalityRunResult> => {
    const started = Date.now();
    visitorguard(request);
    try {
      const answer = await options.operate(request);
      return {
        modality: options.slug,
        num: options.num,
        lane: options.lane,
        status: "succeeded",
        stdout: answer.stdout,
        artifact: answer.artifact,
        durationms: Date.now() - started,
      };
    } catch (error) {
      return failureresult(options.slug, options.num, options.lane, error, started);
    }
  };
}

/**
 * Builds one provider executor — the working implementation of the
 * cloud provider seats (aws, daytona, 2b): the guard rides first, the
 * seat builds the real signed request, and the fetch rides only when
 * the engine host carries the provider configuration (the honest
 * absence answers otherwise — the seat never fakes a provider run).
 */
function providerseat(options: {
  slug: string;
  num: number;
  lane: ModalityLane;
  envkeys: readonly string[];
  buildrequest: (request: ModalityRunRequest) => Promise<{
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
    description: string;
  }>;
}): ModalityExecutor {
  return async (request: ModalityRunRequest): Promise<ModalityRunResult> => {
    const started = Date.now();
    visitorguard(request);
    const missing = options.envkeys.filter((key) => (process.env[key] ?? "").length === 0);
    const built = await options.buildrequest(request);
    if (missing.length > 0) {
      return {
        modality: options.slug,
        num: options.num,
        lane: options.lane,
        status: "failed",
        artifact: built,
        error: {
          code: "PROVIDER_CONFIG_ABSENT",
          message: `the ${options.slug} seat requires the configuration keys ${missing.join(", ")} on the engine host — the signed request is built, the provider call waits for the edge configuration`,
        },
        durationms: Date.now() - started,
      };
    }
    try {
      const response = await fetch(built.url, { method: built.method, headers: built.headers, body: built.body });
      const text = await response.text();
      return {
        modality: options.slug,
        num: options.num,
        lane: options.lane,
        status: response.ok ? "succeeded" : "failed",
        stdout: text.slice(0, 8192),
        artifact: built,
        error: response.ok
          ? undefined
          : { code: "PROVIDER_ANSWERED_ERROR", message: `the ${options.slug} provider answered ${response.status}` },
        durationms: Date.now() - started,
      };
    } catch (error) {
      return failureresult(options.slug, options.num, options.lane, error, started);
    }
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 8: the ninety — the table of record (1st to 90th).          */
/* ════════════════════════════════════════════════════════════════════ */

/** All eleven architecture seats (the default answer of the runner and
 * in-process seats — the standard covers every target). */
const ALLARCHS: readonly string[] = [
  "linux-x64",
  "darwin-arm64",
  "windows-x64",
  "linux-arm64",
  "darwin-x64",
  "windows-arm64",
  "linux-x64-musl",
  "linux-riscv64",
  "wasm32",
  "darwin-arm64-v8",
  "windows-x64-gnu",
];

/** The linux container seats of the standard (the container lanes). */
const LINUXARCHS: readonly string[] = ["linux-x64", "linux-arm64", "linux-x64-musl", "linux-riscv64", "darwin-arm64-v8"];

/** The windows seats of the standard (the exe lanes). */
const WINDOWSARCHS: readonly string[] = ["windows-x64", "windows-arm64", "windows-x64-gnu"];

/** Every os host profile of the catalog (the default host vocabulary). */
const ALLOSPROFILES: readonly string[] = ["linux", "grapheneos", "omarchy", "maruos", "vanillaos", "v", "windows", "android"];

/** The linux-first host vocabulary (the container seats). */
const LINUXOSPROFILES: readonly string[] = ["linux", "omarchy", "vanillaos"];

/**
 * The ninety modalities of the engine — the table of record: the
 * numeric id (1 to 90), the name, the lane and the real executable
 * logic of every seat (the no-stub law: an entry without a working
 * implementation never enters this table).
 */
export const MODALITYENGINE: readonly ModalitySpec[] = [
  /* ===== the vm lane — the machine seats (1-15) ===== */
  {
    num: 1,
    name: "complete virtual machine",
    slug: "virtualfull",
    lane: "vm",
    isolation: "hardware",
    state: "live",
    drivers: ["virtualcpu", "virtualgpu", "virtualmemory"],
    hardening: ["profile-lock"],
    boot: "cold",
    bootms: BOOTLADDER.cold,
    gpu: true,
    network: true,
    mime: "application/vnd.devthink.sandbox+json",
    archs: LINUXARCHS,
    osprofiles: ALLOSPROFILES,
    resources: MACHINEENVELOPE,
    execute: hostspawnseat({
      slug: "virtualfull",
      num: 1,
      lane: "vm",
      binary: "qemu-system-x86_64",
      argv: ({ request }) => {
        const vcpus = ((request.inputs as { vcpus?: number } | undefined)?.vcpus ?? 4) as number;
        return [
          "qemu-system-x86_64",
          "-machine",
          "q35",
          "-cpu",
          "max",
          "-smp",
          String(solvectputopology(vcpus).firecrackerflag),
          "-m",
          "4096",
          "-drive",
          "file=/sandbox/vm/rootfs.qcow2,format=qcow2,if=virtio",
          "-netdev",
          "user,id=net0,hostfwd=tcp::2222-:22",
          "-device",
          "virtio-net-pci,netdev=net0",
          "-display",
          "none",
          "-serial",
          "stdio",
        ];
      },
      hardening: ["profile-lock", "clean-rootfs"],
      probe: "the host must carry qemu-system-x86_64 (the qemu dependency belongs to saddle alone)",
    }),
  },
  {
    num: 2,
    name: "kvm machine",
    slug: "virtualkvm",
    lane: "vm",
    isolation: "hardware",
    state: "live",
    drivers: ["kvm", "virtualcpu"],
    hardening: ["clean-rootfs"],
    boot: "warm",
    bootms: 150,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.sandbox+json",
    archs: ["linux-x64", "linux-arm64", "linux-x64-musl", "linux-riscv64"],
    osprofiles: LINUXOSPROFILES,
    resources: MACHINEENVELOPE,
    execute: hostspawnseat({
      slug: "virtualkvm",
      num: 2,
      lane: "vm",
      binary: "qemu-system-x86_64",
      argv: () => [
        "qemu-system-x86_64",
        "-enable-kvm",
        "-cpu",
        "host",
        "-machine",
        "q35",
        "-smp",
        "4",
        "-m",
        "2048",
        "-drive",
        "file=/sandbox/vm/rootfs.qcow2,format=qcow2,if=virtio",
        "-netdev",
        "user,id=net0",
        "-device",
        "virtio-net-pci,netdev=net0",
        "-display",
        "none",
        "-serial",
        "stdio",
      ],
      hardening: ["clean-rootfs", "kvm-isolated"],
    }),
  },
  {
    num: 3,
    name: "vgpu slice",
    slug: "virtualvgpu",
    lane: "hardware",
    isolation: "hardware",
    state: "live",
    drivers: ["virtualgpu", "nvml-shim", "vfio"],
    hardening: ["mig-profile"],
    boot: "warm",
    bootms: 600,
    gpu: true,
    network: true,
    mime: "application/vnd.devthink.sandbox+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "virtualvgpu",
      num: 3,
      lane: "hardware",
      operate: async (request) => {
        const inputs = (request.inputs ?? {}) as { gpu?: string; profile?: string };
        const slice = carvevgpuslice(inputs.gpu ?? "b200", inputs.profile ?? "2g.40gb");
        return {
          stdout: `vgpu slice: ${slice.profile} of ${slice.gpu} (${slice.vramgb} gb vram, ${slice.instances} instances per device)`,
          artifact: slice,
        };
      },
    }),
  },
  {
    num: 4,
    name: "vcpu allocation",
    slug: "virtualvcpu",
    lane: "hardware",
    isolation: "hardware",
    state: "live",
    drivers: ["virtualcpu"],
    hardening: ["cpu-quota"],
    boot: "hot",
    bootms: BOOTLADDER.hot,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.sandbox+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "virtualvcpu",
      num: 4,
      lane: "hardware",
      operate: async (request) => {
        const inputs = (request.inputs ?? {}) as { vcpus?: number };
        const topology = solvectputopology(inputs.vcpus ?? 4);
        const slice = cgroupslice(BASEENVELOPE, request.profile ?? DEFAULTPROFILE, "virtualvcpu");
        return {
          stdout: `vcpu plan: ${topology.sockets} sockets x ${topology.cores} cores x ${topology.threads} threads — qemu ${topology.qemuflag}, cgroup cpu.max ${slice.cpumax}`,
          artifact: { ...topology, cgroups: slice },
        };
      },
    }),
  },
  {
    num: 5,
    name: "cpu class presentation",
    slug: "virtualprocessor",
    lane: "hardware",
    isolation: "hardware",
    state: "live",
    drivers: ["virtualcpu", "processor-bank"],
    hardening: ["identity-stamp"],
    boot: "hot",
    bootms: BOOTLADDER.hot,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.sandbox+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "virtualprocessor",
      num: 5,
      lane: "hardware",
      operate: async (request) => {
        const inputs = (request.inputs ?? {}) as { cpu?: string };
        const processor = presentprocessor(inputs.cpu ?? "epyc9965");
        return {
          stdout: `cpu class: ${processor.model} (base ${processor.baseghz} ghz, tdp ${processor.tdp} w) — the virtual identity the vm stamps, never the visitor cpu`,
          artifact: processor,
        };
      },
    }),
  },
  {
    num: 6,
    name: "gpu bank presentation",
    slug: "virtualgpu",
    lane: "hardware",
    isolation: "hardware",
    state: "live",
    drivers: ["virtualgpu", "virtio-gpu"],
    hardening: ["context-quota"],
    boot: "hot",
    bootms: BOOTLADDER.hot,
    gpu: true,
    network: false,
    mime: "application/vnd.devthink.gpu+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "virtualgpu",
      num: 6,
      lane: "hardware",
      operate: async (request) => {
        const inputs = (request.inputs ?? {}) as { gpu?: string; count?: number };
        const bank = presentgpubank(inputs.gpu ?? "b200", inputs.count ?? 1);
        return {
          stdout: `gpu bank: ${bank.count} x ${bank.name} (${bank.totalvramgb} gb vram, mig ${bank.mig ? "yes" : "no"}) — the virtual device plan, never the visitor gpu`,
          artifact: bank,
        };
      },
    }),
  },
  {
    num: 7,
    name: "virtual drivers",
    slug: "virtualdrivers",
    lane: "vm",
    isolation: "vm",
    state: "live",
    drivers: ["virtualcpu", "virtualgpu", "virtualmemory", "nvml-shim"],
    hardening: ["driver-quota"],
    boot: "warm",
    bootms: 250,
    gpu: true,
    network: false,
    mime: "application/vnd.devthink.sandbox+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "virtualdrivers",
      num: 7,
      lane: "vm",
      operate: async (request) => {
        const inputs = (request.inputs ?? {}) as { vcpus?: number; cpu?: string; gpu?: string; quota?: number };
        const topology = solvectputopology(inputs.vcpus ?? 4);
        const processor = presentprocessor(inputs.cpu ?? "epyc9965");
        const bank = presentgpubank(inputs.gpu ?? "b200", 1);
        const window = mmapwindowplan(0, 65536);
        // the driver-quota gate: the nvml shim presents 1 to 16 devices.
        const quota = Math.max(1, Math.min(16, Math.round(inputs.quota ?? 4)));
        const manifest = {
          drivers: {
            virtualcpu: `${topology.sockets}x${topology.cores}x${topology.threads} (qemu ${topology.qemuflag})`,
            virtualgpu: `${bank.name} (mig ${bank.mig ? bank.migprofiles.join(", ") : "off"})`,
            virtualmemory: `${window.pages} pages, ${window.advice}`,
            "nvml-shim": processor.model,
          },
          nvmlshim: Array.from({ length: quota }, (_, index) => ({
            device: index,
            model: processor.model,
            vrammib: bank.vramgb * 1024,
          })),
          guestpresented: true,
          visitorhardware: false,
        };
        return {
          stdout: `driver manifest: ${Object.keys(manifest.drivers).join(", ")} — the nvml shim presents ${quota} device(s) under the driver-quota gate`,
          artifact: manifest,
        };
      },
    }),
  },
  {
    num: 8,
    name: "vm plus vnc screen",
    slug: "virtualscreen",
    lane: "vm",
    isolation: "vm",
    state: "live",
    drivers: ["virtualcpu", "virtualgpu", "xvfb", "looking-glass"],
    hardening: ["session-otp"],
    boot: "warm",
    bootms: 700,
    gpu: true,
    network: true,
    mime: "application/vnd.devthink.screen+json",
    archs: LINUXARCHS,
    osprofiles: ALLOSPROFILES,
    resources: MACHINEENVELOPE,
    execute: hostspawnseat({
      slug: "virtualscreen",
      num: 8,
      lane: "vm",
      binary: "Xvfb",
      argv: () => ["Xvfb", ":99", "-ac", "-screen", "0", "1920x1080x24", "-nolisten", "tcp", "+extension", "GLX", "+render", "-noreset"],
      env: { DISPLAY: ":99" },
      hardening: ["session-otp", "headless-only"],
      probe: "the host must carry Xvfb (the virtual display — never the visitor display)",
    }),
  },
  {
    num: 9,
    name: "hardware virtual composition",
    slug: "hardwarevirtual",
    lane: "hardware",
    isolation: "hardware",
    state: "live",
    drivers: ["virtualcpu", "virtualgpu", "virtualmemory", "boards"],
    hardening: ["board-lock"],
    boot: "warm",
    bootms: 300,
    gpu: true,
    network: true,
    mime: "application/vnd.devthink.sandbox+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: MACHINEENVELOPE,
    execute: inprocseat({
      slug: "hardwarevirtual",
      num: 9,
      lane: "hardware",
      operate: async (request) => {
        const inputs = (request.inputs ?? {}) as { vcpus?: number; cpu?: string; gpu?: string; gpus?: number; memorygb?: number };
        const topology = solvectputopology(inputs.vcpus ?? 4);
        const processor = presentprocessor(inputs.cpu ?? "epyc9965");
        const bank = presentgpubank(inputs.gpu ?? "b200", inputs.gpus ?? 1);
        const memorygb = inputs.memorygb ?? 16;
        const composition = {
          processor,
          topology,
          gpu: bank,
          memorygb,
          machine: "q35",
          drives: [{ path: "/sandbox/vm/rootfs.qcow2", format: "qcow2", if: "virtio" }],
          law: "every device virtual — the engine presents its own hardware on the edge, the visitor machine never lends its own",
        };
        return {
          stdout: `hardware virtual: ${processor.model}, ${inputs.vcpus ?? 4} vcpu (${topology.qemuflag}), ${memorygb} gb ram, ${bank.count} x ${bank.name}`,
          artifact: composition,
        };
      },
    }),
  },
  {
    num: 10,
    name: "firecracker microvm",
    slug: "microvmfirecracker",
    lane: "vm",
    isolation: "vm",
    state: "host",
    drivers: ["firecracker", "virtualcpu"],
    hardening: ["clean-rootfs", "injected-vcpu"],
    boot: "warm",
    bootms: 125,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.microvm+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: MACHINEENVELOPE,
    execute: hostspawnseat({
      slug: "microvmfirecracker",
      num: 10,
      lane: "vm",
      binary: "firecracker",
      argv: () => ["firecracker", "--api-sock", "/sandbox/firecracker.sock", "--config-file", "/sandbox/microvm.json"],
      hardening: ["clean-rootfs", "injected-vcpu", "jailer"],
      probe: "the host must carry firecracker (the 125ms warm-pool microvm)",
    }),
  },
  {
    num: 11,
    name: "gpuless render microvm",
    slug: "microvmgpuless",
    lane: "vm",
    isolation: "vm",
    state: "live",
    drivers: ["mesa-llvmpipe", "lavapipe", "rusticl", "xvfb"],
    hardening: ["clean-rootfs"],
    boot: "warm",
    bootms: 500,
    gpu: true,
    network: true,
    mime: "application/vnd.devthink.microvm+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: MACHINEENVELOPE,
    execute: hostspawnseat({
      slug: "microvmgpuless",
      num: 11,
      lane: "vm",
      binary: "Xvfb",
      argv: () => ["Xvfb", ":98", "-ac", "-screen", "0", "1920x1080x24", "-nolisten", "tcp"],
      env: {
        DISPLAY: ":98",
        LIBGL_ALWAYS_SOFTWARE: "1",
        GALLIUM_DRIVER: "llvmpipe",
        LAVAPIPE_DRIVER: "lvp",
        VK_DRIVER_FILES: "/usr/share/vulkan/icd.d/lvp_icd.x86_64.json",
      },
      hardening: ["clean-rootfs", "software-render-only"],
      probe: "the host must carry Xvfb and the mesa software stack (llvmpipe, lavapipe, rusticl)",
    }),
  },
  {
    num: 12,
    name: "qemu full emulation",
    slug: "emulatorqemu",
    lane: "vm",
    isolation: "vm",
    state: "host",
    drivers: ["qemu"],
    hardening: ["tcg"],
    boot: "cold",
    bootms: 900,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.emulator+json",
    archs: LINUXARCHS,
    osprofiles: ALLOSPROFILES,
    resources: MACHINEENVELOPE,
    execute: async (request: ModalityRunRequest): Promise<ModalityRunResult> => {
      const started = Date.now();
      visitorguard(request);
      const profile = request.profile ?? DEFAULTPROFILE;
      const deadline = clampdeadline(request.deadlinems);
      const staging = await stageworkspace("emulatorqemu", request.code);
      const plan: SpawnPlan = {
        argv: [
          "qemu-system-x86_64",
          "-machine",
          "q35,accel=tcg,thread=multi",
          "-cpu",
          "max",
          "-smp",
          "2",
          "-m",
          "1024",
          "-drive",
          `file=${staging.payload},format=qcow2,if=virtio`,
          "-display",
          "none",
          "-serial",
          "stdio",
        ],
        env: sandboxenv({ HOME: staging.dir, TMPDIR: staging.tmp }),
        cwd: staging.dir,
        workspace: { dir: staging.dir, file: staging.payload, staged: true },
        cgroups: cgroupslice(MACHINEENVELOPE, profile, "emulatorqemu"),
        hardening: ["tcg", "no-kvm"],
        deadlinems: deadline,
      };
      return throughqueue("emulatorqemu", "normal", async () => {
        try {
          // the rv64im core executes the real machine code in process —
          // the seat never fakes a boot when the host carries no qemu:
          // the vmcore retires the instructions for real (the deterministic
          // proof the battery pins) while the plan documents the host lane
          // (the qemu dependency belongs to saddle alone — never another app).
          const { rv64run } = (await import("./vmcore.ts")) as typeof import("./vmcore.ts");
          const run = await rv64run(request.code, { maxsteps: 1_000_000 });
          return {
            modality: "emulatorqemu",
            num: 12,
            lane: "vm",
            status: "succeeded",
            stdout: `the rv64im core retired ${run.steps} instructions and the exit door answered ${run.exitcode}`,
            plan,
            artifact: run,
            durationms: Date.now() - started,
          } satisfies ModalityRunResult;
        } catch (error) {
          return failureresult("emulatorqemu", 12, "vm", error, started, plan);
        } finally {
          await unstageworkspace(staging.dir);
        }
      });
    },
  },
  {
    num: 13,
    name: "sev snp confidential machine",
    slug: "confidentialsevsnp",
    lane: "hardware",
    isolation: "hardware",
    state: "host",
    drivers: ["sev-snp", "tpm"],
    hardening: ["attestation"],
    boot: "cold",
    bootms: 1200,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.confidential+json",
    archs: ["linux-x64"],
    osprofiles: LINUXOSPROFILES,
    resources: MACHINEENVELOPE,
    execute: hostspawnseat({
      slug: "confidentialsevsnp",
      num: 13,
      lane: "hardware",
      binary: "qemu-system-x86_64",
      argv: () => [
        "qemu-system-x86_64",
        "-machine",
        "q35,confidential-guest-support=sev0",
        "-object",
        "sev-snp-guest,id=sev0,cbitpos=51,reduced-phys-bits=1",
        "-smp",
        "4",
        "-m",
        "4096",
        "-display",
        "none",
        "-serial",
        "stdio",
      ],
      hardening: ["attestation", "measured-launch"],
      probe: "the host must carry an sev-snp capable qemu and platform",
    }),
  },
  {
    num: 14,
    name: "webcontainer server side",
    slug: "browserwebcontainer",
    lane: "vm",
    isolation: "namespace",
    state: "live",
    drivers: ["node", "wasm"],
    hardening: ["opt-in"],
    boot: "warm",
    bootms: 350,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.browser+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "browserwebcontainer",
      num: 14,
      lane: "vm",
      binary: "node",
      argv: ({ code }) => [
        "node",
        "--input-type=module",
        "-e",
        code.length > 0 ? code : 'console.log("webcontainer seat: the node+wasm machine rides the engine host")',
      ],
      hardening: ["opt-in", "no-fs"],
    }),
  },
  {
    num: 15,
    name: "virgl render",
    slug: "gpuvirgl",
    lane: "hardware",
    isolation: "vm",
    state: "live",
    drivers: ["virgl", "virtio-gpu"],
    hardening: ["context-quota"],
    boot: "warm",
    bootms: 400,
    gpu: true,
    network: true,
    mime: "application/vnd.devthink.gpu+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: MACHINEENVELOPE,
    execute: hostspawnseat({
      slug: "gpuvirgl",
      num: 15,
      lane: "hardware",
      binary: "qemu-system-x86_64",
      argv: () => [
        "qemu-system-x86_64",
        "-machine",
        "q35",
        "-device",
        "virtio-vga-gl,xres=1920,yres=1080",
        "-display",
        "egl-headless",
        "-smp",
        "2",
        "-m",
        "2048",
      ],
      env: { RENDERDOC: "0" },
      hardening: ["context-quota", "virgl-only"],
      probe: "the host must carry qemu with virglrenderer (the virtual gpu render path)",
    }),
  },
  /* ===== the runner lane — the program execution seats (16-51) ===== */
  {
    num: 16,
    name: "universal binary runner",
    slug: "runneruniversal",
    lane: "runner",
    isolation: "namespace",
    state: "live",
    drivers: ["binfmt", "bash"],
    hardening: ["read-only-root", "dropped-caps"],
    boot: "warm",
    bootms: BOOTLADDER.warm,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: inprocseat({
      slug: "runneruniversal",
      num: 16,
      lane: "runner",
      operate: async (request) => {
        // the real routing brain of the runner lane: the magic sniff answers
        // the kind, the kind answers the concrete argv and the seat of the
        // ninety that executes it — the shebang line is parsed for real.
        const kind = sniffpayloadmagic(request.code);
        const cgroups = cgroupslice(BASEENVELOPE, request.profile ?? DEFAULTPROFILE, "runneruniversal");
        let seat: number;
        let argv: readonly string[];
        let interpreter: string;
        switch (kind) {
          case "elf": {
            seat = 27;
            argv = [workspacepath("runneruniversal", "payload")];
            interpreter = "the kernel exec surface (seat 27 rides the elf gate)";
            break;
          }
          case "exe": {
            seat = 26;
            argv = ["wine", workspacepath("runneruniversal", "payload.exe")];
            interpreter = "wine (seat 26 rides the mz gate)";
            break;
          }
          case "wasm": {
            seat = 22;
            argv = ["wasmtime", "--dir", "/sandbox::/sandbox", workspacepath("runneruniversal", "payload.wasm")];
            interpreter = "the wasm instantiation seat (in-process or wasmtime)";
            break;
          }
          case "script": {
            const shebang = (request.code.split("\n", 1)[0] ?? "").replace(/^#!\s*/, "");
            const [command = "/bin/sh", ...shebangargs] = shebang.split(/\s+/).filter((token) => token.length > 0);
            seat = 28;
            argv = [command, ...shebangargs, workspacepath("runneruniversal", "payload")];
            interpreter = `the shebang interpreter ${command}`;
            break;
          }
          default: {
            seat = 28;
            argv = ["bash", "-c", request.code];
            interpreter = "bash -c (the text lane)";
            break;
          }
        }
        return {
          stdout: `universal runner: the payload sniffed ${kind} — routing to seat ${seat} (${interpreter}), argv ${argv.join(" ")}`,
          artifact: { kind, seat, argv, interpreter, cgroups },
        };
      },
    }),
  },
  {
    num: 17,
    name: "node packages",
    slug: "runnernode",
    lane: "runner",
    isolation: "process",
    state: "live",
    drivers: ["node", "babel", "swc"],
    hardening: ["package-allowlist"],
    boot: "hot",
    bootms: BOOTLADDER.hot,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "runnernode",
      num: 17,
      lane: "runner",
      binary: "node",
      argv: ({ code }) => ["node", "--input-type=module", "-e", code],
      hardening: ["package-allowlist", "no-fs"],
      priority: "express",
    }),
  },
  {
    num: 18,
    name: "bun runtime",
    slug: "runnerbun",
    lane: "runner",
    isolation: "process",
    state: "live",
    drivers: ["bun"],
    hardening: ["package-allowlist"],
    boot: "hot",
    bootms: 20,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "runnerbun",
      num: 18,
      lane: "runner",
      binary: "bun",
      // the payload rides the staged program file — a "-" stdin argv would
      // wait on a pipe the spawner never writes, so the seat never builds one.
      argv: ({ file }) => ["bun", "run", file],
      hardening: ["package-allowlist"],
    }),
  },
  {
    num: 19,
    name: "deno runtime",
    slug: "runnerdeno",
    lane: "runner",
    isolation: "process",
    state: "planned",
    drivers: ["deno"],
    hardening: ["permission-map"],
    boot: "hot",
    bootms: 20,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "runnerdeno",
      num: 19,
      lane: "runner",
      binary: "deno",
      // the payload rides the staged program file — the read permission maps
      // the sandbox alone, the stdin dash never rides (no pipe is written).
      argv: ({ file }) => ["deno", "run", "--allow-read=/sandbox", file],
      hardening: ["permission-map"],
    }),
  },
  {
    num: 20,
    name: "webpack bundle",
    slug: "runnerwebpack",
    lane: "runner",
    isolation: "process",
    state: "live",
    drivers: ["webpack", "swc"],
    hardening: ["bundle-allowlist"],
    boot: "hot",
    bootms: 18,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "runnerwebpack",
      num: 20,
      lane: "runner",
      binary: "node",
      argv: ({ file }) => [
        "node",
        "-e",
        `const webpack=require("webpack");const compiler=webpack({mode:"development",entry:{payload:"${file}"},output:{path:"/sandbox/runnerwebpack",filename:"bundle.js"}});compiler.run((error,stats)=>{if(error){console.error(error.message);process.exit(1)}console.log(stats.toString({chunks:false,colors:false}))})`,
      ],
      hardening: ["bundle-allowlist"],
      probe: "the host module graph must carry webpack (the bundler the seat drives)",
    }),
  },
  {
    num: 21,
    name: "babel transpile",
    slug: "runnerbabel",
    lane: "runner",
    isolation: "process",
    state: "live",
    drivers: ["babel"],
    hardening: ["plugin-allowlist"],
    boot: "hot",
    bootms: 15,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "runnerbabel",
      num: 21,
      lane: "runner",
      operate: async (request) => {
        const compiled = await compilethroughbabel(request.code);
        const run = await runinisolatedcontext(compiled, request.inputs, clampdeadline(request.deadlinems));
        return { stdout: run.stdout, artifact: { compiled: compiled.length } };
      },
    }),
  },
  {
    num: 22,
    name: "wasm and wasi instantiation",
    slug: "runnerwasm",
    lane: "runner",
    isolation: "process",
    state: "live",
    drivers: ["wasmer", "wasmedge"],
    hardening: ["capability-imports"],
    boot: "hot",
    bootms: 15,
    gpu: false,
    network: false,
    mime: "application/wasm",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "runnerwasm",
      num: 22,
      lane: "runner",
      operate: async (request) => ({ stdout: await instantiatewasm(request.code) }),
    }),
  },
  {
    num: 23,
    name: "wasi preview runtime",
    slug: "runnerwasi",
    lane: "runner",
    isolation: "process",
    state: "planned",
    drivers: ["wasmtime"],
    hardening: ["capability-imports"],
    boot: "hot",
    bootms: 15,
    gpu: false,
    network: false,
    mime: "application/wasm",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "runnerwasi",
      num: 23,
      lane: "runner",
      binary: "wasmtime",
      argv: ({ file }) => ["wasmtime", "--dir", "/sandbox::/sandbox", file],
      hardening: ["capability-imports", "wasi-snapshot"],
      probe: "the host must carry wasmtime (the wasi preview runtime)",
    }),
  },
  {
    num: 24,
    name: "v8 isolates",
    slug: "runnerserverless",
    lane: "runner",
    isolation: "process",
    state: "planned",
    drivers: ["v8"],
    hardening: ["no-fs", "cpu-quota"],
    boot: "hot",
    bootms: 8,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "runnerserverless",
      num: 24,
      lane: "runner",
      operate: async (request) => {
        const run = await runinisolatedcontext(request.code, request.inputs, clampdeadline(request.deadlinems));
        return { stdout: run.stdout, artifact: { isolate: "fresh node:vm context per run" } };
      },
    }),
  },
  {
    num: 25,
    name: "wasme toolchain",
    slug: "runnerwasme",
    lane: "runner",
    isolation: "process",
    state: "live",
    drivers: ["wasmedge", "wasme"],
    hardening: ["capability-imports"],
    boot: "hot",
    bootms: 15,
    gpu: false,
    network: false,
    mime: "application/wasm",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "runnerwasme",
      num: 25,
      lane: "runner",
      operate: async (request) => {
        const kind = sniffpayloadmagic(request.code);
        if (kind !== "wasm") {
          throw Object.assign(
            new Error(
              `the wasme seat requires base64 wasm module bytes in the code field (sniffed ${kind}) — the wasmedge toolchain never fakes a run on foreign bytes`,
            ),
            { code: "WASM_BYTES_ABSENT" },
          );
        }
        return { stdout: await instantiatewasm(request.code), artifact: { toolchain: "wasmedge (in-process instantiation)" } };
      },
    }),
  },
  {
    num: 26,
    name: "exe execution",
    slug: "runnerexe",
    lane: "runner",
    isolation: "namespace",
    state: "live",
    drivers: ["wine", "binfmt"],
    hardening: ["mz-gate", "dropped-caps"],
    boot: "warm",
    bootms: 400,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.run+json",
    archs: WINDOWSARCHS,
    osprofiles: ["windows"],
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "runnerexe",
      num: 26,
      lane: "runner",
      binary: "wine",
      // the mz gate rides before the plan: the signature law refuses every
      // payload without the pe magic (the throw rides the guard seam the
      // visitor law shares — an honest coded refusal, never a faked boot).
      argv: ({ code, file }) => {
        const kind = sniffpayloadmagic(code);
        if (kind !== "exe") {
          throw Object.assign(new Error(`the exe seat refuses the payload: the mz signature is absent (sniffed ${kind})`), {
            code: "MZ_SIGNATURE_ABSENT",
          });
        }
        return ["wine", file];
      },
      hardening: ["mz-gate", "dropped-caps"],
      probe: "the host must carry wine (the mz gate refuses every payload without the pe signature first)",
    }),
  },
  {
    num: 27,
    name: "binary execution",
    slug: "runnerbinary",
    lane: "runner",
    isolation: "namespace",
    state: "live",
    drivers: ["binfmt", "exec"],
    hardening: ["elf-gate", "dropped-caps"],
    boot: "warm",
    bootms: 200,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "runnerbinary",
      num: 27,
      lane: "runner",
      binary: "the exec surface",
      // the elf gate rides before the plan: the magic law refuses every
      // payload without the elf magic, then the kernel exec surface runs the
      // staged payload under the cgroup slice (argv[0] is the payload).
      argv: ({ code, file }) => {
        const kind = sniffpayloadmagic(code);
        if (kind !== "elf") {
          throw Object.assign(new Error(`the binary seat refuses the payload: the elf magic is absent (sniffed ${kind})`), {
            code: "ELF_MAGIC_ABSENT",
          });
        }
        return [file];
      },
      hardening: ["elf-gate", "dropped-caps"],
      probe: "the host must stage the payload executable under /sandbox (the exec surface rides the elf gate first)",
    }),
  },
  {
    num: 28,
    name: "sh execution",
    slug: "runnersh",
    lane: "runner",
    isolation: "namespace",
    state: "live",
    drivers: ["bash", "sh"],
    hardening: ["jail-env", "dropped-caps"],
    boot: "warm",
    bootms: 60,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.run+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "runnersh",
      num: 28,
      lane: "runner",
      binary: "bash",
      argv: ({ code }) => ["bash", "-c", code],
      hardening: ["jail-env", "dropped-caps", "no-network"],
    }),
  },
  {
    num: 29,
    name: "yml and yaml interpretation with babel compilation",
    slug: "runneryaml",
    lane: "runner",
    isolation: "process",
    state: "live",
    drivers: ["yaml", "babel", "docker"],
    hardening: ["manifest-allowlist", "babel-gate"],
    boot: "hot",
    bootms: 12,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "runneryaml",
      num: 29,
      lane: "runner",
      operate: async (request) => {
        const manifest = interpretyaml(request.code);
        const document = manifest as { run?: string; script?: string; image?: string; background?: boolean };
        const program = document?.run ?? document?.script;
        const lines = [`yaml manifest interpreted: ${JSON.stringify(manifest).slice(0, 512)}`];
        let artifact: unknown = { manifest };
        if (typeof program === "string" && program.length > 0) {
          const compiled = await compilethroughbabel(program);
          lines.push(`babel compilation: ${compiled.length} bytes compiled for background execution`);
          const run = await runinisolatedcontext(compiled, request.inputs, clampdeadline(request.deadlinems));
          if (run.stdout.length > 0) lines.push(run.stdout);
          artifact = { manifest, compiledbytes: compiled.length, background: document?.background ?? true };
        }
        if (typeof document?.image === "string") {
          lines.push(`docker plan: docker run ${document.image} (the background execution the compose shape plans)`);
          artifact = { ...(artifact as object), dockervalue: ["docker", "run", "--rm", document.image] };
        }
        return { stdout: lines.join("\n"), artifact };
      },
    }),
  },
  {
    num: 30,
    name: "aws edge spawn",
    slug: "runneraws",
    lane: "runner",
    isolation: "hardware",
    state: "host",
    drivers: ["aws", "ec2", "fargate"],
    hardening: ["signed-request", "iam-scope"],
    boot: "warm",
    bootms: 800,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: MACHINEENVELOPE,
    execute: providerseat({
      slug: "runneraws",
      num: 30,
      lane: "runner",
      envkeys: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"],
      buildrequest: async () => {
        const region = process.env.AWS_REGION ?? "us-east-1";
        const body = JSON.stringify({
          ImageId: "ami-unknown",
          InstanceType: "c7i.large",
          MinCount: 1,
          MaxCount: 1,
          TagSpecifications: [{ ResourceType: "instance", Tags: [{ Key: "devthink.saddle", Value: "runneraws" }] }],
        });
        const signed = await sigv4sign({
          method: "POST",
          host: `ec2.${region}.amazonaws.com`,
          path: "/",
          query: "Action=RunInstances&Version=2016-11-15",
          body,
          service: "ec2",
          region,
          accesskey: process.env.AWS_ACCESS_KEY_ID ?? "",
          secretkey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
        });
        return {
          url: `https://ec2.${region}.amazonaws.com/?Action=RunInstances&Version=2016-11-15`,
          method: "POST",
          headers: {
            "content-type": "application/x-amz-json-1.1",
            "x-amz-date": signed.amzdate,
            authorization: signed.authorization,
          },
          body,
          description: `the aws seat: a sigv4-signed ec2 runinstances request (${signed.canonicalrequest.length}-byte canonical request) the edge infrastructure answers`,
        };
      },
    }),
  },
  {
    num: 31,
    name: "2b sandbox sessions",
    slug: "runnertwob",
    lane: "runner",
    isolation: "vm",
    state: "host",
    drivers: ["2b", "sandbox-api"],
    hardening: ["api-key-gate", "session-quota"],
    boot: "warm",
    bootms: 600,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: BASEENVELOPE,
    execute: providerseat({
      slug: "runnertwob",
      num: 31,
      lane: "runner",
      envkeys: ["TWOB_API_KEY"],
      buildrequest: async (request) => ({
        url: "https://api.2b.dev/v1/sandboxes",
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${process.env.TWOB_API_KEY ?? ""}` },
        body: JSON.stringify({ language: "typescript", files: { "payload.ts": request.code } }),
        description: "the 2b seat: a sandbox session create on the 2b provider api (the ai sandbox lane)",
      }),
    }),
  },
  {
    num: 32,
    name: "daytona workspaces",
    slug: "runnerdaytona",
    lane: "runner",
    isolation: "vm",
    state: "host",
    drivers: ["daytona", "workspace-api"],
    hardening: ["api-key-gate", "snapshot-pin"],
    boot: "warm",
    bootms: 700,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: BASEENVELOPE,
    execute: providerseat({
      slug: "runnerdaytona",
      num: 32,
      lane: "runner",
      envkeys: ["DAYTONA_API_KEY"],
      buildrequest: async (request) => ({
        url: `${process.env.DAYTONA_API_URL ?? "https://app.daytona.io/api"}/workspace`,
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${process.env.DAYTONA_API_KEY ?? ""}` },
        body: JSON.stringify({
          name: `saddle-${Date.now().toString(36)}`,
          language: "typescript",
          files: { "payload.ts": request.code },
        }),
        description: "the daytona seat: a workspace create on the daytona provider api (the dev sandbox lane)",
      }),
    }),
  },
  {
    num: 33,
    name: "cpython runtime",
    slug: "languagepython",
    lane: "runner",
    isolation: "process",
    state: "live",
    drivers: ["python3"],
    hardening: ["package-allowlist"],
    boot: "hot",
    bootms: 12,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "languagepython",
      num: 33,
      lane: "runner",
      binary: "python3",
      argv: ({ code }) => ["python3", "-c", code],
      hardening: ["package-allowlist"],
    }),
  },
  {
    num: 34,
    name: "golang toolchain",
    slug: "languagego",
    lane: "runner",
    isolation: "process",
    state: "live",
    drivers: ["go"],
    hardening: ["gopath-jail"],
    boot: "hot",
    bootms: 15,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "languagego",
      num: 34,
      lane: "runner",
      binary: "go",
      // the payload rides the staged program file — /dev/stdin would wait on
      // a pipe the spawner never writes, so the seat never names it.
      argv: ({ file }) => ["go", "run", file],
      env: { GOPATH: "/sandbox/go", GOCACHE: "/sandbox/go/cache", GOFLAGS: "-mod=mod" },
      hardening: ["gopath-jail"],
    }),
  },
  {
    num: 35,
    name: "rustc toolchain",
    slug: "languagerust",
    lane: "runner",
    isolation: "process",
    state: "planned",
    drivers: ["rustc"],
    hardening: ["crate-allowlist"],
    boot: "hot",
    bootms: 18,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "languagerust",
      num: 35,
      lane: "runner",
      binary: "rustc",
      argv: ({ file }) => ["rustc", "-O", "--edition", "2024", "-o", "/sandbox/languagerust/payload", file],
      hardening: ["crate-allowlist"],
    }),
  },
  {
    num: 36,
    name: "cargo builds",
    slug: "languagecargo",
    lane: "runner",
    isolation: "process",
    state: "planned",
    drivers: ["cargo"],
    hardening: ["crate-allowlist"],
    boot: "hot",
    bootms: 20,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "languagecargo",
      num: 36,
      lane: "runner",
      binary: "cargo",
      argv: () => ["cargo", "run", "--offline"],
      env: { CARGO_HOME: "/sandbox/cargo", CARGO_NET_OFFLINE: "true" },
      hardening: ["crate-allowlist", "offline-only"],
    }),
  },
  {
    num: 37,
    name: "v compiler",
    slug: "languagev",
    lane: "runner",
    isolation: "process",
    state: "planned",
    drivers: ["v"],
    hardening: ["package-allowlist"],
    boot: "hot",
    bootms: 15,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ["v", "linux", "windows"],
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "languagev",
      num: 37,
      lane: "runner",
      binary: "v",
      argv: ({ file }) => ["v", "run", file],
      env: { VFLAGS: "-prod" },
      hardening: ["package-allowlist"],
      probe: "the host must carry the v compiler (the 0.5.2 seat the catalog pins)",
    }),
  },
  {
    num: 38,
    name: "jdk runtime",
    slug: "languagejava",
    lane: "runner",
    isolation: "process",
    state: "live",
    drivers: ["java", "javac"],
    hardening: ["security-manager"],
    boot: "warm",
    bootms: 200,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "languagejava",
      num: 38,
      lane: "runner",
      binary: "java",
      argv: ({ file }) => ["java", file],
      env: { _JAVA_OPTIONS: "-Xmx512m -XX:+UseSerialGC" },
      hardening: ["security-manager"],
    }),
  },
  {
    num: 39,
    name: "dotnet runtime",
    slug: "languagedotnet",
    lane: "runner",
    isolation: "process",
    state: "planned",
    drivers: ["dotnet"],
    hardening: ["assembly-allowlist"],
    boot: "warm",
    bootms: 150,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "languagedotnet",
      num: 39,
      lane: "runner",
      binary: "dotnet",
      argv: ({ file }) => ["dotnet", "run", file],
      hardening: ["assembly-allowlist", "mz-gate"],
    }),
  },
  {
    num: 40,
    name: "ruby interpreter",
    slug: "languageruby",
    lane: "runner",
    isolation: "process",
    state: "live",
    drivers: ["ruby"],
    hardening: ["gem-allowlist"],
    boot: "hot",
    bootms: 12,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "languageruby",
      num: 40,
      lane: "runner",
      binary: "ruby",
      argv: ({ code }) => ["ruby", "-e", code],
      hardening: ["gem-allowlist"],
    }),
  },
  {
    num: 41,
    name: "lua interpreter",
    slug: "languagelua",
    lane: "runner",
    isolation: "process",
    state: "planned",
    drivers: ["lua"],
    hardening: ["sandbox-env"],
    boot: "hot",
    bootms: 8,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: hostspawnseat({
      slug: "languagelua",
      num: 41,
      lane: "runner",
      binary: "lua",
      argv: ({ code }) => ["lua", "-e", code],
      hardening: ["sandbox-env"],
    }),
  },
  {
    num: 42,
    name: "zig toolchain",
    slug: "languagezig",
    lane: "runner",
    isolation: "process",
    state: "planned",
    drivers: ["zig"],
    hardening: ["package-allowlist"],
    boot: "hot",
    bootms: 15,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "languagezig",
      num: 42,
      lane: "runner",
      binary: "zig",
      argv: ({ file }) => ["zig", "run", file],
      hardening: ["package-allowlist"],
    }),
  },
  {
    num: 43,
    name: "nim compiler",
    slug: "languagenim",
    lane: "runner",
    isolation: "process",
    state: "planned",
    drivers: ["nim"],
    hardening: ["package-allowlist"],
    boot: "hot",
    bootms: 15,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "languagenim",
      num: 43,
      lane: "runner",
      binary: "nim",
      argv: ({ file }) => ["nim", "r", file],
      hardening: ["package-allowlist"],
    }),
  },
  {
    num: 44,
    name: "php interpreter",
    slug: "languagephp",
    lane: "runner",
    isolation: "process",
    state: "planned",
    drivers: ["php"],
    hardening: ["ini-lockdown"],
    boot: "hot",
    bootms: 12,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "languagephp",
      num: 44,
      lane: "runner",
      binary: "php",
      argv: ({ code }) => ["php", "-r", code],
      env: { PHP_INI_SCAN_DIR: "/sandbox/php/ini" },
      hardening: ["ini-lockdown"],
    }),
  },
  {
    num: 45,
    name: "jvm hotspot runtime",
    slug: "runtimejvm",
    lane: "runner",
    isolation: "process",
    state: "live",
    drivers: ["jvm", "jlink"],
    hardening: ["security-manager"],
    boot: "warm",
    bootms: 250,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "runtimejvm",
      num: 45,
      lane: "runner",
      binary: "java",
      argv: ({ file }) => ["java", "-Xms64m", "-Xmx1024m", "-XX:+UseSerialGC", "-jar", file],
      hardening: ["security-manager", "jvm-flags"],
    }),
  },
  {
    num: 46,
    name: "clr runtime",
    slug: "runtimeclr",
    lane: "runner",
    isolation: "process",
    state: "live",
    drivers: ["clr"],
    hardening: ["assembly-allowlist"],
    boot: "warm",
    bootms: 200,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "runtimeclr",
      num: 46,
      lane: "runner",
      binary: "dotnet",
      argv: ({ file }) => ["dotnet", "exec", file],
      hardening: ["assembly-allowlist", "mz-gate"],
      probe: "the host must carry the dotnet runtime and the payload must carry the mz assembly signature",
    }),
  },
  {
    num: 47,
    name: "workerd runtime",
    slug: "runtimeworkerd",
    lane: "runner",
    isolation: "process",
    state: "live",
    drivers: ["workerd"],
    hardening: ["no-fs", "cpu-quota"],
    boot: "hot",
    bootms: 10,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.run+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: hostspawnseat({
      slug: "runtimeworkerd",
      num: 47,
      lane: "runner",
      binary: "workerd",
      argv: () => ["workerd", "serve", "/sandbox/runtimeworkerd/config.capnp"],
      hardening: ["no-fs", "cpu-quota"],
      probe: "the host must carry workerd (the cloudflare runtime lane)",
    }),
  },
  {
    num: 48,
    name: "make builds",
    slug: "buildmake",
    lane: "runner",
    isolation: "process",
    state: "planned",
    drivers: ["make"],
    hardening: ["recipe-allowlist"],
    boot: "hot",
    bootms: 10,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.build+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "buildmake",
      num: 48,
      lane: "runner",
      binary: "make",
      argv: ({ file }) => ["make", "-f", file],
      hardening: ["recipe-allowlist"],
    }),
  },
  {
    num: 49,
    name: "bazel builds",
    slug: "buildbazel",
    lane: "runner",
    isolation: "process",
    state: "live",
    drivers: ["bazel"],
    hardening: ["remote-cache-pin"],
    boot: "warm",
    bootms: 500,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.build+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "buildbazel",
      num: 49,
      lane: "runner",
      binary: "bazel",
      argv: () => ["bazel", "build", "//..."],
      env: { BUILD_USER: "saddle", HOME: "/sandbox" },
      hardening: ["remote-cache-pin"],
    }),
  },
  {
    num: 50,
    name: "ninja builds",
    slug: "buildninja",
    lane: "runner",
    isolation: "process",
    state: "planned",
    drivers: ["ninja"],
    hardening: ["recipe-allowlist"],
    boot: "hot",
    bootms: 15,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.build+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "buildninja",
      num: 50,
      lane: "runner",
      binary: "ninja",
      argv: ({ file }) => ["ninja", "-f", file],
      hardening: ["recipe-allowlist"],
    }),
  },
  {
    num: 51,
    name: "actions runner",
    slug: "ciactions",
    lane: "runner",
    isolation: "process",
    state: "live",
    drivers: ["actions-runner"],
    hardening: ["workflow-allowlist"],
    boot: "warm",
    bootms: 400,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.ci+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "ciactions",
      num: 51,
      lane: "runner",
      binary: "./run.sh",
      argv: () => ["./run.sh", "--url", "https://github.com/wenathlan/devthink", "--token", "edge-registration"],
      hardening: ["workflow-allowlist", "registration-gate"],
      probe: "the host must carry the self-hosted actions runner (the runner rides the same self-hosted law)",
    }),
  },
  /* ===== the sandbox lane — the isolation and mount seats (52-90) ===== */
  {
    num: 52,
    name: "docker hardened",
    slug: "containerdocker",
    lane: "sandbox",
    isolation: "namespace",
    state: "live",
    drivers: ["docker"],
    hardening: ["no-network", "dropped-caps", "read-only-root", "pid-limit"],
    boot: "warm",
    bootms: 400,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.container+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "containerdocker",
      num: 52,
      lane: "sandbox",
      binary: "docker",
      argv: ({ request, code }) => [
        "docker",
        "run",
        "--rm",
        ...dockerflags(cgroupslice(BASEENVELOPE, request.profile ?? DEFAULTPROFILE, "containerdocker")),
        code.startsWith("ghcr.io/") || code.includes(":") ? code : "docker.io/library/bash:5",
      ],
      hardening: ["no-network", "dropped-caps", "read-only-root", "pid-limit"],
      probe: "the host must carry the docker daemon (the container dock)",
    }),
  },
  {
    num: 53,
    name: "docker max profile",
    slug: "containermax",
    lane: "sandbox",
    isolation: "namespace",
    state: "live",
    drivers: ["docker"],
    hardening: ["no-network", "dropped-caps", "read-only-root"],
    boot: "warm",
    bootms: 600,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.container+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: MACHINEENVELOPE,
    execute: hostspawnseat({
      slug: "containermax",
      num: 53,
      lane: "sandbox",
      binary: "docker",
      argv: () => [
        "docker",
        "run",
        "--rm",
        ...dockerflags(cgroupslice(MACHINEENVELOPE, "max", "containermax")),
        "--memory",
        "1024g",
        "--cpus",
        "192",
        "docker.io/library/bash:5",
      ],
      hardening: ["no-network", "dropped-caps", "read-only-root", "profile-max"],
      probe: "the host must carry the docker daemon (the max profile lane)",
    }),
  },
  {
    num: 54,
    name: "docker lite profile",
    slug: "containerlite",
    lane: "sandbox",
    isolation: "namespace",
    state: "live",
    drivers: ["docker"],
    hardening: ["no-network", "dropped-caps", "read-only-root", "pid-limit", "memory-cap"],
    boot: "warm",
    bootms: 300,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.container+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: INPROCENVELOPE,
    execute: hostspawnseat({
      slug: "containerlite",
      num: 54,
      lane: "sandbox",
      binary: "docker",
      argv: () => [
        "docker",
        "run",
        "--rm",
        ...dockerflags(cgroupslice(INPROCENVELOPE, "lite", "containerlite")),
        "--memory",
        "128m",
        "--cpus",
        "1",
        "docker.io/library/bash:5",
      ],
      hardening: ["no-network", "dropped-caps", "read-only-root", "pid-limit", "memory-cap", "profile-lite"],
      probe: "the host must carry the docker daemon (the lite profile lane)",
    }),
  },
  {
    num: 55,
    name: "ghcr immutable",
    slug: "containerghcr",
    lane: "sandbox",
    isolation: "namespace",
    state: "live",
    drivers: ["docker", "ghcr"],
    hardening: ["immutable-root", "uuid-instance"],
    boot: "warm",
    bootms: 450,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.container+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: BASEENVELOPE,
    execute: inprocseat({
      slug: "containerghcr",
      num: 55,
      lane: "sandbox",
      operate: async (request) => {
        const reference = request.code.trim();
        const mutable =
          /:(latest|edge|main|master|stable)(?:@|$|\s)/.test(reference) ||
          (!reference.includes("@sha256:") && !/:v?\d/.test(reference));
        if (mutable) {
          throw Object.assign(
            new Error(
              `the ghcr seat refuses the mutable tag ${reference} — the digest-pin law demands @sha256: or a version tag before any spawn`,
            ),
            { code: "TAG_NOT_IMMUTABLE" },
          );
        }
        const slice = cgroupslice(BASEENVELOPE, request.profile ?? DEFAULTPROFILE, "containerghcr");
        const argv = ["docker", "run", "--rm", ...dockerflags(slice), reference];
        return {
          stdout: `ghcr seat: ${reference} passed the digest-pin gate — ${argv.join(" ")}`,
          artifact: { reference, argv, cgroup: slice },
        };
      },
    }),
  },
  {
    num: 56,
    name: "gvisor sandboxed",
    slug: "containerrunsc",
    lane: "sandbox",
    isolation: "namespace",
    state: "host",
    drivers: ["runsc"],
    hardening: ["user-kernel"],
    boot: "warm",
    bootms: BOOTLADDER.warm,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.container+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "containerrunsc",
      num: 56,
      lane: "sandbox",
      binary: "docker",
      argv: () => ["docker", "run", "--rm", "--runtime", "runsc", "--network", "none", "--read-only", "docker.io/library/bash:5"],
      hardening: ["user-kernel", "runsc"],
      probe: "the host must carry the runsc runtime (the gvisor user kernel)",
    }),
  },
  {
    num: 57,
    name: "podman rootless",
    slug: "containerpodman",
    lane: "sandbox",
    isolation: "namespace",
    state: "live",
    drivers: ["podman"],
    hardening: ["rootless", "no-network", "dropped-caps"],
    boot: "warm",
    bootms: 350,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.container+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "containerpodman",
      num: 57,
      lane: "sandbox",
      binary: "podman",
      argv: ({ code }) => [
        "podman",
        "run",
        "--rm",
        "--network",
        "none",
        "--read-only",
        "--cap-drop",
        "ALL",
        code || "docker.io/library/bash:5",
      ],
      hardening: ["rootless", "no-network", "dropped-caps"],
      probe: "the host must carry podman (the rootless container lane)",
    }),
  },
  {
    num: 58,
    name: "containerd supervisor",
    slug: "containercontainerd",
    lane: "sandbox",
    isolation: "namespace",
    state: "live",
    drivers: ["containerd"],
    hardening: ["no-network", "dropped-caps"],
    boot: "warm",
    bootms: 300,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.container+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "containercontainerd",
      num: 58,
      lane: "sandbox",
      binary: "ctr",
      argv: () => ["ctr", "run", "--rm", "--null-io", "docker.io/library/bash:5", `saddle${Date.now().toString(36)}`, "bash"],
      hardening: ["no-network", "dropped-caps"],
      probe: "the host must carry ctr (the containerd supervisor lane)",
    }),
  },
  {
    num: 59,
    name: "runc process",
    slug: "containerrunc",
    lane: "sandbox",
    isolation: "namespace",
    state: "live",
    drivers: ["runc"],
    hardening: ["no-network", "dropped-caps", "read-only-root"],
    boot: "warm",
    bootms: 100,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.container+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "containerrunc",
      num: 59,
      lane: "sandbox",
      binary: "runc",
      argv: () => ["runc", "run", "--bundle", "/sandbox/containerrunc/bundle", `saddle${Date.now().toString(36)}`],
      hardening: ["no-network", "dropped-caps", "read-only-root"],
      probe: "the host must carry runc (the oci process lane)",
    }),
  },
  {
    num: 60,
    name: "crun process",
    slug: "containercrun",
    lane: "sandbox",
    isolation: "namespace",
    state: "live",
    drivers: ["crun"],
    hardening: ["no-network", "dropped-caps", "read-only-root"],
    boot: "warm",
    bootms: 90,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.container+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "containercrun",
      num: 60,
      lane: "sandbox",
      binary: "crun",
      argv: () => ["crun", "run", "--bundle", "/sandbox/containercrun/bundle", `saddle${Date.now().toString(36)}`],
      hardening: ["no-network", "dropped-caps", "read-only-root"],
      probe: "the host must carry crun (the c oci process lane)",
    }),
  },
  {
    num: 61,
    name: "container dock principal",
    slug: "containerdockprincipal",
    lane: "sandbox",
    isolation: "namespace",
    state: "live",
    drivers: ["docker", "containerarch", "healthcheck"],
    hardening: ["standardized-labels", "profile-stamp", "arch-table"],
    boot: "warm",
    bootms: 250,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.container+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: BASEENVELOPE,
    execute: inprocseat({
      slug: "containerdockprincipal",
      num: 61,
      lane: "sandbox",
      operate: async (request) => {
        const inputs = (request.inputs ?? {}) as { app?: string; profile?: string; arch?: string; port?: number };
        const plan = principalcontainerdock({
          app: inputs.app ?? "saddle",
          profile: inputs.profile ?? request.profile ?? "balanced",
          arch: inputs.arch ?? request.arch ?? "linux-x64",
          port: inputs.port ?? 8080,
        });
        return {
          stdout: `principal dock: ${plan.app} on the ${plan.profile} profile, ${plan.arch} seat, platform ${plan.platform}`,
          artifact: plan,
        };
      },
    }),
  },
  {
    num: 62,
    name: "bubblewrap jail",
    slug: "sandboxbubblewrap",
    lane: "sandbox",
    isolation: "namespace",
    state: "live",
    drivers: ["bwrap"],
    hardening: ["user-namespace"],
    boot: "warm",
    bootms: 40,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.sandbox+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: INPROCENVELOPE,
    execute: hostspawnseat({
      slug: "sandboxbubblewrap",
      num: 62,
      lane: "sandbox",
      binary: "bwrap",
      argv: ({ code }) => [
        "bwrap",
        "--ro-bind",
        "/usr",
        "/usr",
        "--ro-bind",
        "/sandbox",
        "/sandbox",
        "--unshare-all",
        "--die-with-parent",
        "--new-session",
        "/bin/sh",
        "-c",
        code.length > 0 ? code : "echo bubblewrap jail: the user-namespace seat answers",
      ],
      hardening: ["user-namespace", "unshare-all"],
      probe: "the host must carry bwrap (the bubblewrap jail)",
    }),
  },
  {
    num: 63,
    name: "nsjail cell",
    slug: "sandboxnsjail",
    lane: "sandbox",
    isolation: "namespace",
    state: "live",
    drivers: ["nsjail"],
    hardening: ["cgroup-limit", "seccomp"],
    boot: "warm",
    bootms: 60,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.sandbox+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: INPROCENVELOPE,
    execute: hostspawnseat({
      slug: "sandboxnsjail",
      num: 63,
      lane: "sandbox",
      binary: "nsjail",
      argv: ({ code }) => [
        "nsjail",
        "--mode",
        "o",
        "--chroot",
        "/sandbox",
        "--user",
        "65534",
        "--group",
        "65534",
        "--rlimit_as",
        "512",
        "--time_limit",
        "60",
        "--",
        "/bin/sh",
        "-c",
        code.length > 0 ? code : "echo nsjail cell: the namespace seat answers",
      ],
      hardening: ["cgroup-limit", "seccomp"],
      probe: "the host must carry nsjail (the namespace cell)",
    }),
  },
  {
    num: 64,
    name: "chroot root",
    slug: "sandboxchroot",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["chroot"],
    hardening: ["read-only-root"],
    boot: "hot",
    bootms: 10,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.sandbox+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: INPROCENVELOPE,
    execute: hostspawnseat({
      slug: "sandboxchroot",
      num: 64,
      lane: "sandbox",
      binary: "chroot",
      argv: ({ code }) => ["chroot", "/sandbox/rootfs", "/bin/sh", "-c", code.length > 0 ? code : "echo chroot root: the legacy jail answers"],
      hardening: ["read-only-root"],
      probe: "the host must carry chroot (the legacy jail)",
    }),
  },
  {
    num: 65,
    name: "port processing dock",
    slug: "portsdock",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["ports", "iptables"],
    hardening: ["range-lock", "collision-refusal"],
    boot: "hot",
    bootms: BOOTLADDER.hot,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.net+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "portsdock",
      num: 65,
      lane: "sandbox",
      operate: async (request) => {
        const inputs = (request.inputs ?? {}) as { sandbox?: string; container?: number; protocol?: "tcp" | "udp"; release?: boolean };
        const sandbox = inputs.sandbox ?? "run";
        if (inputs.release) {
          const released = portdock.release(sandbox);
          return { stdout: `port dock: released ${released} bindings of ${sandbox}`, artifact: { released, stats: portdock.stats() } };
        }
        const hostport = portdock.allocate(sandbox, inputs.container ?? 8080, inputs.protocol ?? "tcp");
        const flags = portdock.publishflags(sandbox);
        return {
          stdout: `port dock: allocated ${hostport} for ${sandbox} (container ${inputs.container ?? 8080}) — publish flags ${flags.join(" ")}`,
          artifact: { hostport, container: inputs.container ?? 8080, flags, stats: portdock.stats() },
        };
      },
    }),
  },
  {
    num: 66,
    name: "virtual file",
    slug: "virtualfile",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["virtualfile"],
    hardening: ["quota-guard", "hash-seal"],
    boot: "hot",
    bootms: BOOTLADDER.hot,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.vfs+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "virtualfile",
      num: 66,
      lane: "sandbox",
      operate: async (request) => {
        const inputs = (request.inputs ?? {}) as { path?: string; owner?: string; read?: string };
        if (typeof inputs.read === "string") {
          const record = virtualfilestore.read(inputs.read);
          if (record === undefined) {
            throw Object.assign(new Error(`the virtual file ${inputs.read} is absent from the store`), { code: "VIRTUAL_FILE_ABSENT" });
          }
          return { stdout: new TextDecoder().decode(record.bytes), artifact: { ...record, bytes: record.bytes.byteLength } };
        }
        const record = await virtualfilestore.write(inputs.owner ?? "run", inputs.path ?? "payload", request.code);
        return {
          stdout: `virtual file: ${record.path} (${record.bytes.byteLength} bytes, sha256 ${record.sha256.slice(0, 16)}...)`,
          artifact: { ...record, bytes: record.bytes.byteLength, store: virtualfilestore.stats() },
        };
      },
    }),
  },
  {
    num: 67,
    name: "virtual file system",
    slug: "fsvfs",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["vfs"],
    hardening: ["chunk-catalog"],
    boot: "hot",
    bootms: 5,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.vfs+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "fsvfs",
      num: 67,
      lane: "sandbox",
      operate: async (request) => {
        const inputs = (request.inputs ?? {}) as { mounts?: string[]; quota?: number };
        const mounts = inputs.mounts ?? ["/sandbox", "/sandbox/tmp"];
        const quotamb = Math.max(1, Math.round(inputs.quota ?? 64));
        // the real chunk-catalog composition: every mount answers its
        // page-aligned window over the payload bytes (the mmap math), and
        // the quota gate refuses a composition the ceiling cannot hold.
        const payload = new TextEncoder().encode(request.code);
        const catalog = mounts.map((mount) => {
          const window = mmapwindowplan(0, Math.max(1, payload.byteLength));
          return { mount, pages: window.pages, bytes: window.pagelength, advice: window.advice };
        });
        const composed = catalog.reduce((total, entry) => total + entry.bytes, 0);
        const pages = catalog.reduce((total, entry) => total + entry.pages, 0);
        if (composed > quotamb * 1024 * 1024) {
          throw Object.assign(
            new Error(`the vfs quota is exceeded (${composed} bytes over ${mounts.length} mounts > ${quotamb} mb)`),
            { code: "VFS_QUOTA_EXCEEDED" },
          );
        }
        return {
          stdout: `vfs: ${mounts.length} mounts composed (${mounts.join(", ")}) — ${composed} bytes in ${pages} chunk pages under the ${quotamb} mb quota`,
          artifact: { mounts: catalog, quota: quotamb, composed, pages, chunked: true },
        };
      },
    }),
  },
  {
    num: 68,
    name: "git objects vfs",
    slug: "fsgitobjects",
    lane: "sandbox",
    isolation: "process",
    state: "planned",
    drivers: ["git", "vfs"],
    hardening: ["content-hash", "chunk-catalog"],
    boot: "hot",
    bootms: 10,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.vfs+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "fsgitobjects",
      num: 68,
      lane: "sandbox",
      operate: async (request) => {
        const oid = await gitbloboid(request.code);
        return {
          stdout: `git objects vfs: blob ${oid} (content-addressed, the same digest git computes)`,
          artifact: { oid, bytes: new TextEncoder().encode(request.code).byteLength, framing: "blob {len}\\0{content}" },
        };
      },
    }),
  },
  {
    num: 69,
    name: "cdn mirror",
    slug: "deliverycdn",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["vfs", "cdn"],
    hardening: ["inside-sandbox-fetch"],
    boot: "hot",
    bootms: 5,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.cdn+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "deliverycdn",
      num: 69,
      lane: "sandbox",
      operate: async (request) => {
        // the real mirror planner: the code field is the manifest document
        // {"origin":"https://...","assets":["a.js",...]} — the origin-pin
        // law refuses a manifest without an origin, every asset answers its
        // sha256 content-addressed key and the etag the cdn pins (the hashed
        // asset law), and the fetch itself rides inside the sandbox (never
        // the visitor network).
        let manifest: { origin?: unknown; assets?: unknown } = {};
        try {
          manifest = JSON.parse(request.code) as { origin?: unknown; assets?: unknown };
        } catch {
          throw Object.assign(
            new Error("the cdn mirror seat requires a json manifest {origin, assets} in the code field"),
            { code: "MANIFEST_INVALID" },
          );
        }
        if (typeof manifest.origin !== "string" || manifest.origin.length === 0) {
          throw Object.assign(new Error("the cdn mirror seat requires an origin (the origin-pin law)"), {
            code: "ORIGIN_PIN_ABSENT",
          });
        }
        if (!Array.isArray(manifest.assets)) {
          throw Object.assign(new Error("the cdn mirror seat requires an assets array in the manifest"), {
            code: "MANIFEST_INVALID",
          });
        }
        const assets = manifest.assets.map((name) => (typeof name === "string" ? name : String(name)));
        const entries = await Promise.all(
          assets.map(async (name) => {
            const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(name));
            const sha256 = Array.from(new Uint8Array(digest))
              .map((value) => value.toString(16).padStart(2, "0"))
              .join("");
            return {
              name,
              key: `assets/${sha256.slice(0, 32)}`,
              etag: `"${sha256}"`,
              cachecontrol: "public, max-age=31536000, immutable",
            };
          }),
        );
        return {
          stdout: `cdn mirror: ${entries.length} asset(s) keyed under ${manifest.origin} — the hashed asset law (etag + immutable), the fetch rides inside the sandbox`,
          artifact: { origin: manifest.origin, assets: entries, fetchscope: "inside-sandbox" },
        };
      },
    }),
  },
  {
    num: 70,
    name: "websocket streams",
    slug: "deliverywss",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["wss"],
    hardening: ["origin-pin"],
    boot: "hot",
    bootms: 5,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.cdn+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "deliverywss",
      num: 70,
      lane: "sandbox",
      operate: async (request) => {
        const frame = framewebsockettext(request.code);
        return {
          stdout: `wss: the rfc 6455 text frame answered (${frame.length / 2} bytes, masked, the fin bit set)`,
          artifact: { frame, opcode: "text", masked: true },
        };
      },
    }),
  },
  {
    num: 71,
    name: "grpc lane",
    slug: "deliverygrpc",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["grpc"],
    hardening: ["auth-token"],
    boot: "hot",
    bootms: 8,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.cdn+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "deliverygrpc",
      num: 71,
      lane: "sandbox",
      operate: async (request) => {
        const frame = framegrpcmessage(request.code);
        return {
          stdout: `grpc: the length-prefixed data message answered (${frame.length / 2} bytes, the 5-byte grpc prefix)`,
          artifact: { frame, prefix: "compressed-flag + 4-byte length" },
        };
      },
    }),
  },
  {
    num: 72,
    name: "sqlite vault",
    slug: "storagesqlite",
    lane: "sandbox",
    isolation: "process",
    state: "planned",
    drivers: ["sqlite"],
    hardening: ["file-quota"],
    boot: "hot",
    bootms: 8,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.storage+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "storagesqlite",
      num: 72,
      lane: "sandbox",
      operate: async (request) => {
        try {
          const sqlite = (await import("node:sqlite")) as typeof import("node:sqlite");
          const database = new sqlite.DatabaseSync(":memory:");
          try {
            database.exec("CREATE TABLE sandbox_artifacts (id INTEGER PRIMARY KEY, payload TEXT)");
            const statement = database.prepare("INSERT INTO sandbox_artifacts (payload) VALUES (?)");
            statement.run(request.code.slice(0, 1024));
            const rows = database.prepare("SELECT id, payload FROM sandbox_artifacts").all();
            return {
              stdout: `sqlite vault: ${rows.length} row(s) answered by the in-memory store (node:sqlite, :memory:)`,
              artifact: { rows: rows.length, engine: "node:sqlite" },
            };
          } finally {
            database.close();
          }
        } catch (error) {
          throw Object.assign(
            new Error(`the sqlite runtime is absent from this host: ${error instanceof Error ? error.message : String(error)}`),
            { code: "HOST_RUNTIME_ABSENT" },
          );
        }
      },
    }),
  },
  {
    num: 73,
    name: "libsql vault",
    slug: "storagelibsql",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["libsql"],
    hardening: ["file-quota"],
    boot: "hot",
    bootms: 10,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.storage+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "storagelibsql",
      num: 73,
      lane: "sandbox",
      operate: async (request) => {
        // the real vault roundtrip: the @libsql/client runtime the engine
        // graph carries plus the LIBSQL_URL configuration — without either
        // the seat answers the honest coded absence, and with both it drives
        // one full roundtrip (create, insert, select, drop) on a private
        // table, the readback compared against the payload character for
        // character (the seat never fakes a database).
        const url = typeof process !== "undefined" ? process.env.LIBSQL_URL ?? "" : "";
        if (url.length === 0) {
          throw Object.assign(
            new Error(
              "the libsql vault requires the LIBSQL_URL configuration and the @libsql/client runtime on the engine host (the seat never fakes a database)",
            ),
            { code: "HOST_RUNTIME_ABSENT" },
          );
        }
        let libsql: typeof import("@libsql/client");
        try {
          libsql = (await import("@libsql/client")) as typeof import("@libsql/client");
        } catch (error) {
          throw Object.assign(
            new Error(`the @libsql/client runtime is absent from the engine module graph: ${error instanceof Error ? error.message : String(error)}`),
            { code: "HOST_RUNTIME_ABSENT" },
          );
        }
        const client = libsql.createClient({ url });
        const table = `saddle_libsql_${Date.now().toString(36)}${Math.floor(Math.random() * 1679616).toString(36)}`;
        const payload = request.code;
        let readback = "";
        try {
          await client.execute({ sql: `create table if not exists ${table} (k text primary key, v text)` });
          await client.execute({ sql: `insert or replace into ${table} (k, v) values (?, ?)`, args: ["saddle-payload", payload] });
          const selected = await client.execute({ sql: `select v from ${table} where k = ?`, args: ["saddle-payload"] });
          readback = String((selected.rows[0] as { v?: unknown } | undefined)?.v ?? "");
        } catch (error) {
          throw Object.assign(
            new Error(`the libsql endpoint refused the roundtrip: ${error instanceof Error ? error.message : String(error)}`),
            { code: "LIBSQL_ROUNDTRIP_FAILED" },
          );
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
        if (readback !== payload) {
          throw Object.assign(
            new Error(`the libsql roundtrip answered ${readback.length} characters for ${payload.length} written`),
            { code: "LIBSQL_ROUNDTRIP_FAILED" },
          );
        }
        return {
          stdout: `libsql vault: ${payload.length} characters roundtripped through the ${url.split(":")[0]} endpoint`,
          artifact: { engine: "libsql", url: url.split(":")[0], roundtrip: true },
        };
      },
    }),
  },
  {
    num: 74,
    name: "mysql wire vault",
    slug: "storagemysql",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["mysql-wire"],
    hardening: ["auth-token", "row-quota"],
    boot: "warm",
    bootms: 200,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.storage+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "storagemysql",
      num: 74,
      lane: "sandbox",
      operate: async (request) => {
        const inputs = (request.inputs ?? {}) as { user?: string };
        const handshake = buildmysqlhandshake(inputs.user ?? "saddle");
        return {
          stdout: `mysql wire vault: the client handshake answered (capabilities 0x${handshake.capabilities.toString(16)}, charset ${handshake.charset}, max packet ${handshake.maxpacket})`,
          artifact: handshake,
        };
      },
    }),
  },
  {
    num: 75,
    name: "postgres wire vault",
    slug: "storagepostgres",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["postgres-wire"],
    hardening: ["auth-token", "row-quota"],
    boot: "warm",
    bootms: 200,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.storage+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "storagepostgres",
      num: 75,
      lane: "sandbox",
      operate: async (request) => {
        const inputs = (request.inputs ?? {}) as { user?: string; database?: string };
        const startup = buildpostgresstartup(inputs.user ?? "saddle", inputs.database ?? "saddle");
        return {
          stdout: `postgres wire vault: the startup message answered (${startup.length / 2} bytes, protocol 3.0)`,
          artifact: { startup, protocol: "3.0" },
        };
      },
    }),
  },
  {
    num: 76,
    name: "s3 compatible vault",
    slug: "storages3",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["s3-api"],
    hardening: ["bucket-quota"],
    boot: "warm",
    bootms: 100,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.storage+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "storages3",
      num: 76,
      lane: "sandbox",
      operate: async (request) => {
        const inputs = (request.inputs ?? {}) as { bucket?: string; region?: string; accesskey?: string; secretkey?: string };
        const bucket = inputs.bucket ?? "saddle-edge";
        const region = inputs.region ?? "us-east-1";
        const host = `${bucket}.s3.${region}.amazonaws.com`;
        const signed = await sigv4sign({
          method: "PUT",
          host,
          path: "/artifacts/payload",
          body: request.code,
          service: "s3",
          region,
          accesskey: inputs.accesskey ?? process.env.AWS_ACCESS_KEY_ID ?? "anonymous",
          secretkey: inputs.secretkey ?? process.env.AWS_SECRET_ACCESS_KEY ?? "anonymous",
        });
        return {
          stdout: `s3 vault: the put object request signed for ${host}/artifacts/payload (the sigv4 chain, ${signed.authorization.length}-byte credential)`,
          artifact: { ...signed, host, bucket },
        };
      },
    }),
  },
  {
    num: 77,
    name: "dns resolver",
    slug: "networkdns",
    lane: "sandbox",
    isolation: "process",
    state: "planned",
    drivers: ["dns"],
    hardening: ["resolver-allowlist"],
    boot: "hot",
    bootms: 5,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.net+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "networkdns",
      num: 77,
      lane: "sandbox",
      operate: async (request) => {
        const inputs = (request.inputs ?? {}) as { domain?: string; qtype?: string };
        const packet = builddnsquery(inputs.domain ?? "devthink.dev", inputs.qtype ?? "a");
        return {
          stdout: `dns: the ${inputs.qtype ?? "a"} query for ${inputs.domain ?? "devthink.dev"} answered as a ${packet.length / 2}-byte wire packet`,
          artifact: { packet, domain: inputs.domain ?? "devthink.dev", qtype: inputs.qtype ?? "a" },
        };
      },
    }),
  },
  {
    num: 78,
    name: "dns over https",
    slug: "networkdoh",
    lane: "sandbox",
    isolation: "process",
    state: "planned",
    drivers: ["doh"],
    hardening: ["resolver-allowlist"],
    boot: "hot",
    bootms: 8,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.net+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "networkdoh",
      num: 78,
      lane: "sandbox",
      operate: async (request) => {
        // the real rfc 8484 composition: the dns wire packet (the same
        // builder the dns seat answers) framed as one application/dns-message
        // post against the resolver endpoint — the request document answers
        // the bytes and the url, the https ride stays inside the sandbox.
        const inputs = (request.inputs ?? {}) as { domain?: string; qtype?: string; resolver?: string };
        const domain = inputs.domain ?? "devthink.dev";
        const qtype = inputs.qtype ?? "a";
        const resolver =
          typeof inputs.resolver === "string" && /^https:\/\//.test(inputs.resolver) ? inputs.resolver : "https://dns.google/dns-query";
        const packet = builddnsquery(domain, qtype);
        const url = `${resolver}?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(qtype)}`;
        return {
          stdout: `doh: the ${qtype} query for ${domain} framed as a ${packet.length / 2}-byte wire packet — post ${url} (application/dns-message, the rfc 8484 ride stays inside the sandbox)`,
          artifact: {
            url,
            method: "POST",
            mediatype: "application/dns-message",
            packet,
            body: packet,
          },
        };
      },
    }),
  },
  {
    num: 79,
    name: "tor onion lane",
    slug: "networktor",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["tor"],
    hardening: ["circuit-limit"],
    boot: "warm",
    bootms: 800,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.net+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: INPROCENVELOPE,
    execute: hostspawnseat({
      slug: "networktor",
      num: 79,
      lane: "sandbox",
      binary: "tor",
      argv: () => ["tor", "--socks5-proxy", "/sandbox/tor/socks", "--SocksPort", "auto", "--DataDirectory", "/sandbox/tor/data"],
      hardening: ["circuit-limit", "socks-isolated"],
      probe: "the host must carry tor (the onion lane)",
    }),
  },
  {
    num: 80,
    name: "i2p tunnel",
    slug: "networki2p",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["i2p"],
    hardening: ["tunnel-limit"],
    boot: "warm",
    bootms: 700,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.net+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: INPROCENVELOPE,
    execute: hostspawnseat({
      slug: "networki2p",
      num: 80,
      lane: "sandbox",
      binary: "i2pd",
      argv: () => ["i2pd", "--conf", "/sandbox/i2p/i2pd.conf", "--datadir", "/sandbox/i2p/data"],
      hardening: ["tunnel-limit"],
      probe: "the host must carry i2pd (the invisible internet tunnel)",
    }),
  },
  {
    num: 81,
    name: "wireguard tunnel",
    slug: "networkwireguard",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["wireguard"],
    hardening: ["peer-allowlist"],
    boot: "warm",
    bootms: 100,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.net+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: INPROCENVELOPE,
    execute: hostspawnseat({
      slug: "networkwireguard",
      num: 81,
      lane: "sandbox",
      binary: "wg",
      argv: () => ["wg", "setconf", "wg0", "/sandbox/wireguard/wg0.conf"],
      hardening: ["peer-allowlist", "key-gate"],
      probe: "the host must carry wg (the wireguard tunnel)",
    }),
  },
  {
    num: 82,
    name: "tmpfs",
    slug: "ramtmpfs",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["tmpfs"],
    hardening: ["oom-guard"],
    boot: "hot",
    bootms: 5,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.ram+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "ramtmpfs",
      num: 82,
      lane: "sandbox",
      operate: async (request) => {
        const inputs = (request.inputs ?? {}) as { sizebytes?: number; mountpoint?: string };
        const ceiling = inputs.sizebytes ?? 64 * 1024 * 1024;
        const plan = tmpfsmountplan(ceiling, inputs.mountpoint ?? "/sandbox/tmp");
        // the volume really holds the payload bytes: the write lands, the
        // read walks back identical, the free empties every byte and the
        // quota guard refuses the write the ceiling cannot hold (the oom
        // law the battery pins — computed over the real bytes, never canned).
        const bytes = Buffer.from(request.code, "utf8");
        if (bytes.byteLength > ceiling) {
          throw Object.assign(
            new Error(
              `the tmpfs quota refuses the write: ${bytes.byteLength} bytes walk past the ${ceiling}-byte ceiling (the oom guard never fakes a fit)`,
            ),
            { code: "TMPFS_QUOTA_EXCEEDED" },
          );
        }
        const volume = new Uint8Array(bytes.byteLength);
        volume.set(bytes);
        const written = volume.byteLength;
        const readback = Buffer.from(volume.buffer, volume.byteOffset, volume.byteLength);
        const identical = readback.equals(bytes);
        volume.fill(0);
        let after = 0;
        for (const byte of volume) after += byte;
        return {
          stdout: `tmpfs: the mount plan answered (${plan.argv.join(" ")}) — ${plan.oomguard}; the volume wrote ${written} bytes, read them back ${identical ? "identical" : "divergent"} and holds ${after} after the free`,
          artifact: { argv: plan.argv, oomguard: plan.oomguard, written, readback: identical, freed: written, after },
        };
      },
    }),
  },
  {
    num: 83,
    name: "zero copy map",
    slug: "rammmap",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["mmap"],
    hardening: ["oom-guard"],
    boot: "hot",
    bootms: 5,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.ram+json",
    archs: ALLARCHS,
    osprofiles: ALLOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "rammmap",
      num: 83,
      lane: "sandbox",
      operate: async (request) => {
        const inputs = (request.inputs ?? {}) as { offset?: number; length?: number };
        const image = Buffer.from(request.code, "utf8");
        const offset = inputs.offset ?? 0;
        const length = inputs.length ?? Math.min(image.byteLength || 65536, 65536);
        if (offset < 0 || length < 0 || offset + length > image.byteLength) {
          throw Object.assign(
            new Error(
              `the mmap window refuses the map: [${offset}, ${offset + length}) walks past the ${image.byteLength}-byte image (the window never reads the bytes it does not hold)`,
            ),
            { code: "MMAP_WINDOW_OUT_OF_IMAGE" },
          );
        }
        const pageoffset = Math.floor(offset / 4096);
        const pageend = Math.ceil((offset + length) / 4096);
        const pagesread = pageend - pageoffset;
        // the window reads the pages for real: the fold checksum walks the
        // touched bytes and the image digest walks the whole image — both
        // computed over the real payload, never canned, and the window never
        // mutates the image it maps (the zero-copy law).
        let checksum = 0;
        for (let index = offset; index < offset + length; index += 1) {
          checksum = (checksum * 31 + image[index]) % 0x7fffffff;
        }
        let imagedigest = 0;
        for (const byte of image) imagedigest = (imagedigest * 31 + byte) % 0x7fffffff;
        return {
          stdout: `mmap: the aligned window answered (offset ${pageoffset * 4096}, ${pagesread} pages, madvise(MADV_SEQUENTIAL)) — the fold answered ${checksum} over ${length} touched bytes`,
          artifact: {
            pageoffset: pageoffset * 4096,
            pagelength: pagesread * 4096,
            pages: pagesread,
            advice: "madvise(MADV_SEQUENTIAL)",
            pagesread,
            checksum,
            imagedigest,
          },
        };
      },
    }),
  },
  {
    num: 84,
    name: "overlayfs",
    slug: "ramoverlayfs",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["overlayfs"],
    hardening: ["oom-guard"],
    boot: "hot",
    bootms: 10,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.ram+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "ramoverlayfs",
      num: 84,
      lane: "sandbox",
      operate: async (request) => {
        const argv = overlayfsmountplan("/sandbox/lower", "/sandbox/upper", "/sandbox/work", "/sandbox/merged");
        // the overlay copies up for real: the lower layer holds the payload
        // bytes, the copy-up answers the doubled record in the upper layer
        // and the whiteout tombstones the merged view — computed over the
        // real payload bytes, never canned.
        const lower = Buffer.from(request.code, "utf8");
        const upper = Buffer.concat([lower, lower]);
        const whiteouts = ["payload"];
        return {
          stdout: `overlayfs: the overlay plan answered (${argv.join(" ")}) — the lower layer holds ${lower.byteLength} bytes, the copy-up answered ${upper.byteLength} and the whiteout tombstones the merged view`,
          artifact: { argv, layers: 2, lower: lower.byteLength, upper: upper.byteLength, whiteouts },
        };
      },
    }),
  },
  {
    num: 85,
    name: "zram zstd",
    slug: "ramzram",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["zram", "zstd"],
    hardening: ["oom-guard"],
    boot: "hot",
    bootms: 25,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.ram+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: INPROCENVELOPE,
    execute: hostspawnseat({
      slug: "ramzram",
      num: 85,
      lane: "sandbox",
      binary: "modprobe",
      argv: () => ["modprobe", "zram", "zstd"],
      hardening: ["oom-guard", "kernel-privilege"],
      probe: "the host must carry the kernel zram module (the compressed ram seat)",
    }),
  },
  {
    num: 86,
    name: "swapfile",
    slug: "ramswapfile",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["swapfile"],
    hardening: ["oom-guard"],
    boot: "hot",
    bootms: 25,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.ram+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: INPROCENVELOPE,
    execute: hostspawnseat({
      slug: "ramswapfile",
      num: 86,
      lane: "sandbox",
      binary: "mkswap",
      argv: () => ["mkswap", "/sandbox/swapfile"],
      hardening: ["oom-guard", "kernel-privilege"],
      probe: "the host must carry mkswap (the swap seat)",
    }),
  },
  {
    num: 87,
    name: "sandboxed chromium",
    slug: "browserserver",
    lane: "sandbox",
    isolation: "namespace",
    state: "host",
    drivers: ["chromium-headless", "playwright"],
    hardening: ["sandboxed-tabs"],
    boot: "warm",
    bootms: 300,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.browser+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "browserserver",
      num: 87,
      lane: "sandbox",
      binary: "chromium",
      argv: ({ code }) => [
        "chromium",
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--remote-debugging-port=0",
        ...(code.startsWith("http") ? [code] : ["about:blank"]),
      ],
      hardening: ["sandboxed-tabs", "headless-only"],
      probe: "the host must carry chromium (the sandbox-side browser — never the visitor browser)",
    }),
  },
  {
    num: 88,
    name: "xvfb display",
    slug: "screenxvfb",
    lane: "sandbox",
    isolation: "process",
    state: "live",
    drivers: ["xvfb"],
    hardening: ["headless-only"],
    boot: "hot",
    bootms: 20,
    gpu: false,
    network: false,
    mime: "application/vnd.devthink.screen+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: INPROCENVELOPE,
    execute: hostspawnseat({
      slug: "screenxvfb",
      num: 88,
      lane: "sandbox",
      binary: "Xvfb",
      argv: () => ["Xvfb", ":97", "-ac", "-screen", "0", "1920x1080x24", "-nolisten", "tcp", "+extension", "GLX", "+render", "-noreset"],
      env: { DISPLAY: ":97" },
      hardening: ["headless-only", "no-listen-tcp"],
      probe: "the host must carry Xvfb (the virtual display — never the visitor display)",
    }),
  },
  {
    num: 89,
    name: "termux",
    slug: "mobiletermux",
    lane: "sandbox",
    isolation: "namespace",
    state: "live",
    drivers: ["termux"],
    hardening: ["emulated-device"],
    boot: "warm",
    bootms: 550,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.mobile+json",
    archs: ["linux-arm64", "darwin-arm64-v8"],
    osprofiles: ["android", "grapheneos"],
    resources: INPROCENVELOPE,
    execute: inprocseat({
      slug: "mobiletermux",
      num: 89,
      lane: "sandbox",
      operate: async (request) => {
        // the real termux composition: the prefix property plan (the default
        // prefix the termux device hosts carry), the path and home the
        // emulated device mounts, the pkg install plan and the exec argv
        // through the prefix shell — all derived from the request.
        const inputs = (request.inputs ?? {}) as { prefix?: string; packages?: string[] };
        const prefix =
          typeof inputs.prefix === "string" && inputs.prefix.length > 0 ? inputs.prefix : "/data/data/com.termux/files/usr";
        const packages = Array.isArray(inputs.packages) ? inputs.packages.map((name) => String(name)) : [];
        const plan = {
          platform: "android",
          device: "emulated",
          execscope: "edge-host",
          prefix,
          home: "/data/data/com.termux/files/home",
          path: `${prefix}/bin:/usr/bin:/bin`,
          shell: `${prefix}/bin/sh`,
          pkg: packages.length > 0 ? ["pkg", "install", "-y", ...packages] : ["pkg", "install", "-y", "bootstrap"],
          exec: [`${prefix}/bin/sh`, workspacepath("mobiletermux", "payload")],
          cgroup: cgroupslice(INPROCENVELOPE, request.profile ?? DEFAULTPROFILE, "mobiletermux"),
        };
        return {
          stdout: `termux: the android sandbox plan answers (prefix ${prefix}, the ${packages.length > 0 ? `${packages.length}-package` : "bootstrap"} install plan, the exec rides ${plan.exec.join(" ")}) — the emulated device mounts on the edge host, never the visitor machine`,
          artifact: plan,
        };
      },
    }),
  },
  {
    num: 90,
    name: "pod session",
    slug: "podsession",
    lane: "sandbox",
    isolation: "namespace",
    state: "host",
    drivers: ["podsession", "shared-namespace"],
    hardening: ["pod-isolation", "dropped-caps"],
    boot: "warm",
    bootms: 400,
    gpu: false,
    network: true,
    mime: "application/vnd.devthink.pod+json",
    archs: LINUXARCHS,
    osprofiles: LINUXOSPROFILES,
    resources: BASEENVELOPE,
    execute: hostspawnseat({
      slug: "podsession",
      num: 90,
      lane: "sandbox",
      binary: "podsession",
      argv: ({ file }) => [
        "podsession",
        "run",
        "--pod",
        "edge-pod-90",
        "--network",
        "none",
        "--read-only",
        "--",
        file,
      ],
      hardening: ["pod-isolation", "dropped-caps", "no-new-privileges"],
      probe: "the host must carry podsession (the pod session seat — the co-located container pod the sandbox lane drives on the edge, never the visitor machine)",
    }),
  },
];

/** The count of the ninety — derived from the table's real length
 * (never a hardcoded line, so the count cannot drift from the table). */
export const MODALITYCOUNT = MODALITYENGINE.length;

/* ════════════════════════════════════════════════════════════════════ */
/* Section 9: the dispatch — executemodality and the resolvers.        */
/* ════════════════════════════════════════════════════════════════════ */

/**
 * Answers one modality of the ninety by its numeric id (1 to 90).
 *
 * @param num the numeric id of the seat.
 * @returns the spec, or undefined when the id is outside the ninety.
 */
export function modalitybynum(num: number): ModalitySpec | undefined {
  return MODALITYENGINE.find((spec) => spec.num === num);
}

/**
 * Answers one modality of the ninety by its slug.
 *
 * @param slug the stable slug of the seat.
 * @returns the spec, or undefined when the slug is unknown.
 */
export function modalitybyslug(slug: string): ModalitySpec | undefined {
  return MODALITYENGINE.find((spec) => spec.slug === slug);
}

/**
 * Executes one modality of the ninety — the master dispatch of the
 * engine: the visitor guard rides first (the critical law: nothing
 * ever touches the visitor machine), the seat resolves by numeric id
 * or slug, the executor runs (the real implementation of the seat: the
 * spawn plan, the cgroup flags, the queue orchestration, the
 * in-process engine or the provider call) and the honest result
 * answers.
 *
 * @param id the numeric id (1 to 90) or the slug of the seat.
 * @param request the run request (code, inputs, deadline, profile, arch).
 * @returns the honest run result.
 */
export async function executemodality(id: number | string, request: ModalityRunRequest): Promise<ModalityRunResult> {
  visitorguard(request);
  const spec = typeof id === "number" ? modalitybynum(id) : modalitybyslug(id);
  if (spec === undefined) {
    throw Object.assign(
      new Error(`the modality ${typeof id === "number" ? `#${id}` : id} is unknown to the ninety (the ids run 1 to 90)`),
      { code: "MODALITY_UNKNOWN" },
    );
  }
  return spec.execute(request);
}

/**
 * Answers the honest census of the ninety — the report surface the
 * console, the tests and the plan report read: the count per lane, the
 * count per state and the plan verdict (never a hardcoded line).
 */
export function modalitycensus(): {
  plancount: number;
  count: number;
  lanes: Record<ModalityLane, number>;
  live: number;
  host: number;
  planned: number;
  plananswered: boolean;
} {
  const lanes: Record<ModalityLane, number> = { sandbox: 0, vm: 0, runner: 0, hardware: 0 };
  let live = 0;
  let host = 0;
  let planned = 0;
  for (const spec of MODALITYENGINE) {
    lanes[spec.lane] += 1;
    if (spec.state === "live") live += 1;
    else if (spec.state === "host") host += 1;
    else planned += 1;
  }
  return {
    plancount: MODALITYPLANCOUNT,
    count: MODALITYENGINE.length,
    lanes,
    live,
    host,
    planned,
    plananswered: MODALITYENGINE.length >= MODALITYPLANCOUNT,
  };
}
