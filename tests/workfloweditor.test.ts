import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  applyoverride,
  buildsteplibrary,
  diffversions,
  expandtemplate,
  exportworkflow,
  groupselect,
  importworkflow,
  loadworkflow,
  markbreakpoint,
  minimapfocus,
  palettenodes,
  reordersteps,
  renderminimap,
  runtobreakpoint,
  saveworkflow,
  searchsteps,
  snapnode,
  undoedit,
  redoedit,
  addedge,
  removeedge,
  removenode,
  addnode,
  editstep,
  bindparam,
  zoomcanvas,
} from "../workflow.js";
import {
  actionrisk,
  dryrunprojection,
  editorsavegate,
  exportcontentreview,
  runreviewgranted,
  validatesiteoverride,
  watchdogconfigvalid,
} from "../policy.js";
import {
  composeworkflow,
  expandblocks,
  newworkflowrun,
  runworkflow,
  steptemplateof,
  workflowblockof,
  workflowstepof,
  watchdogpass,
} from "../workflow.js";
import { editorstate, runhistoryquery, runhistoryreport, workflowfileversion } from "../protocol.js";
import type { editormodel, editorlayout, steptemplate, toolstep, variablescope, workflowrecord } from "../types.js";

const now = 1_800_000_000_000;

function kindallowed(kind: string): boolean {
  try {
    actionrisk(kind as toolstep["kind"]);
    return true;
  } catch {
    return false;
  }
}

function riskof(kind: string): "read" | "interaction" | "sensitive" {
  return actionrisk(kind as toolstep["kind"]);
}

/** Composes one small read workflow of a top step, one block invocation and one closing step with bindings. */
function composedworkflow(): workflowrecord {
  const inner = workflowblockof({
    name: "inner",
    label: "Inner block",
    steps: [
      { id: "i1", kind: "readtext", label: "Read the heading", target: "h1" },
      { id: "i2", kind: "wait", label: "Inner wait", value: "5" },
    ],
  });
  if (!inner) throw new Error("The inner block did not normalize.");
  return composeworkflow({
    id: "wf1",
    name: "roundtrip",
    version: 3,
    origins: ["https://example.com"],
    steps: [
      { id: "s1", kind: "readtext", label: "Open read", target: "p" },
      { block: "inner", label: "Call inner" },
      {
        id: "s2",
        kind: "wait",
        label: "Close wait",
        value: "10",
        bindings: [{ variable: "heading", kind: "string", stepid: "i1" }],
      },
    ],
    blocks: [inner],
    now,
    kindallowed,
    riskof,
  });
}

describe("workflow editor palette and library", () => {
  it("lists the curated palette across the five categories", () => {
    const categories = [...new Set(palettenodes.map((node) => node.category))];
    expect(categories.sort()).toEqual(["actions", "controlflow", "triggers", "variables", "waits"]);
    expect(palettenodes.some((node) => node.kind === "click" && node.category === "actions")).toBe(true);
    expect(palettenodes.some((node) => node.kind === "loop" && node.category === "controlflow")).toBe(true);
    expect(palettenodes.some((node) => node.kind === "delay" && node.category === "waits")).toBe(true);
    expect(palettenodes.some((node) => node.kind === "compute" && node.category === "variables")).toBe(true);
    expect(palettenodes.some((node) => node.kind === "cronrule" && node.category === "triggers")).toBe(true);
  });

  it("builds the step library over every reviewed kind grouped by category", () => {
    const kinds = ["click", "loop", "delay", "compute", "cronrule", "click"];
    const library = buildsteplibrary(kinds);
    expect(library.map((entry) => entry.kind)).toEqual(["click", "compute", "cronrule", "delay", "loop"]);
    expect(library.find((entry) => entry.kind === "loop")?.category).toBe("controlflow");
    expect(library.find((entry) => entry.kind === "delay")?.optionschema[0]).toEqual({
      name: "base",
      kind: "number",
      required: true,
    });
  });
});

