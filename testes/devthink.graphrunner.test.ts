import { describe, expect, it } from "vitest";
import { makenode, makeedge, makegraph, resetnodestates } from "../devthink/graphnodes.js";
import { type runevent, createrunner, initialview, resetview, stageofnode, viewprogress } from "../devthink/graphrunner.js";

/** the ride the runner tests share: banner → config → {gateway, mcp} → ready. */
function bootgraph() {
  const nodes = [
    makenode("banner", "boot banner", { outputs: ["next"] }),
    makenode("config", "config gate", { inputs: ["in"], outputs: ["next"] }),
    makenode("gateway", "gateway pair", { inputs: ["in"], outputs: ["next"] }),
    makenode("mcp", "mcp listen", { inputs: ["in"], outputs: ["next"] }),
    makenode("ready", "ready", { inputs: ["in"] }),
  ];
  const edges = [
    makeedge("banner", "config", "next"),
    makeedge("config", "gateway", "next"),
    makeedge("config", "mcp", "next"),
    makeedge("gateway", "ready", "next"),
    makeedge("mcp", "ready", "next"),
  ];
  return makegraph(nodes, edges);
}

describe("graphrunner stages", () => {
  it("walks every stage to done with the default handler", async () => {
    const view = await createrunner(bootgraph()).run();
    expect(view.status).toBe("done");
    expect(view.progress).toBe(100);
    expect(view.stageindex).toBe(view.stages.length);
    expect(view.stages).toEqual([["banner"], ["config"], ["gateway", "mcp"], ["ready"]]);
    expect(view.nodestates.ready).toBe("done");
  });

  it("keeps the stable insertion order inside a wave (never a promise pool)", async () => {
    const order: string[] = [];
    const view = await createrunner(bootgraph(), {
      handler: (node) => {
        order.push(node.id);
      },
    }).run();
    expect(order).toEqual(["banner", "config", "gateway", "mcp", "ready"]);
    expect(view.donecount).toBe(5);
    expect(view.failedcount).toBe(0);
    expect(view.skippedcount).toBe(0);
  });

  it("answers one event per transition, in run order", async () => {
    const events: runevent[] = [];
    await createrunner(bootgraph(), { onevent: (event) => events.push(event) }).run();
    expect(events.map((event) => event.type)).toEqual([
      "runbegin",
      "stagebegin",
      "nodestart",
      "nodedone",
      "stageend",
      "stagebegin",
      "nodestart",
      "nodedone",
      "stageend",
      "stagebegin",
      "nodestart",
      "nodedone",
      "nodestart",
      "nodedone",
      "stageend",
      "stagebegin",
      "nodestart",
      "nodedone",
      "stageend",
      "runend",
    ]);
    expect(events[0]?.progress).toBe(0);
    expect(events[events.length - 1]?.progress).toBe(100);
  });

  it("retries a failing node and strands the rest as skipped", async () => {
    const attempts: string[] = [];
    const view = await createrunner(bootgraph(), {
      retry: 2,
      handler: async (node) => {
        attempts.push(node.id);
        if (node.id === "mcp") throw new Error("the listener refused the port");
      },
    }).run();
    expect(attempts.filter((id) => id === "mcp").length).toBe(3);
    expect(view.status).toBe("failed");
    expect(view.nodestates.mcp).toBe("failed");
    expect(view.nodestates.ready).toBe("skipped");
    expect(view.skippedcount).toBe(1);
    expect(view.failure?.nodeid).toBe("mcp");
    expect(view.failure?.message).toContain("listener refused");
    expect(view.progress).toBe(60);
  });

  it("reports every view transition through onview", async () => {
    const views = await (async () => {
      const seen: string[] = [];
      await createrunner(bootgraph(), { onview: (view) => seen.push(view.status) }).run();
      return seen;
    })();
    expect(views[0]).toBe("running");
    expect(views[views.length - 1]).toBe("done");
    expect(views.every((status) => ["running", "done", "failed"].includes(status))).toBe(true);
  });

  it("takes the injected stage gap between the waves", async () => {
    const started = Date.now();
    await createrunner(makegraph([makenode("a", "a"), makenode("b", "b")], [makeedge("a", "b", "out")]), {
      stagegap: 40,
    }).run();
    expect(Date.now() - started).toBeGreaterThanOrEqual(30);
  });

  it("answers one settled view for a second run and reads stages by node", async () => {
    const runner = createrunner(bootgraph());
    const first = await runner.run();
    const second = await runner.run();
    expect(second).toEqual(first);
    expect(stageofnode(first, "mcp")).toBe(2);
    expect(stageofnode(first, "ghost")).toBe(-1);
  });

  it("builds the idle view and the reset view", () => {
    const idle = initialview(bootgraph());
    expect(idle.status).toBe("idle");
    expect(viewprogress(idle.nodestates)).toBe(0);
    expect(idle.totalcount).toBe(5);
    expect(resetview(resetnodestates(bootgraph())).status).toBe("idle");
  });
});
