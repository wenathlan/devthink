/**
 * graph — consolidated graph engine logics of the devthink family.
 * @module graph
 * @family wave/logicfold2
 * One keyed file per family: the former variant arms (graphnodes, graphrunner, graphviewstate)
 * retired into this seat with every export preserved under the same name.
 */

/* ===== block: graphnodes ===== */
/**
 * graphnodes — the graph model of the devthink engine (root layer, pure typescript).
 *
 * The owner law: the logics run by stages, on graphs and nodes. This module is
 * the model beneath that law. A node is one step of the work (an id, a kind, a
 * label, its declared input and output ports and the state it holds), an edge
 * is one wire that carries one output port of a source node into a target
 * node, and a graph is the closed set of both. Everything correlated to the
 * model itself lives here and nowhere else: creation, membership, ports,
 * relations, topological layering (the stages), cycle detection,
 * reachability, subgraphs, validation and the JSON round trip. Execution
 * rides graphrunner.ts; the pure view state of the drawing rides
 * graphviewstate.ts. No DOM, no clock, no randomness: every function is
 * deterministic, and the same graph always answers the same stages in the
 * same stable order (the insertion order of the nodes breaks every tie), so
 * the runner, the view and the tests share one model byte for byte.
 */

/** The kinds a node can wear: a stage is one step of the plan, a gate is a
 * consent or checkpoint node, a tool is one callable surface, an agent is one
 * autonomous worker and a sink is the collector that closes the graph. */
export type nodekind = "stage" | "gate" | "tool" | "agent" | "sink";

/** The states a node holds across a run — the ladder the runner walks. */
export type nodestate = "pending" | "running" | "done" | "failed" | "skipped";

/** Every kind, in declaration order. */
export const NODE_KINDS: readonly nodekind[] = ["stage", "gate", "tool", "agent", "sink"];

/** Every state, in ladder order (the lifecycle a node walks on a run). */
export const NODE_STATES: readonly nodestate[] = ["pending", "running", "done", "failed", "skipped"];

/** One node of the graph: one step of the work, with its ports and its state. */
export interface graphnode {
  /** The stable identity of the node inside its graph. */
  id: string;
  /** The kind the node wears (the role the surfaces draw). */
  kind: nodekind;
  /** The human label of the step. */
  label: string;
  /** The declared input port names the node receives wires on. */
  inputs: readonly string[];
  /** The declared output port names the node hands wires out on. */
  outputs: readonly string[];
  /** The state the node holds (pending until a run touches it). */
  state: nodestate;
}

/** One edge of the graph: the wire that carries the `port` output of `from` into `to`. */
export interface graphedge {
  /** The id of the source node. */
  from: string;
  /** The id of the target node. */
  to: string;
  /** The output port of the source node the wire carries. */
  port: string;
}

/** The graph itself: the closed set of nodes and the wires between them. */
export interface nodegraph {
  nodes: readonly graphnode[];
  edges: readonly graphedge[];
}

/** One problem the validator found: a machine code, a human detail and the
 * node or edge the problem names. */
export interface graphproblem {
  code: "emptyid" | "duplicateid" | "selfedge" | "unknownnode" | "portmismatch" | "cycle" | "shape";
  detail: string;
  node?: string;
  edge?: number;
}

/** The full validation report of one graph. */
export interface graphreport {
  ok: boolean;
  problems: readonly graphproblem[];
  nodecount: number;
  edgecount: number;
  stagecount: number;
}

/* --------------------------------------------------------------------------
 * creation — the makers every surface and test builds graphs with
 * ------------------------------------------------------------------------ */

/**
 * Makes one node. The inputs and the outputs stay empty unless the options
 * name them, and the state starts pending. Example: `makenode("boot", "boot
 * banner", { kind: "stage", outputs: ["next"] })` answers the boot node.
 */
export function makenode(
  id: string,
  label: string,
  options?: { kind?: nodekind; inputs?: readonly string[]; outputs?: readonly string[]; state?: nodestate },
): graphnode {
  return {
    id,
    kind: options?.kind ?? "stage",
    label,
    inputs: options?.inputs ? [...options.inputs] : [],
    outputs: options?.outputs ? [...options.outputs] : [],
    state: options?.state ?? "pending",
  };
}

/** Makes one edge: the wire that carries the `port` output of `from` into `to`. Example: `makeedge("boot", "config", "next")`. */
export function makeedge(from: string, to: string, port: string): graphedge {
  return { from, to, port };
}

/** Makes a graph from nodes and edges (both optional — an empty graph is a valid graph). */
export function makegraph(nodes?: readonly graphnode[], edges?: readonly graphedge[]): nodegraph {
  return { nodes: nodes ? [...nodes] : [], edges: edges ? [...edges] : [] };
}

/* --------------------------------------------------------------------------
 * membership — the immutable edits the surfaces compose
 * ------------------------------------------------------------------------ */

/**
 * Adds (or replaces, by id) one node on the graph. Example: `addnode(graph,
 * makenode("ready", "ready", { kind: "sink" }))` answers the graph with the
 * sink in.
 */
export function addnode(graph: nodegraph, node: graphnode): nodegraph {
  const rest = graph.nodes.filter((entry) => entry.id !== node.id);
  return { ...graph, nodes: [...rest, node] };
}