describe("editor load and save round trips", () => {
  it("loads a composed record into the canvas and saves it back through the full grammar", () => {
    const record = composedworkflow();
    const model = loadworkflow(record);
    expect(model.nodes.map((node) => node.step?.id ?? node.invocation?.block)).toEqual(["s1", "inner", "s2"]);
    expect(model.blocks[0]?.name).toBe("inner");
    expect(model.edges).toEqual([{ from: "i1", to: "s2", variable: "heading", kind: "string" }]);
    const saved = saveworkflow(model, { now, kindallowed, riskof });
    expect(saved.id).toBe("wf1");
    expect(saved.name).toBe("roundtrip");
    expect(saved.version).toBe(3);
    expect(saved.risk).toBe("read");
    expect(saved.steps.map((step) => step.id)).toEqual(["s1", "i1", "i2", "s2"]);
    expect(saved.steps[1]?.block).toBe("inner");
    expect(saved.steps[2]?.block).toBe("inner");
    expect(saved.steps[3]?.bindings).toEqual([{ variable: "heading", kind: "string", stepid: "i1" }]);
    expect(saved.blocks[0]?.steps.map((entry) => (entry as { id: string }).id)).toEqual(["i1", "i2"]);
  });

  it("gives every repeated invocation of one block a unique canvas node id", () => {
    const inner = workflowblockof({
      name: "inner",
      label: "Inner block",
      steps: [{ id: "i1", kind: "wait", label: "Inner wait", value: "5" }],
    });
    if (!inner) throw new Error("The inner block did not normalize.");
    const record = composeworkflow({
      id: "wf2",
      name: "twice",
      version: 1,
      origins: ["https://example.com"],
      steps: [
        { block: "inner", label: "First" },
        { id: "s1", kind: "wait", label: "Between", value: "1" },
        { block: "inner", label: "Second" },
      ],
      blocks: [inner],
      now,
      kindallowed,
      riskof,
    });
    const model = loadworkflow(record);
    expect(model.nodes.map((node) => node.id ?? node.step?.id)).toEqual(["inner", "s1", "inner2"]);
    const saved = saveworkflow(model, { now, kindallowed, riskof });
    expect(saved.steps.map((step) => step.id)).toEqual(["i1", "s1", "i1"]);
    expect(saved.steps.filter((step) => step.block === "inner")).toHaveLength(2);
  });

  it("refuses saves with duplicate node ids, unknown blocks, backwards edges and unknown edge endpoints", () => {
    const record = composedworkflow();
    const model = loadworkflow(record);
    const first = model.nodes[0] as { step?: { id: string } };
    const duplicated: editormodel = {
      ...model,
      nodes: [...model.nodes, { step: { ...(first.step as object), id: "s1" } as never, x: 40, y: 500 }],
    };
    expect(() => saveworkflow(duplicated, { now, kindallowed, riskof })).toThrow("unique");
    const attached = workflowstepof({ id: "s9", kind: "wait", label: "Attached" });
    if (!attached) throw new Error("The attached step did not normalize.");
    const unknownblock: editormodel = {
      ...model,
      nodes: [...model.nodes, { step: { ...attached, block: "ghost" }, x: 40, y: 500 }],
    };
    expect(() => saveworkflow(unknownblock, { now, kindallowed, riskof })).toThrow("unknown block");
    const backwards: editormodel = {
      ...model,
      edges: [...model.edges, { from: "s2", to: "s1", variable: "late", kind: "string" }],
    };
    expect(() => saveworkflow(backwards, { now, kindallowed, riskof })).toThrow("cycle");
    const dangling: editormodel = {
      ...model,
      edges: [...model.edges, { from: "ghost", to: "s2", variable: "x", kind: "string" }],
    };
    expect(() => saveworkflow(dangling, { now, kindallowed, riskof })).toThrow("unknown source step");
    expect(() => saveworkflow({ ...model, name: " " }, { now, kindallowed, riskof })).toThrow("name");
    expect(() => saveworkflow({ ...model, version: 0 }, { now, kindallowed, riskof })).toThrow("version");
    expect(() => saveworkflow({ ...model, origins: [] }, { now, kindallowed, riskof })).toThrow("origin");
  });

  it("keeps a saved canvas reopenable through a stored layout", () => {
    const record = composedworkflow();
    const layout: editorlayout = { width: 900, height: 700, viewportx: 30, viewporty: 60, zoom: 1 };
    const model = loadworkflow(record, layout);
    expect(model.layout).toEqual({ width: 900, height: 700, viewportx: 30, viewporty: 60, zoom: 1 });
    const reopened = loadworkflow(saveworkflow(model, { now, kindallowed, riskof }), layout);
    expect(reopened.nodes).toHaveLength(3);
  });
});

