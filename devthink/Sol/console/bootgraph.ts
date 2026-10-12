/**
 * bootgraph — the boot stages of the devthink cli as one node graph (the
 * console page catalog).
 *
 * The terminal of this page replays the boot lines line by line; the graph
 * beside it rides the same boot as STAGES: one node per boot step (the
 * banner, the config checkpoint, the engine surfaces, the gateway, the mcp
 * listener, the palette and the ready sink), one wire per hand-off, and the
 * engine/gateway/mcp/palette wave running as one topological stage after the
 * engine arms. The catalog of stages lives here and nowhere else; the model
 * comes from the root graphnodes.ts and the walk from graphrunner.ts — this
 * file only declares what the boot is, so the page draws and runs the real
 * shape (banner → config → engine → the three surfaces → ready).
 */
import { type nodegraph, connectnodes, makenode } from "../../graphnodes.js";
import { bootdelay } from "./boot.ts";

/** One boot stage of the catalog: the graph node fields plus the one-line note the ledger reads. */
export interface bootstageentry {
  id: string;
  kind: "stage" | "gate" | "tool" | "sink";
  label: string;
  note: string;
}

/** The boot stage catalog of the cli, in ride order (the graph builds from it). */
export const BOOTSTAGES: readonly bootstageentry[] = [
  { id: "banner", kind: "stage", label: "boot banner", note: "the entry banner and the usage line print" },
  { id: "config", kind: "gate", label: "config gate", note: "the global state reads .devthink/config.json" },
  { id: "engine", kind: "tool", label: "engine arm", note: "plan review, consent gates, sealed log chain" },
  { id: "gateway", kind: "tool", label: "gateway pair", note: "the loopback provider gateway answers the workbench" },
  { id: "mcp", kind: "tool", label: "mcp listen", note: "stdio + http listener arms on 127.0.0.1:7436" },
  { id: "palette", kind: "tool", label: "palette share", note: "the shared command registry rides the surfaces" },
  { id: "ready", kind: "sink", label: "ready", note: "the console invites the first command" },
];

/** The hand-offs of the boot: the wires the graph carries (banner feeds config, config feeds the engine, the engine arms the three surfaces, every surface feeds ready). */
export const BOOTWIRES: readonly [string, string][] = [
  ["banner", "config"],
  ["config", "engine"],
  ["engine", "gateway"],
  ["engine", "mcp"],
  ["engine", "palette"],
  ["gateway", "ready"],
  ["mcp", "ready"],
  ["palette", "ready"],
];

/**
 * Builds the boot graph: one node per catalog stage (input port `in`, output
 * port `next`), one wire per hand-off riding the `next` port. Deterministic:
 * the same catalog always answers the same graph, layered banner → config →
 * engine → {gateway, mcp, palette} → ready.
 */
export function bootgraph(): nodegraph {
  let graph: nodegraph = { nodes: [], edges: [] };
  for (const entry of BOOTSTAGES) {
    graph = {
      ...graph,
      nodes: [...graph.nodes, makenode(entry.id, entry.label, { kind: entry.kind, inputs: ["in"], outputs: ["next"] })],
    };
  }
  for (const [from, to] of BOOTWIRES) {
    const ride = connectnodes(graph, from, to, "next");
    if (ride.ok) graph = ride.graph;
  }
  return graph;
}

/** The stage gap between the boot waves — the cadence the graph ride reads (ms, the caller injects it). */
export const BOOT_STAGE_GAP = 260;

/**
 * The handler the runner calls for one boot stage: the stage waits on the
 * same 28–62ms line cadence the terminal boot prints with, so the graph and
 * the terminal ride one boot voice. The handler is the only async part —
 * the engine stays clock-free.
 */
export async function bootrunnerhandler(): Promise<void> {
  await bootdelay();
}