/**
 * Adds one edge when both endpoints exist; unknown endpoints are refused and
 * the graph answers unchanged. Example: `addedge(graph, makeedge("a", "b",
 * "next"))` wires a into b on the port next.
 */
export function addedge(graph: nodegraph, edge: graphedge): nodegraph {
  if (!nodebyid(graph, edge.from) || !nodebyid(graph, edge.to)) return graph;
  return { ...graph, edges: [...graph.edges, edge] };
}

/**
 * Removes one node and every wire that touched it. Example: `removenode(graph,
 * "mcp")` answers the graph without the mcp step.
 */
export function removenode(graph: nodegraph, id: string): nodegraph {
  return {
    nodes: graph.nodes.filter((node) => node.id !== id),
    edges: graph.edges.filter((edge) => edge.from !== id && edge.to !== id),
  };
}

/** Removes the first edge that matches the triple; no match, no change. */
export function removeedge(graph: nodegraph, edge: graphedge): nodegraph {
  const index = graph.edges.findIndex((entry) => entry.from === edge.from && entry.to === edge.to && entry.port === edge.port);
  if (index < 0) return graph;
  return { ...graph, edges: graph.edges.filter((entry, at) => at !== index) };
}

/** Reads one node by id. Example: `nodebyid(graph, "engine")?.label`. */
export function nodebyid(graph: nodegraph, id: string): graphnode | undefined {
  return graph.nodes.find((node) => node.id === id);
}

/** Reads the insertion index of one node id, or -1 when the graph holds no such node. */
export function nodeindexof(graph: nodegraph, id: string): number {
  return graph.nodes.findIndex((node) => node.id === id);
}

/** Reads every wire that leaves one node (the node hands them out). */
export function edgesfrom(graph: nodegraph, id: string): graphedge[] {
  return graph.edges.filter((edge) => edge.from === id);
}

/** Reads every wire that arrives at one node. */
export function edgesto(graph: nodegraph, id: string): graphedge[] {
  return graph.edges.filter((edge) => edge.to === id);
}

/** Reads every wire that touches one node on either end. */
export function edgesof(graph: nodegraph, id: string): graphedge[] {
  return graph.edges.filter((edge) => edge.from === id || edge.to === id);
}

/** The number of nodes the graph holds. */
export function nodecount(graph: nodegraph): number {
  return graph.nodes.length;
}

/** The number of wires the graph holds. */
export function edgecount(graph: nodegraph): number {
  return graph.edges.length;
}

/* --------------------------------------------------------------------------
 * ports — the declared sockets the wires ride
 * ------------------------------------------------------------------------ */

/** Answers whether the node declares one output port. */
export function hasoutputport(node: graphnode, port: string): boolean {
  return node.outputs.includes(port);
}

/** Answers whether the node declares one input port. */
export function hasinputport(node: graphnode, port: string): boolean {
  return node.inputs.includes(port);
}

/**
 * Reads the first output port of `from` no wire leaves on yet — the port the
 * next wire should ride. Undefined when every declared port is wired or the
 * node declares none. Example: `freeoutputport(graph, "engine")`.
 */
export function freeoutputport(graph: nodegraph, from: string): string | undefined {
  const node = nodebyid(graph, from);
  if (!node) return undefined;
  const taken = new Set(edgesfrom(graph, from).map((edge) => edge.port));
  return node.outputs.find((port) => !taken.has(port));
}

/**
 * Connects two nodes with one checked wire: the port rides the first free
 * output of the source (or the named port) and the graph answers with the
 * edge — or with `ok: false` and the reason. Example: `connectnodes(graph,
 * "engine", "gateway")`.
 */
export function connectnodes(
  graph: nodegraph,
  from: string,
  to: string,
  port?: string,
): { ok: boolean; graph: nodegraph; problem?: string } {
  const source = nodebyid(graph, from);
  const target = nodebyid(graph, to);
  if (!source || !target) return { ok: false, graph, problem: "unknownnode" };
  if (from === to) return { ok: false, graph, problem: "selfedge" };
  const chosen = port ?? freeoutputport(graph, from);
  if (!chosen || !hasoutputport(source, chosen)) return { ok: false, graph, problem: "portmismatch" };
  return { ok: true, graph: { ...graph, edges: [...graph.edges, makeedge(from, to, chosen)] } };
}

/* --------------------------------------------------------------------------
 * relations — the neighborhood of one node
 * ------------------------------------------------------------------------ */

/** Reads the direct targets of one node, deduplicated in stable order. */
export function downstream(graph: nodegraph, id: string): string[] {
  const seen: string[] = [];
  for (const edge of graph.edges) {
    if (edge.from === id && !seen.includes(edge.to)) seen.push(edge.to);
  }
  return seen;
}

/** Reads the direct sources of one node, deduplicated in stable order. */
export function upstream(graph: nodegraph, id: string): string[] {
  const seen: string[] = [];
  for (const edge of graph.edges) {
    if (edge.to === id && !seen.includes(edge.from)) seen.push(edge.from);
  }
  return seen;
}