describe("editor canvas edits", () => {
  it("reorders nodes and groups a selection into a new block", () => {
    const model = loadworkflow(composedworkflow());
    const reordered = reordersteps(model, "s2", 0);
    expect(reordered.nodes.map((node) => node.id ?? node.step?.id)).toEqual(["s2", "s1", "inner"]);
    expect(() => reordersteps(model, "s1", 99)).toThrow("existing position");
    const grouped = groupselect(model, ["s1"], "wrap");
    expect(grouped.nodes.map((node) => node.id ?? node.step?.id)).toEqual(["wrap", "inner", "s2"]);
    expect(grouped.blocks.map((block) => block.name)).toContain("wrap");
    const saved = saveworkflow(grouped, { now, kindallowed, riskof });
    expect(saved.steps.map((step) => step.block)).toEqual(["wrap", "inner", "inner", undefined]);
    expect(() => groupselect(model, ["s1"], "inner")).toThrow("already exists");
    expect(() => groupselect(model, ["s1"], "Bad")).toThrow("lowercase word");
    expect(() => groupselect(model, ["inner"], "wrap2")).toThrow("step nodes");
  });

  it("snaps a dragged node onto the grid and attaches it to a block column", () => {
    const model = loadworkflow(composedworkflow());
    const snapped = snapnode(model, "s2", 347, 129, 20);
    const moved = snapped.nodes.find((node) => node.step?.id === "s2");
    expect(moved?.x).toBe(340);
    expect(moved?.y).toBe(120);
    const saved = saveworkflow(snapped, { now, kindallowed, riskof });
    expect(saved.steps.find((step) => step.id === "s2")?.block).toBe("inner");
    expect(() => snapnode(model, "ghost", 10, 10)).toThrow("No canvas node");
    expect(() => snapnode(model, "inner", 10, 10)).toThrow("block invocation");
  });

  it("inserts nodes from the palette and edits them through the inspector with undo coverage", () => {
    const model = loadworkflow(composedworkflow());
    const withnode = addnode(model, { id: "readtext", kind: "readtext", label: "Palette drop", target: "h2" });
    expect(withnode.nodes.map((node) => node.step?.id)).toContain("readtext");
    const again = addnode(withnode, { id: "readtext", kind: "readtext", label: "Palette drop", target: "h2" });
    expect(again.nodes.map((node) => node.step?.id)).toContain("readtext2");
    const edited = editstep(again, { id: "readtext2", kind: "readtext", label: "Renamed", target: "h3" });
    expect(edited.nodes.find((node) => node.step?.id === "readtext2")?.step?.label).toBe("Renamed");
    const undone = undoedit(edited);
    expect(undone.nodes.find((node) => node.step?.id === "readtext2")?.step?.label).toBe("Palette drop");
    const redone = redoedit(undone);
    expect(redone.nodes.find((node) => node.step?.id === "readtext2")?.step?.label).toBe("Renamed");
    expect(() => editstep(model, { id: "ghost", kind: "wait", label: "Ghost" })).toThrow("No canvas step");
  });

  it("wires typed binding edges and removes them with the node", () => {
    const model = loadworkflow(composedworkflow());
    const withedge = addedge(model, { from: "s1", to: "s2", variable: "text", kind: "string", path: "details.text" });
    expect(withedge.edges.some((edge) => edge.variable === "text")).toBe(true);
    expect(() => addedge(model, { from: "s2", to: "s1", variable: "back", kind: "string" })).toThrow("backwards");
    expect(() => addedge(model, { from: "s1", to: "s2", variable: "Bad", kind: "string" })).toThrow("lowercase word");
    const removed = removeedge(withedge, "s1", "s2", "text");
    expect(removed.edges.some((edge) => edge.variable === "text")).toBe(false);
    expect(() => removeedge(model, "s1", "s2", "text")).toThrow("No canvas edge");
    const pruned = removenode(model, "s2");
    expect(pruned.nodes.map((node) => node.step?.id ?? node.invocation?.block)).toEqual(["s1", "inner"]);
    expect(pruned.edges).toHaveLength(0);
    const undone = undoedit(pruned);
    expect(undone.nodes).toHaveLength(3);
  });

  it("binds nested params into a block invocation of the canvas", () => {
    const model = loadworkflow(composedworkflow());
    const bound = bindparam(model, "inner", { name: "base", kind: "number", default: 7 });
    expect(bound.nodes.find((node) => node.invocation?.block === "inner")?.invocation?.params).toEqual([
      { name: "base", kind: "number", default: 7 },
    ]);
    const replaced = bindparam(bound, "inner", { name: "base", kind: "number", default: 9 });
    expect(replaced.nodes.find((node) => node.invocation?.block === "inner")?.invocation?.params).toEqual([
      { name: "base", kind: "number", default: 9 },
    ]);
    expect(() => bindparam(model, "ghost", { name: "base", kind: "number" })).toThrow("No block invocation");
    expect(() => bindparam(model, "inner", { name: "Bad", kind: "number" })).toThrow("lowercase word");
    const saved = saveworkflow(bound, { now, kindallowed, riskof });
    expect(saved.steps.find((step) => step.id === "i1")?.params).toEqual([
      { name: "base", kind: "number", default: 7 },
    ]);
  });

  it("inserts shared step templates with nested params onto the canvas", () => {
    const template: steptemplate = {
      id: "t1",
      name: "shared wait",
      origin: "https://example.com",
      step: { id: "wait", kind: "wait", label: "Shared wait", value: "3" },
      sharedat: now,
    };
    const model = loadworkflow(composedworkflow());
    const inserted = expandtemplate(model, steptemplateof(template) as steptemplate, [
      { name: "base", kind: "number", default: 2 },
    ]);
    expect(inserted.nodes.map((node) => node.step?.id)).toContain("wait");
    expect(inserted.nodes.find((node) => node.step?.id === "wait")?.step?.params).toEqual([
      { name: "base", kind: "number", default: 2 },
    ]);
    const twice = expandtemplate(inserted, steptemplateof(template) as steptemplate);
    expect(twice.nodes.map((node) => node.step?.id)).toContain("wait2");
    expect(() =>
      expandtemplate(model, {
        id: "t2",
        name: "broken",
        origin: "https://example.com",
        step: { id: "x", kind: "wait" } as never,
        sharedat: now,
      }),
    ).toThrow("reviewed workflow step");
  });

  it("searches steps by label, kind and variable name", () => {
    const model = loadworkflow(composedworkflow());
    const withedge = addedge(model, { from: "s1", to: "s2", variable: "headingtext", kind: "string" });
    expect(searchsteps(withedge, "OPEN")).toEqual([
      { id: "s1", label: "Open read", kind: "readtext", matched: ["label"] },
    ]);
    expect(searchsteps(withedge, "readtext")[0]?.matched).toEqual(["kind"]);
    expect(searchsteps(withedge, "headingtext").map((result) => result.id)).toEqual(["s1", "s2"]);
    expect(searchsteps(withedge, "  ")).toEqual([]);
  });
});

