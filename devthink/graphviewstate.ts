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

import { type nodegraph, descendants, stagewaves } from "./graphnodes.ts";

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