/** Reads every node one node can reach forward (transitive, self excluded). */
export function descendants(graph: nodegraph, id: string): string[] {
  const seen = new Set<string>();
  const queue = [...downstream(graph, id)];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) break;
    if (seen.has(current)) continue;
    seen.add(current);
    for (const next of downstream(graph, current)) queue.push(next);
  }
  return [...seen];
}

/** Reads every node that can reach one node (transitive, self excluded). */
export function ancestors(graph: nodegraph, id: string): string[] {
  const seen = new Set<string>();
  const queue = [...upstream(graph, id)];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) break;
    if (seen.has(current)) continue;
    seen.add(current);
    for (const next of upstream(graph, current)) queue.push(next);
  }
  return [...seen];
}

/** Reads the nodes with no incoming wire — where the stages start. */
export function rootnodes(graph: nodegraph): graphnode[] {
  return graph.nodes.filter((node) => upstream(graph, node.id).length === 0);
}

/** Reads the nodes with no outgoing wire — where the stages land. */
export function leafnodes(graph: nodegraph): graphnode[] {
  return graph.nodes.filter((node) => downstream(graph, node.id).length === 0);
}

/** Reads the wire degree of one node: how many wires arrive and how many leave. */
export function degreeof(graph: nodegraph, id: string): { incoming: number; outgoing: number } {
  return { incoming: edgesto(graph, id).length, outgoing: edgesfrom(graph, id).length };
}

/* --------------------------------------------------------------------------
 * layers — the stages (the owner asked the logics to run on them)
 * ------------------------------------------------------------------------ */

/**
 * Layers the graph into topological levels (the longest-path layering): roots
 * ride level 0 and every node rides one past its deepest feeder. Cycle
 * members (impossible to place) ride one past the deepest resolved level so
 * the drawing still answers a full map. Stable: same graph, same levels.
 */
export function nodelevels(graph: nodegraph): Record<string, number> {
  const levels: Record<string, number> = {};
  const resolved = new Set<string>();
  let placed = true;
  while (placed) {
    placed = false;
    for (const node of graph.nodes) {
      if (resolved.has(node.id)) continue;
      const feeders = upstream(graph, node.id);
      if (feeders.every((feeder) => resolved.has(feeder))) {
        const deepest = feeders.reduce((max, feeder) => Math.max(max, levels[feeder] ?? 0), -1);
        levels[node.id] = deepest + 1;
        resolved.add(node.id);
        placed = true;
      }
    }
  }
  // the cycle members ride one past the deepest resolved level (never stuck)
  const floor = resolved.size === 0 ? 0 : Math.max(...graph.nodes.filter((n) => resolved.has(n.id)).map((n) => levels[n.id] ?? 0));
  for (const node of graph.nodes) {
    if (!resolved.has(node.id)) levels[node.id] = floor + 1;
  }
  return levels;
}

/** Groups the nodes into the stage waves: one wave per level, nodes inside a wave in insertion order. */
export function stagewaves(graph: nodegraph): string[][] {
  const levels = nodelevels(graph);
  const waves: string[][] = [];
  for (const node of graph.nodes) {
    const level = levels[node.id] ?? 0;
    while (waves.length <= level) waves.push([]);
    waves[level]?.push(node.id);
  }
  return waves;
}

/** The flat topological order of the graph (the waves, one after the other). */
export function topologicalorder(graph: nodegraph): string[] {
  return stagewaves(graph).flat();
}

/** The number of stages the graph runs on (the depth of the layering). */
export function stagecount(graph: nodegraph): number {
  return stagewaves(graph).length;
}

/** The graph depth — an alias of stagecount with the empty graph answering 0. */
export function graphdepth(graph: nodegraph): number {
  return stagecount(graph);
}

/* --------------------------------------------------------------------------
 * cycles — the closed walks the validator refuses
 * ------------------------------------------------------------------------ */

/**
 * Finds one cycle of the graph and answers it as the walked id path (the
 * first node repeats at the end); an acyclic graph answers an empty path.
 * Deterministic: the walk follows the insertion order of the nodes and edges.
 */
export function findcycle(graph: nodegraph): string[] {
  const color = new Map<string, 1 | 2>();
  const path: string[] = [];
  let found: string[] = [];
  const visit = (id: string): void => {
    if (found.length > 0) return;
    color.set(id, 1);
    path.push(id);
    for (const next of downstream(graph, id)) {
      const state = color.get(next);
      if (state === 1) {
        const start = path.indexOf(next);
        found = [...path.slice(start), next];
        return;
      }
      if (state === undefined) visit(next);
      if (found.length > 0) return;
    }
    path.pop();
    color.set(id, 2);
  };
  for (const node of graph.nodes) {
    if (!color.has(node.id)) visit(node.id);
    if (found.length > 0) break;
  }
  return found;
}

/** Answers whether the graph holds at least one cycle. */
export function hascycle(graph: nodegraph): boolean {
  return findcycle(graph).length > 0;
}

/* --------------------------------------------------------------------------
 * subgraphs — the slices the view collapses and the tests isolate
 * ------------------------------------------------------------------------ */

/**
 * Induces the subgraph of the named ids: the nodes inside the set and the
 * wires whose both ends ride inside it. Example: `subgraph(graph,
 * descendants(graph, "engine"))`.
 */
