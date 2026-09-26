import { describe, expect, it } from "vitest";
import { lazymodcatalog, lazymodof, prewarmmodules, resolvelazymod, startupbudgetof, startupcostof } from "../perf.js";
import { lazybudgetvalid, lazyloadgate } from "../policy.js";

const now = 1_800_000_000_000;

describe("lazymods of the 1.1.68 family", () => {
  it("declares the heavy modules out of the startup path with their capability requirements ahead of load", () => {
    const catalog = lazymodcatalog();
    expect(catalog.length).toBeGreaterThanOrEqual(8);
    for (const descriptor of catalog) {
      expect(descriptor.id.trim()).not.toBe("");
      expect(descriptor.reason).toMatch(/loads behind/i);
      expect(descriptor.capabilities.length).toBeGreaterThan(0);
    }
    expect(catalog.map((descriptor) => descriptor.id)).toContain("capture");
    expect(catalog.map((descriptor) => descriptor.id)).toContain("compare");
    expect(catalog.map((descriptor) => descriptor.id)).toContain("export");
    expect(lazymodof("htmlsnapshot")?.capabilities).toEqual(["parse"]);
    expect(lazymodof("unknown")).toBeUndefined();
  });

  it("resolves one lazy module on first use under the same capability check the eager path runs", () => {
    const granted = resolvelazymod({
      id: "capture",
      granted: ["capture"],
      firstuse: true,
      duration: 5,
      now,
      provenance: { runid: "run1", stepid: "s1" },
    });
    expect(granted.resolved).toBe(true);
    expect(granted.moduleid).toBe("capture");
    expect(granted.provenance?.runid).toBe("run1");
    const refused = resolvelazymod({ id: "capture", granted: [], firstuse: true, duration: 3, now });
    expect(refused.resolved).toBe(false);
    const unknown = resolvelazymod({ id: "unknown", granted: [], firstuse: true, duration: 1, now });
    expect(unknown.resolved).toBe(false);
    expect(unknown.reason).toMatch(/no lazy module/i);
    const gate = lazyloadgate({ module: lazymodof("capture") as never, granted: [] });
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toMatch(/never granted/i);
    expect(lazyloadgate({ module: lazymodof("capture") as never, granted: ["capture"] }).allowed).toBe(true);
  });

  it("prewarms the user chosen set on startup while the rest stays lazy", () => {
    const records = prewarmmodules({ prewarmset: ["capture", "export"], granted: ["capture", "export", "parse"], now });
    expect(records).toHaveLength(2);
    expect(records.every((record) => record.resolved)).toBe(true);
    expect(records.every((record) => record.provenance?.surface === "startup")).toBe(true);
    const partial = prewarmmodules({ prewarmset: ["capture", "a11ytree"], granted: ["capture"], now });
    expect(partial.map((record) => record.resolved)).toEqual([true, false]);
  });

  it("builds the startup budget view and reports overruns without ever refusing a load", () => {
    const budget = startupbudgetof({ prewarmset: ["capture", "compare", "export"], budget: 2 });
    expect(budget.prewarmed).toEqual(["capture", "compare", "export"]);
    expect(budget.lazy.length).toBe(lazymodcatalog().length - 3);
    expect(budget.total).toBe(lazymodcatalog().length);
    expect(budget.over).toBe(true);
    const cost = startupcostof(budget);
    expect(cost.startupmodules).toBe(3);
    expect(cost.note).toMatch(/exceeds the user startup budget of 2/i);
    const unbudgeted = startupbudgetof({ prewarmset: [] });
    expect(unbudgeted.over).toBe(false);
    expect(unbudgeted.budget).toBeUndefined();
    const gate = lazybudgetvalid({ budget: 2, prewarmed: 3 });
    expect(gate.allowed).toBe(true);
    expect(lazybudgetvalid({ budget: 0, prewarmed: 1 }).allowed).toBe(false);
    expect(lazybudgetvalid({ prewarmed: 4 }).allowed).toBe(true);
  });
});
