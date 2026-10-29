// # engines — the registry of the fifteen engine law (the maestro wave).
// One record per engine the node maestro conducts: node is the maestro —
// the process that orchestrates every other engine from inside itself —
// and the catalog answers the owner's law with fifteen honest records:
// the node natives first (bun, deno, typescript, corepack, npm, pnpm,
// yarn — the javascript family the maestro shares a language with), the
// scripted lane second (python, driven through the pythonscripts module)
// and the external toolchains last (go, rust, cargo, v, java, dotnet —
// the foreign binaries the maestro only reaches by spawning). Every
// record declares its honest state — ready, planned or declared — so the
// report never lies: an engine no lane wires today says so and carries
// its resolution path instead of pretending. The sibling registry of the
// sandbox world is the modality catalog (./modalities.ts — the forty
// plan); this registry is the runtime world: how the maestro invokes
// each engine, never how it isolates it. The root package manifest
// counts them all (the engines field carries every id beside the extra
// surfaces the family declares). Pure data and pure functions: zero
// storage, zero node-only imports, the browser-pure bundle keeps
// carrying it.

// ---------------------------------------------------------------------------
// the kind ladder — what family the engine belongs to
// ---------------------------------------------------------------------------

/**
 * The family ladder of one engine — the priority law the table walks:
 * - native — the node family: the engines that execute javascript or
 *   typescript, or conduct the node package ecosystem; the maestro
 *   shares a language with them, so they ride the head of the table;
 * - scripted — the engines the maestro drives through a script module
 *   of the tree (the interpreter spawns inside the sandbox cwd a lane
 *   owns);
 * - external — the foreign toolchains: languages and build systems
 *   outside the javascript family, reachable only through their binary.
 */
export type EngineKind = "native" | "scripted" | "external";

// ---------------------------------------------------------------------------
// the honest state ladder — what the lanes wire today
// ---------------------------------------------------------------------------

/**
 * The honest wiring state of one engine — the truth ladder every record
 * declares and every report reads (the same law the modality registry
 * answers, told for the runtime world):
 * - ready — the maestro wires the executor today: the engine is the
 *   process itself, a lane of the tree spawns it, or it ships inside
 *   the node distribution the maestro runs on;
 * - planned — the tree declares the engine (an entry, a manifest or a
 *   source artifact answers) but no lane drives it yet; the record
 *   carries the resolution path;
 * - declared — the catalog promise: only the manifest field answers,
 *   no artifact beyond the declaration, and the resolution path is
 *   documented so the rung never pretends.
 */
export type EngineState = "ready" | "planned" | "declared";

// ---------------------------------------------------------------------------
// the runner ladder — how the maestro invokes the engine
// ---------------------------------------------------------------------------

/**
 * The invocation path the maestro uses for one engine:
 * - in-process — the maestro conducts the engine from inside its own
 *   process (only node answers this rung today: the maestro is node);
 * - child_process — the maestro spawns the engine binary through
 *   node:child_process and captures the streams (every wired engine of
 *   the current table rides this rung);
 * - napi — the in-process native addon rung: the engine compiles into
 *   a node addon the maestro loads without a spawn (documented future
 *   rung — no engine declares it yet, so none pretends);
 * - ffi — the foreign function bridge: the maestro calls the engine
 *   library through a foreign function interface (documented future
 *   rung — no engine declares it yet either).
 */
export type EngineRunner = "in-process" | "child_process" | "napi" | "ffi";

// ---------------------------------------------------------------------------
// the engine record — one honest row of the catalog
// ---------------------------------------------------------------------------

/** One engine of the registry: the conductor's honest row. */
export interface EngineRecord {
  /** The stable id the dispatch, the tests and the root manifest reference. */
  id: string;
  /** The display name (the label the reports print). */
  name: string;
  /** The family ladder rung: native, scripted or external. */
  kind: EngineKind;
  /** The honest wiring state: ready, planned or declared. */
  state: EngineState;
  /** How the maestro invokes the engine (the runner ladder). */
  runner: EngineRunner;
  /** The binary the dispatch spawns (the maestro's own name when in-process). */
  command: string;
  /** The flag mapping the dispatch passes — angle tokens are placeholders
   * the caller fills (<script>, <manager>, <version> and friends). */
  flags: readonly string[];
  /** What wires today, in one honest sentence. */
  note: string;
  /** The resolution path — empty for the ready engines (the rung already
   * answers), the documented walk for every planned or declared engine. */
  resolution: string;
}

// ---------------------------------------------------------------------------
// the fifteen law and the engine table
// ---------------------------------------------------------------------------

/** The fifteen engine plan: the count the owner charged (node the
 * maestro conducting fifteen honest engines) and the registry answers —
 * the field grows without limit in the root manifest, but this constant
 * pins the line the current plan walks. */