export function subgraph(graph: nodegraph, ids: readonly string[]): nodegraph {
  const inside = new Set(ids);
  return {
    nodes: graph.nodes.filter((node) => inside.has(node.id)),
    edges: graph.edges.filter((edge) => inside.has(edge.from) && inside.has(edge.to)),
  };
}

/** Induces the subgraph of one node plus everything it can reach forward. */
export function descendantsubgraph(graph: nodegraph, id: string): nodegraph {
  return subgraph(graph, [id, ...descendants(graph, id)]);
}

/** Induces the subgraph of one node plus everything that can reach it. */
export function ancestorsubgraph(graph: nodegraph, id: string): nodegraph {
  return subgraph(graph, [id, ...ancestors(graph, id)]);
}

/* --------------------------------------------------------------------------
 * validation — the report the gates and the parsers answer
 * ------------------------------------------------------------------------ */

/**
 * Validates the whole graph: empty ids, duplicate ids, self wires, wires
 * naming unknown endpoints, wires riding ports the source never declared and
 * cycles. The report carries the machine problems, the counts and the stage
 * count. Example: `validategraph(graph).ok`.
 */
export function validategraph(graph: nodegraph): graphreport {
  const problems: graphproblem[] = [];
  const seen = new Set<string>();
  for (const [index, node] of graph.nodes.entries()) {
    if (node.id.trim().length === 0) problems.push({ code: "emptyid", detail: "a node carries an empty id", node: `#${index}` });
    if (seen.has(node.id)) problems.push({ code: "duplicateid", detail: `the id ${node.id} rides two nodes`, node: node.id });
    seen.add(node.id);
  }
  for (const [index, edge] of graph.edges.entries()) {
    if (edge.from === edge.to) problems.push({ code: "selfedge", detail: `the node ${edge.from} wires itself`, node: edge.from, edge: index });
    if (!seen.has(edge.from) || !seen.has(edge.to)) {
      problems.push({ code: "unknownnode", detail: `the wire ${index} names an endpoint the graph holds no node for`, edge: index });
      continue;
    }
    const source = nodebyid(graph, edge.from);
    if (source && !hasoutputport(source, edge.port)) {
      problems.push({ code: "portmismatch", detail: `the wire ${index} rides the port ${edge.port} the source never declared`, node: edge.from, edge: index });
    }
  }
  const cycle = findcycle(graph);
  if (cycle.length > 0) problems.push({ code: "cycle", detail: `the walk ${cycle.join(" -> ")} closes on itself` });
  return {
    ok: problems.length === 0,
    problems,
    nodecount: nodecount(graph),
    edgecount: edgecount(graph),
    stagecount: stagecount(graph),
  };
}

/* --------------------------------------------------------------------------
 * states — the model side of the run ladder
 * ------------------------------------------------------------------------ */

/**
 * Answers the state of one node with a fresh graph where only that node
 * changed. Example: `withnodestate(graph, "gateway", "running")`.
 */
export function withnodestate(graph: nodegraph, id: string, state: nodestate): nodegraph {
  return { ...graph, nodes: graph.nodes.map((node) => (node.id === id ? { ...node, state } : node)) };
}

/**
 * Answers a graph with a whole state map applied (unknown ids are ignored).
 * Example: `withnodestates(graph, view.nodestates)`.
 */
export function withnodestates(graph: nodegraph, states: Readonly<Record<string, nodestate>>): nodegraph {
  return { ...graph, nodes: graph.nodes.map((node) => (node.id in states ? { ...node, state: states[node.id] as nodestate } : node)) };
}

/** Answers the graph with every node back on the given state (pending by default). */
export function resetnodestates(graph: nodegraph, state: nodestate = "pending"): nodegraph {
  return { ...graph, nodes: graph.nodes.map((node) => ({ ...node, state })) };
}

/** Counts the nodes per state of the model ladder. */
export function statecounts(graph: nodegraph): Record<nodestate, number> {
  const counts: Record<nodestate, number> = { pending: 0, running: 0, done: 0, failed: 0, skipped: 0 };
  for (const node of graph.nodes) counts[node.state] += 1;
  return counts;
}

/** Answers whether one state is settled (the run already decided the node). */
export function issettled(state: nodestate): boolean {
  return state === "done" || state === "failed" || state === "skipped";
}

/** Answers whether every node of the graph finished done. */
export function graphcomplete(graph: nodegraph): boolean {
  return graph.nodes.length > 0 && graph.nodes.every((node) => node.state === "done");
}

/* --------------------------------------------------------------------------
 * serialization — the JSON round trip (stable, typed, validated)
 * ------------------------------------------------------------------------ */

/** Answers a structural deep copy of the graph (no JSON string in the middle). */
export function clonegraph(graph: nodegraph): nodegraph {
  return {
    nodes: graph.nodes.map((node) => ({ ...node, inputs: [...node.inputs], outputs: [...node.outputs] })),
    edges: graph.edges.map((edge) => ({ ...edge })),
  };
}

/**
 * Serializes the graph to JSON exactly as it stands (the stable identity the
 * fingerprints and the storage read). Example: `serializegraph(graph)`.
 */
export function serializegraph(graph: nodegraph): string {
  return JSON.stringify({ nodes: graph.nodes, edges: graph.edges });
}