describe("editor mini map and zoom", () => {
  it("projects the full canvas into the mini map and answers the viewport rectangle", () => {
    const model = loadworkflow(composedworkflow());
    const projection = renderminimap(model, 200, 100);
    expect(projection.minimap.width).toBe(200);
    expect(projection.minimap.scale).toBeGreaterThan(0);
    expect(projection.minimap.scale).toBeLessThanOrEqual(100 / model.layout.height);
    expect(projection.nodes).toHaveLength(3);
    const zoomed = zoomcanvas(model, 2).model;
    const zoomedprojection = renderminimap(zoomed, 200, 100);
    expect(zoomedprojection.minimap.viewport.width).toBeCloseTo(
      (model.layout.width / 2) * zoomedprojection.minimap.scale,
      5,
    );
    expect(() => renderminimap(model, 0, 100)).toThrow("positive");
  });

  it("jumps the canvas to a clicked mini map region inside the canvas bounds", () => {
    const model = loadworkflow(composedworkflow());
    const focused = minimapfocus(model, 0, 0);
    expect(focused.layout.viewportx).toBe(0);
    expect(focused.layout.viewporty).toBe(0);
    const zoomed = zoomcanvas(model, 4).model;
    const corner = minimapfocus(zoomed, 200, 100);
    expect(corner.layout.viewportx).toBeGreaterThan(0);
    expect(corner.layout.viewportx).toBeLessThanOrEqual(model.layout.width - model.layout.width / 4);
    expect(() => zoomcanvas(model, 0)).toThrow("positive");
    expect(zoomcanvas(model, 0.5).labelscale).toBe(2);
  });
});

