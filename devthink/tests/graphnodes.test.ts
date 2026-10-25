import { describe, expect, it } from "vitest";
import {
  addnode,
  addedge,
  ancestors,
  connectnodes,
  descendants,
  edgecount,
  edgesfrom,
  findcycle,
  graphcomplete,
  graphfingerprint,
  hascycle,
  issettled,
  leafnodes,
  makenode,
  makeedge,
  makegraph,
  nodebyid,
  nodecount,
  nodelevels,
  removenode,
  removeedge,
  resetnodestates,
  rootnodes,
  serializegraph,
  stagewaves,
  statecounts,
  topologicalorder,
  tryparsegraph,
  validategraph,
  withnodestate,
  withnodestates,
} from "../graphnodes.js";

/** the diamond the layering tests ride: a → b, a → c, b → d, c → d. */
function diamond() {
  const nodes = [
    makenode("a", "a", { outputs: ["next"] }),
    makenode("b", "b", { inputs: ["in"], outputs: ["next"] }),
    makenode("c", "c", { inputs: ["in"], outputs: ["next"] }),
    makenode("d", "d", { inputs: ["in"] }),
  ];
  const edges = [makeedge("a", "b", "next"), makeedge("a", "c", "next"), makeedge("b", "d", "next"), makeedge("c", "d", "next")];
  return makegraph(nodes, edges);
}