/** Answers whether one unknown value carries the nodegraph shape. */
export function isnodegraph(value: unknown): value is nodegraph {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<nodegraph>;
  if (!Array.isArray(candidate.nodes) || !Array.isArray(candidate.edges)) return false;
  return (
    candidate.nodes.every(
      (node) =>
        typeof node === "object" &&
        node !== null &&
        typeof (node as graphnode).id === "string" &&
        typeof (node as graphnode).label === "string" &&
        Array.isArray((node as graphnode).inputs) &&
        Array.isArray((node as graphnode).outputs),
    ) &&
    candidate.edges.every(
      (edge) => typeof edge === "object" && edge !== null && typeof (edge as graphedge).from === "string" && typeof (edge as graphedge).to === "string",
    )
  );
}

/**
 * Parses one graph out of JSON and validates it, throwing one Error that
 * names every problem when the payload is not a valid graph. Example:
 * `parsegraph(serializegraph(graph))` answers an equal graph.
 */
export function parsegraph(json: string): nodegraph {
  const attempt = tryparsegraph(json);
  if (!attempt.ok) {
    throw new Error(`graphnodes: invalid graph json — ${attempt.problems.map((problem) => problem.code).join(", ")}`);
  }
  return attempt.graph;
}

/** The quiet parse: answers the graph or the report of problems, never throws. */
export function tryparsegraph(json: string): { ok: true; graph: nodegraph } | { ok: false; problems: graphproblem[] } {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    return { ok: false, problems: [{ code: "shape", detail: "the payload is not json" }] };
  }
  if (!isnodegraph(value)) {
    return { ok: false, problems: [{ code: "shape", detail: "the payload does not carry the nodegraph shape" }] };
  }
  const graph = clonegraph({ nodes: value.nodes as graphnode[], edges: value.edges as graphedge[] });
  const report = validategraph(graph);
  if (!report.ok) return { ok: false, problems: [...report.problems] };
  return { ok: true, graph };
}

/**
 * Answers the stable fingerprint of the graph: the djb2 hash of the canonical
 * form (nodes sorted by id, edges sorted by the from/to/port triple), so two
 * graphs built in different orders but equal in content answer equal prints.
 */