describe("editor version diffs", () => {
  it("highlights added, removed and changed steps between two versions", () => {
    const base = composedworkflow();
    const edited = composeworkflow({
      id: "wf1",
      name: "roundtrip",
      version: 4,
      origins: ["https://example.com"],
      steps: [
        { id: "s1", kind: "readtext", label: "Open read renamed", target: "p" },
        { block: "inner", label: "Call inner" },
        { id: "s3", kind: "wait", label: "Fresh wait", value: "20" },
      ],
      blocks: [
        workflowblockof({
          name: "inner",
          label: "Inner block",
          steps: [
            { id: "i1", kind: "readtext", label: "Read the heading", target: "h1" },
            { id: "i2", kind: "wait", label: "Inner wait", value: "5" },
          ],
        })!,
      ],
      now,
      kindallowed,
      riskof,
    });
    const diff = diffversions(base, edited, now);
    expect(diff.from).toBe(3);
    expect(diff.to).toBe(4);
    expect(diff.added.map((step) => step.stepid)).toEqual(["s3"]);
    expect(diff.removed.map((step) => step.stepid)).toEqual(["s2"]);
    expect(diff.changed).toEqual([{ stepid: "s1", kind: "readtext", label: "Open read renamed", changes: ["label"] }]);
  });
});

describe("editor export, import and sharing", () => {
  it("round trips a workflow file through json and yaml with the version metadata", () => {
    const record = composedworkflow();
    for (const format of ["json", "yaml"] as const) {
      const exported = exportworkflow(record, format, "release note", now);
      expect(exported.format).toBe(format);
      expect(exported.file.format).toBe(workflowfileversion);
      expect(exported.file.note).toBe("release note");
      expect(exported.file.templates).toEqual([]);
      const imported = importworkflow({ contents: exported.contents, format, now, kindallowed, riskof });
      expect(imported.record.name).toBe("roundtrip");
      expect(imported.record.steps.map((step) => step.id)).toEqual(["s1", "i1", "i2", "s2"]);
      expect(imported.record.steps[3]?.bindings).toEqual([{ variable: "heading", kind: "string", stepid: "i1" }]);
      expect(imported.record.reviewstate).toBe("pending");
    }
  });

  it("packs templates into one share file and restores them on import", () => {
    const record = composedworkflow();
    const template: steptemplate = {
      id: "t1",
      name: "shared wait",
      origin: "https://example.com",
      step: { id: "wait", kind: "wait", label: "Shared wait", value: "3" },
      sharedat: now,
    };
    const bundle = importworkflow({
      contents: JSON.stringify({
        format: workflowfileversion,
        exportedat: now,
        workflow: record,
        templates: [template],
      }),
      now,
      kindallowed,
      riskof,
    });
    expect(bundle.templates).toEqual([steptemplateof(template)]);
  });

  it("refuses imports that break the file contract", () => {
    const record = composedworkflow();
    const file = JSON.stringify({ format: 99, exportedat: now, workflow: record, templates: [] });
    expect(() => importworkflow({ contents: file, now, kindallowed, riskof })).toThrow("reviewed format");
    expect(() => importworkflow({ contents: "not json at all", format: "json", now, kindallowed, riskof })).toThrow();
    expect(() =>
      importworkflow({
        contents: JSON.stringify({ format: 1, exportedat: now, workflow: { ...record, steps: [] }, templates: [] }),
        now,
        kindallowed,
        riskof,
      }),
    ).toThrow("at least one step");
    expect(() =>
      importworkflow({
        contents: JSON.stringify({
          format: 1,
          exportedat: now,
          workflow: { ...record, steps: [{ id: "x", kind: "explode", label: "Unknown kind" }] },
          templates: [],
        }),
        now,
        kindallowed,
        riskof,
      }),
    ).toThrow("reviewed action kind");
    expect(() =>
      importworkflow({
        contents: JSON.stringify({
          format: 1,
          exportedat: now,
          workflow: record,
          templates: [{ id: "t", name: "broken" }],
        }),
        now,
        kindallowed,
        riskof,
      }),
    ).toThrow("reviewed step");
    expect(() =>
      importworkflow({
        contents: JSON.stringify({ format: 1, exportedat: now, workflow: record, templates: "no" }),
        now,
        kindallowed,
        riskof,
      }),
    ).toThrow("list");
    expect(() =>
      importworkflow({ contents: "format: 1\nworkflow: {}", format: "yaml", now, kindallowed, riskof }),
    ).toThrow();
  });

  it("parses the documented yaml subset of scalars, sequences and mappings", () => {
    const parsed = importworkflow({
      contents:
        'format: 1\nexportedat: 1800000000000\nworkflow:\n  id: "wfy"\n  name: "yamlflow"\n  version: 1\n  origins:\n    - "https://example.com"\n  steps:\n    -\n      id: "s1"\n      kind: "wait"\n      label: "Wait a beat"\n      value: "10"\n  blocks: []\n  risk: "read"\n  createdat: 1800000000000\ntemplates: []\n',
      format: "yaml",
      now,
      kindallowed,
      riskof,
    });
    expect(parsed.record.steps[0]?.value).toBe("10");
    expect(parsed.record.origins).toEqual(["https://example.com"]);
  });
});