export const ENGINEPLANCOUNT = 15;

/** The engine records: the catalog the maestro reads, natives first
 * (node at the head — the maestro), then the scripted lane, then the
 * external toolchains. */
export const ENGINES: readonly EngineRecord[] = Object.freeze([
  // the maestro and the native family: the javascript conduct
  { id: "node", name: "Node.js", kind: "native", state: "ready", runner: "in-process", command: "node", flags: [], note: "the maestro itself — the registry, the lanes and every test of the family execute inside the node process, so the conductor never spawns its own engine", resolution: "" },
  { id: "bun", name: "Bun", kind: "native", state: "ready", runner: "child_process", command: "bun", flags: ["run", "<script>"], note: "every family app carries bun.lock and the root dev script boots bun server.ts serve — the fast lane of the maestro", resolution: "" },
  { id: "deno", name: "Deno", kind: "native", state: "planned", runner: "child_process", command: "deno", flags: ["run", "--allow-read", "--allow-write", "<script>"], note: "the deno.ts entry and the deno.json tasks declare the esm target with the kv adapter, but no lane spawns deno today", resolution: "deno on PATH, then deno run with the permission map the modality registry pins for the deno runner" },
  { id: "typescript", name: "TypeScript", kind: "native", state: "ready", runner: "child_process", command: "tsx", flags: ["<script.ts>"], note: "the typescript-only law — every family source and every test rides ts, executed through the pinned tsx runner with tsc as the type gate", resolution: "" },
  { id: "corepack", name: "Corepack", kind: "native", state: "ready", runner: "child_process", command: "corepack", flags: ["prepare", "<manager>@<version>", "--activate"], note: "ships inside the node distribution — the package-manager conductor that pins and prepares the pnpm and yarn shims the manifests declare", resolution: "" },
  { id: "npm", name: "npm", kind: "native", state: "ready", runner: "child_process", command: "npm", flags: ["run", "<script>"], note: "ships beside node — the registry lane the family publishes through", resolution: "" },
  { id: "pnpm", name: "pnpm", kind: "native", state: "planned", runner: "child_process", command: "pnpm", flags: ["install", "--frozen-lockfile"], note: "the tree declares pnpm-lock.yaml and pnpm-workspace.yaml in every family app, but no maestro host lane executes pnpm today", resolution: "corepack prepare pnpm --activate wires the shim, then pnpm install --frozen-lockfile walks the declared locks" },
  { id: "yarn", name: "Yarn", kind: "native", state: "declared", runner: "child_process", command: "yarn", flags: ["install"], note: "the engines fields of the family manifests declare yarn, and the tree carries no yarn artifact beyond the declaration", resolution: "corepack prepare yarn --activate wires the shim, then yarn install answers the manifests" },
  // the scripted lane: the interpreter the maestro drives through a module
  { id: "python", name: "Python", kind: "scripted", state: "ready", runner: "child_process", command: "python3", flags: ["<script.py>"], note: "the python lane answers — pythonscripts.ts spawns python3 inside the sandbox cwd with the timeout kill and the captured streams; the tree rides no python script of its own today, the lane serves the caller's script", resolution: "" },
  // the external toolchains: the foreign binaries, spawn only
  { id: "go", name: "Go", kind: "external", state: "declared", runner: "child_process", command: "go", flags: ["run", "<file.go>"], note: "the catalog promise — no go source or manifest answers in the tree today", resolution: "the go toolchain on PATH, then go run compiles and executes the source in one step" },
  { id: "rust", name: "Rust", kind: "external", state: "declared", runner: "child_process", command: "rustc", flags: ["--edition", "2024", "<file.rs>"], note: "the catalog promise — no rust source answers in the tree today; the in-process napi rung stays the documented alternative for the day an addon lane lands", resolution: "rustup installs the toolchain, then rustc --edition 2024 compiles the source" },
  { id: "cargo", name: "Cargo", kind: "external", state: "declared", runner: "child_process", command: "cargo", flags: ["run", "--locked"], note: "the rust package conductor — the tree carries no Cargo.toml, so the promise rides the rust rung", resolution: "cargo rides the rust toolchain, then cargo run --locked executes the locked crate" },
  { id: "v", name: "V", kind: "external", state: "declared", runner: "child_process", command: "v", flags: ["run", "<file.v>"], note: "the catalog promise — no v source answers in the tree today", resolution: "the v toolchain on PATH, then v run compiles and executes the source" },
  { id: "java", name: "Java", kind: "external", state: "planned", runner: "child_process", command: "java", flags: ["-jar", "<artifact.jar>"], note: "the tree declares the artifacts — the java sources and the pom.xml maven distributions (saddle pins compiler release 17) — and the host probes the runtime, but no lane compiles or drives a jar today", resolution: "the jdk rung on PATH (javac or maven beside the runtime), then java -jar answers the built artifact" },
  { id: "dotnet", name: ".NET", kind: "external", state: "planned", runner: "child_process", command: "dotnet", flags: ["run", "--project", "<project.csproj>"], note: "the tree declares the projects — devthink.csproj and argan.csproj target netstandard2.0 and netstandard2.1, saddle.csproj targets net8.0, and the c-sharp sources sit beside them — but no lane runs dotnet today", resolution: "the dotnet sdk on PATH, then dotnet run --project walks the declared projects" },
]);