export function graphfingerprint(graph: nodegraph): string {
  const canonical = {
    nodes: [...graph.nodes].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)).map((node) => [node.id, node.kind, node.label, [...node.inputs], [...node.outputs]]),
    edges: [...graph.edges].map((edge) => [edge.from, edge.to, edge.port]).sort((a, b) => (a.join("|") < b.join("|") ? -1 : 1)),
  };
  const text = JSON.stringify(canonical);
  let hash = 5381;
  for (const character of text) {
    const code = character.codePointAt(0) ?? 0;
    hash = ((hash * 33) ^ code) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/* ===== block: graphrunner ===== */
/**
 * graphrunner — the stage engine of the devthink graphs (root layer, pure
 * typescript).
 *
 * The owner law: "the logics must run stage by stage". The runner walks the
 * graph exactly the way graphnodes.ts layers it: one wave per stage, the
 * nodes of a stage in the stable insertion order of the model, never a
 * nondeterministic promise pool — the run is one straight await chain, so the
 * same graph with the same handler always produces the same event sequence.
 * Every node holds one state of the model ladder (pending → running → done |
 * failed, with skipped for everything a failure strands), a failing node
 * retries a fixed number of attempts before it strands the rest of the run,
 * and the view aggregates the whole run into one progress percentage the
 * surfaces draw. The engine owns no clock and no work: the handler is the
 * caller's logic (sync or async), the pause between stages is an option the
 * caller injects, and the engine only sequences — deterministically, with an
 * event and a view callback on every transition.
 */



/** The status of the whole run: idle before it starts, running on the waves, done or failed at the end. */
export type runstatus = "idle" | "running" | "done" | "failed";

/** The kinds of event the engine answers on the onevent callback, in run order. */
export type runeventtype = "runbegin" | "stagebegin" | "nodestart" | "nodeattempt" | "nodedone" | "nodefailed" | "nodeskipped" | "stageend" | "runend";

/** One event of the run: the kind, the stage it rode, the node it touched, the attempt number and the run progress at the moment. */
export interface runevent {
  type: runeventtype;
  /** The zero-based stage (wave) the event rode. */
  stage: number;
  /** The node the event touched (absent on the run and stage markers). */
  nodeid?: string;
  /** The attempt number (1-based) on the attempt and failure events. */
  attempt?: number;
  /** The human detail (the failure message a handler threw). */
  message?: string;
  /** The aggregated progress of the run at the moment (0..100). */
  progress: number;
}

/** One immutable snapshot of the run: the stage map, the node states, the counters and the aggregated progress. */
export interface runstageview {
  status: runstatus;
  /** The stage the run stands on (0-based; equals stagecount when settled). */
  stageindex: number;
  /** The stage waves of the graph (the stages, stable order). */
  stages: readonly (readonly string[])[];
  /** The state of every node of the graph. */
  nodestates: Readonly<Record<string, nodestate>>;
  /** How many nodes settled done. */
  donecount: number;
  /** How many nodes settled failed. */
  failedcount: number;
  /** How many nodes settled skipped (stranded by a failure). */
  skippedcount: number;
  /** How many nodes the run walks. */
  totalcount: number;
  /** The aggregated progress (0..100): the done share of the walk. */
  progress: number;
  /** The failure that stranded the run (status failed only). */
  failure?: { nodeid: string; message: string };
}

/** The options of one run: the caller injects the work, the cadence and the callbacks. */
export interface runneroptions {
  /** The work of one node — sync or async; absent, the node just passes. */
  handler?: (node: graphnode) => void | Promise<void>;
  /** The extra attempts after the first one (0 = run once, the default). */
  retry?: number;
  /** The pause in ms between stages — the caller's cadence, injected (0 by default). */
  stagegap?: number;
  /** The view callback: every state transition answers one fresh snapshot. */
  onview?: (view: runstageview) => void;
  /** The event callback: every transition answers one event, in run order. */
  onevent?: (event: runevent) => void;
}

/** One staged runner over one graph: the view reads anytime, run walks the stages. */
export interface graphrunner {
  /** The graph the runner walks (as given). */
  readonly graph: nodegraph;
  /** The options the run rides (as given). */
  readonly options: runneroptions;
  /** Reads the current snapshot without touching the run. */
  view(): runstageview;
  /** Walks the stages once; a second call on a settled runner answers the settled view unchanged. */
  run(): Promise<runstageview>;
}

/** Counts the settled shares of a state map and answers the aggregated progress (0..100). */
export function viewprogress(nodestates: Readonly<Record<string, nodestate>>): number {
  const ids = Object.keys(nodestates);
  if (ids.length === 0) return 0;
  let done = 0;
  for (const id of ids) {
    if (nodestates[id] === "done") done += 1;
  }
  return Math.round((done / ids.length) * 100);
}

/** Builds the initial view of one graph: every node pending, progress zero, the stages layered and stable. */
export function initialview(graph: nodegraph): runstageview {
  const stages = stagewaves(graph);
  const nodestates: Record<string, nodestate> = {};
  for (const node of graph.nodes) nodestates[node.id] = "pending";
  return {
    status: "idle",
    stageindex: 0,
    stages,
    nodestates,
    donecount: 0,
    failedcount: 0,
    skippedcount: 0,
    totalcount: graph.nodes.length,
    progress: 0,
  };
}

/** Reads the stage index one node rides on a view (0-based), or -1 when the view holds no such node. */
export function stageofnode(view: runstageview, nodeid: string): number {
  for (const [index, wave] of view.stages.entries()) {
    if (wave.includes(nodeid)) return index;
  }
  return -1;
}

/** The pause the engine itself takes: the injected stage gap (never a timer the module owns). */
function pause(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Creates the staged runner of one graph. The view starts idle with every
 * node pending; run() walks the waves in order — the nodes of a wave one
 * after the other in the stable insertion order, each one retried up to the
 * retry budget, the view and the events answered on every transition. One
 * failure after the last attempt strands the run: the stranded nodes settle
 * skipped, the status settles failed and the failure names the node and the
 * message. Example: `createrunner(graph, { handler, onview: setrunview })`.
 */
export function createrunner(graph: nodegraph, options: runneroptions = {}): graphrunner {
  let current: runstageview = initialview(graph);
  let started = false;
  const emit = (view: runstageview): void => {
    current = view;
    options.onview?.(view);
  };
  const event = (partial: Omit<runevent, "progress">): void => {
    options.onevent?.({ ...partial, progress: current.progress });
  };
  const counts = (nodestates: Readonly<Record<string, nodestate>>) => {
    let donecount = 0;
    let failedcount = 0;
    let skippedcount = 0;
    for (const id of Object.keys(nodestates)) {
      if (nodestates[id] === "done") donecount += 1;
      else if (nodestates[id] === "failed") failedcount += 1;
      else if (nodestates[id] === "skipped") skippedcount += 1;
    }
    return { donecount, failedcount, skippedcount };
  };
  const viewof = (base: Omit<runstageview, "donecount" | "failedcount" | "skippedcount" | "progress" | "totalcount">): runstageview => {
    const tally = counts(base.nodestates);
    return {
      ...base,
      nodestates: { ...base.nodestates },
      ...tally,
      totalcount: graph.nodes.length,
      progress: viewprogress(base.nodestates),
    };
  };
  return {
    graph,
    options,
    view: () => current,
    async run(): Promise<runstageview> {
      if (started) return current;
      started = true;
      const stages = current.stages;
      const nodestates: Record<string, nodestate> = { ...current.nodestates };
      const retry = Math.max(0, Math.floor(options.retry ?? 0));
      const stagegap = Math.max(0, options.stagegap ?? 0);
      emit(viewof({ status: "running", stageindex: 0, stages, nodestates }));
      event({ type: "runbegin", stage: 0 });
      for (const [index, wave] of stages.entries()) {
        emit(viewof({ status: "running", stageindex: index, stages, nodestates }));
        event({ type: "stagebegin", stage: index });
        for (const nodeid of wave) {
          const node = nodebyid(graph, nodeid);
          if (!node) continue;
          nodestates[nodeid] = "running";
          emit(viewof({ status: "running", stageindex: index, stages, nodestates }));
          event({ type: "nodestart", stage: index, nodeid });
          let settled = false;
          let message: string | undefined;
          for (let attempt = 1; attempt <= retry + 1 && !settled; attempt += 1) {
            if (attempt > 1) event({ type: "nodeattempt", stage: index, nodeid, attempt });
            try {
              await options.handler?.(node);
              settled = true;
            } catch (error) {
              message = error instanceof Error ? error.message : String(error);
            }
          }
          if (settled) {
            nodestates[nodeid] = "done";
            emit(viewof({ status: "running", stageindex: index, stages, nodestates }));
            event({ type: "nodedone", stage: index, nodeid });
            continue;
          }
          nodestates[nodeid] = "failed";
          emit(viewof({ status: "running", stageindex: index, stages, nodestates }));
          event({ type: "nodefailed", stage: index, nodeid, attempt: retry + 1, message });
          for (const waveid of stages.slice(index).flat()) {
            if (nodestates[waveid] === "pending" || nodestates[waveid] === "running") {
              nodestates[waveid] = "skipped";
              emit(viewof({ status: "running", stageindex: index, stages, nodestates }));
              event({ type: "nodeskipped", stage: index, nodeid: waveid });
            }
          }
          const failure = { nodeid, message: message ?? "the node failed without a message" };
          const settledview = viewof({ status: "failed", stageindex: stages.length, stages, nodestates, failure });
          emit(settledview);
          event({ type: "stageend", stage: index });
          event({ type: "runend", stage: stages.length });
          return settledview;
        }
        event({ type: "stageend", stage: index });
        if (stagegap > 0 && index < stages.length - 1) await pause(stagegap);
      }
      const settledview = viewof({ status: "done", stageindex: stages.length, stages, nodestates });
      emit(settledview);
      event({ type: "runend", stage: stages.length });
      return settledview;
    },
  };
}

/**
 * Resets one runner view to the idle start (every node pending) — the pure
 * answer for surfaces that rerun the same graph with a fresh runner. Example:
 * `resetview(initialview(graph))` is an identity; the helper exists so the
 * surfaces read one name.
 */
export function resetview(graph: nodegraph): runstageview {
  return initialview(resetnodestates(graph));
}

/* ===== block: graphviewstate ===== */
/**
 * graphviewstate — the pure view state of the graph drawing (root layer, pure
 * typescript).
 *
 * The drawing of a graph is a state, and the state is pure: this module
 * answers the positions of the nodes on the topological layers (x rides the
 * stage, y rides the stable row inside the stage), the selection of one node
 * and the collapse of subgraphs (one collapsed node hides its whole
 * descendant slice until it expands again). No DOM, no React, no randomness —
 * graphview.tsx (the SVG surface) consumes the answers of this module the
 * way graphrunner.ts consumes the model, and the same graph with the same
 * options always answers the same positions. Layout math stays here so the
 * surface never improvises geometry.
 */



/** One drawn position: the x/y on the view canvas plus the layer and the row that produced them. */
export interface viewposition {
  x: number;
  y: number;
  /** The topological layer (the stage) the node rides. */
  layer: number;
  /** The row inside the layer (the stable order the node draws at). */
  row: number;
}

/** The pure state of one drawn graph: the positions, the selection and the collapsed roots. */
export interface graphviewstate {
  /** The drawn position of every node of the graph. */
  positions: Readonly<Record<string, viewposition>>;
  /** The id of the selected node (null = nothing selected). */
  selection: string | null;
  /** The ids of the nodes whose descendant slice is collapsed. */
  collapsed: readonly string[];
}

/** The layout options: the card pitch of the layered columns and rows and the origin of the map. */
export interface layoutoptions {
  /** The horizontal pitch between stages (columns), in view units. */
  columnwidth?: number;
  /** The vertical pitch between nodes of one stage (rows), in view units. */
  rowheight?: number;
  /** The x of the first column. */
  originx?: number;
  /** The y of the first row. */
  originy?: number;
  /** An optional stable row order (ids listed earlier draw higher inside their wave). */
  order?: readonly string[];
}

/** The bounds of one drawn map: the box the svg viewBox rides. */
export interface viewbounds {
  minx: number;
  miny: number;
  width: number;
  height: number;
}

/**
 * Lays one graph out on the topological layers: x rides the stage (one
 * column per layer), y rides the stable row inside the stage (insertion
 * order, or the given order first). Example: `layoutgraphview(graph,
 * { columnwidth: 240, rowheight: 96 })`.
 */
export function layoutgraphview(graph: nodegraph, options: layoutoptions = {}): Record<string, viewposition> {
  const columnwidth = Math.max(1, options.columnwidth ?? 240);
  const rowheight = Math.max(1, options.rowheight ?? 96);
  const originx = options.originx ?? 0;
  const originy = options.originy ?? 0;
  const order = new Map((options.order ?? []).map((id, index) => [id, index]));
  const positions: Record<string, viewposition> = {};
  const waves = stagewaves(graph);
  waves.forEach((wave, layer) => {
    const sorted = [...wave].sort((a, b) => (order.get(a) ?? Number.MAX_SAFE_INTEGER) - (order.get(b) ?? Number.MAX_SAFE_INTEGER));
    sorted.forEach((id, row) => {
      positions[id] = { x: originx + layer * columnwidth, y: originy + row * rowheight, layer, row };
    });
  });
  return positions;
}

/**
 * Builds the initial view state of one graph: the layered positions, nothing
 * selected, nothing collapsed. Example: `makeviewstate(graph)`.
 */
export function makeviewstate(graph: nodegraph, options: layoutoptions = {}): graphviewstate {
  return { positions: layoutgraphview(graph, options), selection: null, collapsed: [] };
}

/** Answers the view with one selection (the id must be a drawn node; null clears). */
export function withselection(state: graphviewstate, id: string | null): graphviewstate {
  if (id !== null && !(id in state.positions)) return state;
  return { ...state, selection: id };
}

/** Answers the view with the selection toggled on one node (select, or clear when it already rides). */
export function togglenodeselection(state: graphviewstate, id: string): graphviewstate {
  return withselection(state, state.selection === id ? null : id);
}

/**
 * Collapses one node: its whole descendant slice hides until it expands.
 * Nodes without descendants refuse the collapse (nothing to hide) and the
 * view answers unchanged. Example: `collapsenode(state, graph, "engine")`.
 */
export function collapsenode(state: graphviewstate, graph: nodegraph, id: string): graphviewstate {
  if (!(id in state.positions) || state.collapsed.includes(id)) return state;
  if (descendants(graph, id).length === 0) return state;
  return { ...state, collapsed: [...state.collapsed, id] };
}

/** Expands one collapsed node (its slice draws again); unknown or open ids answer unchanged. */
export function expandnode(state: graphviewstate, id: string): graphviewstate {
  if (!state.collapsed.includes(id)) return state;
  return { ...state, collapsed: state.collapsed.filter((entry) => entry !== id) };
}

/** Toggles the collapse of one node (collapse when open, expand when collapsed). */
export function togglenodecollapse(state: graphviewstate, graph: nodegraph, id: string): graphviewstate {
  return state.collapsed.includes(id) ? expandnode(state, id) : collapsenode(state, graph, id);
}

/** Reads the hidden ids one collapsed root owns: its descendants (the root itself stays drawn). */
export function collapsedslice(graph: nodegraph, root: string): string[] {
  return descendants(graph, root);
}

/** Reads every hidden id of the view: the descendants of all collapsed roots, roots excluded, deduplicated. */
export function hiddenids(state: graphviewstate, graph: nodegraph): string[] {
  const hidden = new Set<string>();
  for (const root of state.collapsed) {
    for (const id of collapsedslice(graph, root)) hidden.add(id);
  }
  return [...hidden];
}

/** Answers whether one node is currently hidden by a collapse. */
export function ishidden(state: graphviewstate, graph: nodegraph, id: string): boolean {
  return hiddenids(state, graph).includes(id);
}

/**
 * Answers the visible slice of the graph: the nodes not hidden by a collapse
 * and the wires whose both ends stay visible — the exact graph the surface
 * draws. Example: `visiblegraph(state, graph)`.
 */
export function visiblegraph(state: graphviewstate, graph: nodegraph): nodegraph {
  const hidden = new Set(hiddenids(state, graph));
  return {
    nodes: graph.nodes.filter((node) => !hidden.has(node.id)),
    edges: graph.edges.filter((edge) => !hidden.has(edge.from) && !hidden.has(edge.to)),
  };
}

/** Counts the descendants one collapsed node hides (the badge the card draws). */
export function collapsecount(state: graphviewstate, graph: nodegraph, id: string): number {
  if (!state.collapsed.includes(id)) return 0;
  return collapsedslice(graph, id).length;
}

/** Answers the positions of the visible nodes only (the hidden ones leave the map). */
export function visiblepositions(state: graphviewstate, graph: nodegraph): Record<string, viewposition> {
  const hidden = new Set(hiddenids(state, graph));
  const positions: Record<string, viewposition> = {};
  for (const [id, position] of Object.entries(state.positions)) {
    if (!hidden.has(id)) positions[id] = position;
  }
  return positions;
}

/**
 * Answers the bounds box of a drawn map: the min corner and the size the svg
 * viewBox rides, grown by the card box and the padding so the outer cards
 * never touch the edge. Example: `viewbounds(state.positions, { cardwidth:
 * 176, cardheight: 56, padding: 24 })`.
 */
export function viewbounds(
  positions: Readonly<Record<string, viewposition>>,
  options: { cardwidth?: number; cardheight?: number; padding?: number } = {},
): viewbounds {
  const cardwidth = options.cardwidth ?? 176;
  const cardheight = options.cardheight ?? 56;
  const padding = options.padding ?? 24;
  const entries = Object.values(positions);
  if (entries.length === 0) return { minx: 0, miny: 0, width: cardwidth + padding * 2, height: cardheight + padding * 2 };
  const minx = Math.min(...entries.map((position) => position.x)) - padding;
  const miny = Math.min(...entries.map((position) => position.y)) - padding;
  const maxx = Math.max(...entries.map((position) => position.x + cardwidth)) + padding;
  const maxy = Math.max(...entries.map((position) => position.y + cardheight)) + padding;
  return { minx, miny, width: maxx - minx, height: maxy - miny };
}