describe("graphnodes model", () => {
  it("makes nodes and graphs with the pending default", () => {
    const node = makenode("boot", "boot banner", { outputs: ["next"] });
    expect(node.state).toBe("pending");
    expect(node.kind).toBe("stage");
    expect(node.outputs).toEqual(["next"]);
    expect(nodecount(makegraph([node]))).toBe(1);
    expect(edgecount(makegraph([node]))).toBe(0);
  });

  it("refuses wires naming unknown endpoints and drops wires with their node", () => {
    const graph = makegraph([makenode("a", "a"), makenode("b", "b")]);
    expect(edgecount(addedge(graph, makeedge("a", "ghost", "out")))).toBe(0);
    const wired = addedge(graph, makeedge("a", "b", "out"));
    expect(edgecount(wired)).toBe(1);
    expect(edgecount(removenode(wired, "b"))).toBe(0);
    expect(nodecount(removenode(wired, "b"))).toBe(1);
  });

  it("removes exactly the matched wire", () => {
    const graph = makegraph([makenode("a", "a"), makenode("b", "b")], [makeedge("a", "b", "out")]);
    expect(edgecount(removeedge(graph, makeedge("a", "b", "other")))).toBe(1);
    expect(edgecount(removeedge(graph, makeedge("a", "b", "out")))).toBe(0);
  });

  it("connects checked wires on the first free output port", () => {
    const graph = makegraph([makenode("a", "a", { outputs: ["one", "two"] }), makenode("b", "b"), makenode("c", "c")]);
    const first = connectnodes(graph, "a", "b");
    expect(first.ok).toBe(true);
    expect(first.graph.edges[0]?.port).toBe("one");
    const second = connectnodes(first.graph, "a", "c");
    expect(second.ok).toBe(true);
    expect(second.graph.edges[1]?.port).toBe("two");
    expect(connectnodes(graph, "a", "ghost").ok).toBe(false);
    expect(connectnodes(graph, "a", "a", "one").ok).toBe(false);
    expect(connectnodes(graph, "a", "b", "undeclared").ok).toBe(false);
  });

  it("answers the neighborhood and the degree", () => {
    const graph = diamond();
    expect(edgesfrom(graph, "a").length).toBe(2);
    expect(descendants(graph, "a").sort()).toEqual(["b", "c", "d"]);
    expect(ancestors(graph, "d").sort()).toEqual(["a", "b", "c"]);
    expect(rootnodes(graph).map((node) => node.id)).toEqual(["a"]);
    expect(leafnodes(graph).map((node) => node.id)).toEqual(["d"]);
  });

  it("layers the stages on stable topological waves", () => {
    const graph = diamond();
    const levels = nodelevels(graph);
    expect(levels.a).toBe(0);
    expect(levels.b).toBe(1);
    expect(levels.c).toBe(1);
    expect(levels.d).toBe(2);
    expect(stagewaves(graph)).toEqual([["a"], ["b", "c"], ["d"]]);
    expect(topologicalorder(graph)).toEqual(["a", "b", "c", "d"]);
  });

  it("answers the same waves for the same graph, every call", () => {
    const graph = diamond();
    expect(stagewaves(graph)).toEqual(stagewaves(graph));
    expect(topologicalorder(graph)).toEqual(topologicalorder(graph));
  });

  it("detects cycles and answers the walked path", () => {
    const graph = makegraph(
      [makenode("a", "a", { outputs: ["next"] }), makenode("b", "b", { inputs: ["in"], outputs: ["next"] }), makenode("c", "c", { inputs: ["in"] })],
      [makeedge("a", "b", "next"), makeedge("b", "c", "next")],
    );
    expect(hascycle(graph)).toBe(false);
    expect(findcycle(graph)).toEqual([]);
    const looped = addedge(graph, makeedge("c", "a", "in"));
    expect(hascycle(looped)).toBe(true);
    expect(findcycle(looped)).toEqual(["a", "b", "c", "a"]);
  });

  it("validates the whole graph and names every problem", () => {
    const report = validategraph(diamond());
    expect(report.ok).toBe(true);
    expect(report.stagecount).toBe(3);
    const broken = makegraph(
      [makenode("a", "a"), makenode("a", "again"), makenode("b", "b", { inputs: ["in"] })],
      [makeedge("a", "a", "out"), makeedge("a", "ghost", "out"), makeedge("a", "b", "undeclared")],
    );
    const codes = validategraph(broken).problems.map((problem) => problem.code);
    expect(codes).toContain("duplicateid");
    expect(codes).toContain("selfedge");
    expect(codes).toContain("unknownnode");
    expect(codes).toContain("portmismatch");
    expect(validategraph(broken).ok).toBe(false);
  });

  it("moves the node states and counts the ladder", () => {
    let graph = diamond();
    graph = withnodestate(graph, "a", "running");
    expect(nodebyid(graph, "a")?.state).toBe("running");
    graph = withnodestates(graph, { a: "done", b: "failed" });
    expect(statecounts(graph)).toEqual({ pending: 2, running: 0, done: 1, failed: 1, skipped: 0 });
    expect(issettled("done")).toBe(true);
    expect(issettled("running")).toBe(false);
    expect(graphcomplete(graph)).toBe(false);
    const alldone = withnodestates(diamond(), { a: "done", b: "done", c: "done", d: "done" });
    expect(graphcomplete(alldone)).toBe(true);
    const clean = resetnodestates(graph);
    expect(statecounts(clean).pending).toBe(4);
  });

  it("round trips the json serialization", () => {
    const graph = diamond();
    const parsed = tryparsegraph(serializegraph(graph));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.graph.nodes.length).toBe(4);
      expect(parsed.graph.edges.length).toBe(4);
      expect(graphfingerprint(parsed.graph)).toBe(graphfingerprint(graph));
    }
    expect(tryparsegraph("not json").ok).toBe(false);
    expect(tryparsegraph("{}").ok).toBe(false);
  });

  it("fingerprints equal content in different insertion orders equally", () => {
    const one = diamond();
    const two = makegraph([...one.nodes].reverse(), [...one.edges].reverse());
    expect(graphfingerprint(one)).toBe(graphfingerprint(two));
  });

  it("adds and replaces nodes by id", () => {
    const graph = addnode(makegraph([makenode("a", "a")]), makenode("a", "renamed"));
    expect(nodecount(graph)).toBe(1);
    expect(nodebyid(graph, "a")?.label).toBe("renamed");
  });
});