describe("editor breakpoints and debug runs", () => {
  it("plans debug segments that pause before marked steps and report the remainder", () => {
    const record = composedworkflow();
    const marked = markbreakpoint(loadworkflow(record), "i1");
    const surfaces = [
      ...marked.nodes.flatMap((node) => (node.step !== undefined ? [node.step] : [])),
      ...marked.blocks.flatMap((block) =>
        block.steps.flatMap((entry) =>
          "kind" in entry && "label" in entry && !("block" in entry)
            ? [entry as { id: string; breakpoint?: boolean }]
            : [],
        ),
      ),
    ];
    const breakpoints = surfaces.filter((step) => step.breakpoint === true).map((step) => step.id);
    expect(breakpoints).toEqual(["i1"]);
    expect(() => markbreakpoint(marked, "ghost")).toThrow("No canvas step");
    const cleared = markbreakpoint(marked, "i1");
    expect(cleared.blocks[0]?.steps.some((entry) => "breakpoint" in entry && entry.breakpoint === true)).toBe(false);
    const segment = runtobreakpoint({ record, cursor: 0, breakpoints });
    expect(segment.until).toBe(1);
    expect(segment.pausat).toBe("i1");
    expect(segment.remaining).toBe(3);
    const tail = runtobreakpoint({ record, cursor: segment.until + 1, breakpoints });
    expect(tail.until).toBe(4);
    expect(tail.pausat).toBeUndefined();
    expect(tail.remaining).toBe(0);
    expect(runtobreakpoint({ record, cursor: 0, breakpoints: [] }).until).toBe(4);
  });

  it("runs the segment before a breakpoint, pauses and resumes exactly there", async () => {
    const record = composedworkflow();
    const run = newworkflowrun({ id: "debugrun", workflowid: record.id, now });
    const executed: string[] = [];
    const executor = {
      execute: async (step: { id: string }) => {
        executed.push(step.id);
        return { ok: true, summary: `did ${step.id}` };
      },
    };
    const segment = runtobreakpoint({ record, cursor: 0, breakpoints: ["i1"] });
    const segmentrecord = { ...record, steps: record.steps.slice(0, segment.until) };
    const partial = await runworkflow({
      record: segmentrecord,
      run,
      ...executor,
      now,
      gates: { sessionactive: true, planapproved: true, origingranted: () => true },
    });
    expect(partial.run.cursor).toBe(1);
    expect(partial.run.state).toBe("done");
    const paused = { ...run, state: "paused" as const, cursor: segment.until, pausedat: now };
    const resumed = await runworkflow({
      record,
      run: paused,
      log: partial.log,
      outputs: partial.outputs,
      ...executor,
      now,
      gates: { sessionactive: true, planapproved: true, origingranted: () => true },
    });
    expect(resumed.run.state).toBe("done");
    expect(resumed.run.cursor).toBe(4);
    expect(executed).toEqual(["s1", "i1", "i2", "s2"]);
  });
});