// ---------------------------------------------------------------------------
// the honest report — the census the lanes and the tests read
// ---------------------------------------------------------------------------

/** The honest plan report: what the catalog holds against the fifteen
 * law — the counts per state, the native priority census and whether
 * the plan is answered. The report never counts a record as more than
 * its state declares. */
export interface EnginePlanReport {
  /** The plan line the owner charged (the fifteen engines). */
  plancount: number;
  /** The records the catalog holds. */
  catalogcount: number;
  /** The engines the maestro wires today. */
  ready: number;
  /** The engines the tree declares with a resolution path. */
  planned: number;
  /** The manifest promises with the path documented. */
  declared: number;
  /** The engines of the node family (the priority census). */
  native: number;
  /** Whether the catalog answers the plan count. */
  plananswered: boolean;
}

/** enginesreport — the honest census of the registry against the fifteen
 * law: the counts per state and the plan verdict, computed from the
 * records (never hardcoded, so the report cannot drift from the catalog). */
export function enginesreport(): EnginePlanReport {
  const counts: Record<EngineState, number> = { ready: 0, planned: 0, declared: 0 };
  let native = 0;
  for (const engine of ENGINES) {
    counts[engine.state] += 1;
    if (engine.kind === "native") native += 1;
  }
  return {
    plancount: ENGINEPLANCOUNT,
    catalogcount: ENGINES.length,
    ready: counts.ready,
    planned: counts.planned,
    declared: counts.declared,
    native,
    plananswered: ENGINES.length >= ENGINEPLANCOUNT,
  };
}

// ---------------------------------------------------------------------------
// the lookup — one engine by id
// ---------------------------------------------------------------------------

/**
 * Answers one engine by id (the dispatch and the manifest checks carry ids).
 *
 * @param id the engine id.
 * @returns the record, or undefined when the id is unknown.
 */
export function getengine(id: string): EngineRecord | undefined {
  return ENGINES.find((engine) => engine.id === id);
}

// ---------------------------------------------------------------------------
// the honest dispatch — how the maestro invokes each engine
// ---------------------------------------------------------------------------

/** The dispatch answer of one engine: the honest invocation row. When
 * the state is ready the row is executable — the maestro spawns the
 * command with the flag mapping (or conducts in-process for node);
 * when the state is planned or declared the row refuses honestly and
 * carries the resolution path, so no lane pretends a rung exists. */
export interface EngineDispatch {
  /** The engine id the row answers. */
  id: string;
  /** Whether the maestro may execute the row today. */
  executable: boolean;
  /** The invocation mode: in-process for the maestro, spawn for the rest. */
  mode: "in-process" | "spawn";
  /** The binary the maestro spawns (the conductor's own name in-process). */
  command: string;
  /** The flag mapping the spawn passes (angle tokens are placeholders). */
  flags: readonly string[];
  /** The honest state the row declares. */
  state: EngineState;
  /** The resolution path (empty when the rung already answers). */
  resolution: string;
}

/** dispatchengine — the honest dispatch of one engine: the maestro
 * conducts node in-process, spawns every ready engine through its
 * documented command and flag mapping, and refuses the planned and
 * declared engines with their resolution paths instead of pretending.
 * The napi and ffi rungs stay documented on the ladder — no record
 * declares them today, so no dispatch answers them.
 *
 * @param id the engine id.
 * @returns the dispatch row, or undefined when the id is unknown.
 */
export function dispatchengine(id: string): EngineDispatch | undefined {
  const engine = getengine(id);
  if (engine === undefined) return undefined;
  const executable = engine.state === "ready";
  return {
    id: engine.id,
    executable,
    mode: engine.runner === "in-process" ? "in-process" : "spawn",
    command: engine.command,
    flags: engine.flags,
    state: engine.state,
    resolution: engine.resolution,
  };
}

/** dispatchtable — the full honest dispatch table of the fifteen: one
 * row per engine, the natives first (node the maestro at the head), so
 * the orchestrator surfaces read the whole law in one call.
 *
 * @returns the dispatch rows in table order.
 */
export function dispatchtable(): readonly EngineDispatch[] {
  return ENGINES.map((engine) => dispatchengine(engine.id) as EngineDispatch);
}
