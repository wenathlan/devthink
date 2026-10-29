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