describe("editor policy gates", () => {
  it("gates editor saves on the session, the approved plan and the canvas shape", () => {
    const model = loadworkflow(composedworkflow());
    const session = {
      id: "sess",
      tabid: 4,
      origin: "https://example.com",
      startedat: now - 1000,
      expiresat: now + 600_000,
      grants: ["https://example.com"],
    };
    const plan = {
      id: "run",
      objective: "Edit the workflow",
      origin: "https://example.com",
      steps: [],
      createdat: now - 2000,
      expiresat: now + 600_000,
      state: "approved" as const,
    };
    expect(editorsavegate({ session, plan, model, now }).allowed).toBe(true);
    expect(editorsavegate({ session: undefined, plan, model, now }).allowed).toBe(false);
    expect(editorsavegate({ session, plan: { ...plan, state: "pending" as never }, model, now }).allowed).toBe(false);
    expect(editorsavegate({ session, plan, model: { ...model, name: " " }, now }).allowed).toBe(false);
    const firstnode = model.nodes[0] as editormodel["nodes"][number];
    const duplicated = { ...model, nodes: [...model.nodes, { ...firstnode }] };
    expect(editorsavegate({ session, plan, model: duplicated, now }).allowed).toBe(false);
    const backwards: editormodel = {
      ...model,
      edges: [...model.edges, { from: "s2", to: "s1", variable: "late", kind: "string" }],
    };
    expect(editorsavegate({ session, plan, model: backwards, now }).reason ?? "").toContain("cycle");
  });

  it("grades imported workflows and rollbacks unreviewed until the user approves them", () => {
    const record = composedworkflow();
    expect(runreviewgranted({ ...record, reviewstate: "pending" }).allowed).toBe(false);
    expect(runreviewgranted(record).allowed).toBe(true);
  });

  it("validates per site overrides against the reviewed knobs and export contents against secrets", () => {
    expect(validatesiteoverride({ pattern: "https://example.com", deltas: { loopbound: 20 } }).allowed).toBe(true);
    expect(validatesiteoverride({ pattern: "https://*.example.com", deltas: { waitms: 500 } }).allowed).toBe(true);
    expect(validatesiteoverride({ pattern: "https://example.com/path", deltas: {} }).allowed).toBe(false);
    expect(validatesiteoverride({ pattern: "http://example.com", deltas: {} }).allowed).toBe(false);
    expect(validatesiteoverride({ pattern: "https://example.com", deltas: { speed: 2 } }).allowed).toBe(false);
    expect(validatesiteoverride({ pattern: "https://example.com", deltas: { loopbound: -1 } }).allowed).toBe(false);
    const clean = composedworkflow();
    expect(exportcontentreview({ workflow: clean, templates: [] }).allowed).toBe(true);
    const plainstep = workflowstepof({ id: "s9", kind: "wait", label: "Wait" });
    if (!plainstep) throw new Error("The secret step did not normalize.");
    const secretstep: workflowrecord = {
      ...clean,
      steps: [...clean.steps, { ...plainstep, options: '{"apikey":"abc"}' }],
    };
    expect(exportcontentreview({ workflow: secretstep, templates: [] }).allowed).toBe(false);
  });

  it("bounds the watchdog configuration as user configured values", () => {
    expect(watchdogconfigvalid({ enabled: true, stallthreshold: 30_000, action: "pause" }).allowed).toBe(true);
    expect(
      watchdogconfigvalid({ enabled: true, stallthreshold: 30_000, action: "pause", zombiewindow: 60_000 }).allowed,
    ).toBe(true);
    expect(watchdogconfigvalid({ enabled: true, stallthreshold: 0, action: "pause" }).allowed).toBe(false);
    expect(watchdogconfigvalid({ enabled: true, stallthreshold: 10, action: "explode" as never }).allowed).toBe(false);
    expect(watchdogconfigvalid({ enabled: "yes" as never, stallthreshold: 10, action: "pause" }).allowed).toBe(false);
  });
});

describe("per site override application", () => {
  it("applies reviewed knob deltas to the matching steps of a workflow", () => {
    const record = composeworkflow({
      id: "wf3",
      name: "knobs",
      version: 1,
      origins: ["https://example.com"],
      steps: [
        { id: "d1", kind: "delay", label: "Delay", options: '{"base":100}' },
        { id: "w1", kind: "waitelement", label: "Wait element", target: "h1", options: '{"timeout":1000}' },
      ],
      now,
      kindallowed,
      riskof,
    });
    const overridden = applyoverride(record, {
      id: "o1",
      workflowid: record.id,
      pattern: "https://example.com",
      deltas: { delaybase: 250, waitms: 900 },
      createdat: now,
    });
    expect(overridden.steps[0]?.options).toBe('{"base":250}');
    expect(overridden.steps[1]?.options).toBe('{"timeout":900}');
  });

  it("refuses patterns that match no workflow origin and knobs outside the reviewed set", () => {
    const record = composedworkflow();
    expect(() =>
      applyoverride(record, {
        id: "o1",
        workflowid: record.id,
        pattern: "https://other.example",
        deltas: { delaybase: 250 },
        createdat: now,
      }),
    ).toThrow("matches none");
    expect(() =>
      applyoverride(record, {
        id: "o1",
        workflowid: record.id,
        pattern: "https://example.com",
        deltas: { speed: 2 },
        createdat: now,
      }),
    ).toThrow("reviewed knobs");
    expect(() =>
      applyoverride(record, {
        id: "o1",
        workflowid: record.id,
        pattern: "https://example.com",
        deltas: { delaybase: -5 },
        createdat: now,
      }),
    ).toThrow("positive number");
    const delayrecord = composeworkflow({
      id: "wf4",
      name: "delays",
      version: 1,
      origins: ["https://sub.example.com"],
      steps: [{ id: "d1", kind: "delay", label: "Delay", options: '{"base":100}' }],
      now,
      kindallowed,
      riskof,
    });
    const overridden = applyoverride(delayrecord, {
      id: "o2",
      workflowid: delayrecord.id,
      pattern: "https://*.example.com",
      deltas: { delaybase: 400 },
      createdat: now,
    });
    expect(overridden.steps[0]?.options).toBe('{"base":400}');
  });
});

describe("the editor context feed the sidepanel renders", () => {
  it("ships the flat editor view the renderworkfloweditor surface reads, never the protocol envelope", async () => {
    /* the 2.0.8 end-to-end run caught the context handing renderworkfloweditor the protocol envelope of editorstate — the wrapper carries its view under an inner editor field, so the flat read of versions answered `undefined` and the length access aborted every refresh mid-render; the context now unwraps the envelope at the source */
    const background = await readFile("background.ts", "utf8");
    expect(background).toContain("listwatchdogevents() } }).editor,");
    /* the grand merge moved the extension surfaces under web/extension — the editor context feed reads the moved module */
    const sidepanel = await readFile("web/extension/sidepanel.ts", "utf8");
    expect(sidepanel).toContain("const editor = context.editor;");
    expect(sidepanel).toContain("editor?.versions.length ?? 0");
    const envelope = editorstate({
      versions: [],
      history: [],
      overrides: [],
      imports: [],
      backgroundruns: {},
      watchdog: { events: [] },
    });
    expect(envelope.editor.versions).toEqual([]);
    expect(typeof envelope.version).toBe("string");
  });

  it("answers the view flags the surface renders with the boolean grammar the commands declare", async () => {
    /* the 2.0.8 end-to-end run caught the schemastrict registry declaring the flat view field of the perf, schedule, resilience, state and fleet families as objects while every surface request carries the boolean flag — the mismatch refused all five view commands before dispatch; the registry now answers the boolean contract */
    const background = await readFile("background.ts", "utf8");
    for (const anchor of [
      'export: "object", view: "boolean" },',
      'slowmo: "object", settings: "object", view: "boolean" },',
      'summary: "object", settings: "object", view: "boolean" },',
      'vote: "object", replay: "object", view: "boolean" },',
    ])
      expect(background).toContain(anchor);
    const sidepanel = await readFile("web/extension/sidepanel.ts", "utf8");
    for (const anchor of [
      '{ kind: "perf", view: true }',
      '{ kind: "schedule", view: true }',
      '{ kind: "resilience", view: true }',
      '{ kind: "state", view: true }',
      '{ kind: "fleet", view: true }',
    ])
      expect(sidepanel).toContain(anchor);
  });
});
