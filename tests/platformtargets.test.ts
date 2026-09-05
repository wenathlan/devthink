import { describe, expect, it } from "vitest";
import { matrixtargetof, matrixverify, platformmatrixof, platformtargets, targetoutput } from "../runtime.js";
import { platformmatrixgate } from "../policy.js";
import type { platformtarget } from "../types.js";

describe("the platform matrix", () => {
  it("declares the browser, node, bun and deno targets in one matrix", () => {
    const targets = platformtargets();
    expect(targets.map(target => target.runtime)).toEqual(["browser", "node", "bun", "deno"]);
    expect(targets.every(target => target.declarations)).toBe(true);
    expect(targets.every(target => target.entry.endsWith(".ts"))).toBe(true);
    expect(matrixtargetof(targets, "browser")).toMatchObject({ entry: "umd.ts", format: "umd", platform: "browser" });
    expect(matrixtargetof(targets, "node")).toMatchObject({ entry: "node.ts", format: "cjs", platform: "node" });
    expect(matrixtargetof(targets, "bun")).toMatchObject({ entry: "bun.ts", format: "esm", platform: "node" });
    expect(matrixtargetof(targets, "deno")).toMatchObject({ entry: "deno.ts", format: "esm", platform: "neutral" });
    expect(() => matrixtargetof(targets, "browser" as never)).not.toThrow();
  });

  it("gates the matrix so every runtime declares exactly one target with its declaration set", () => {
    const targets = platformtargets();
    expect(platformmatrixgate(targets).allowed).toBe(true);
    expect(platformmatrixgate(targets.slice(0, 3)).allowed).toBe(false);
    expect(platformmatrixgate([...targets, targets[0] as platformtarget]).allowed).toBe(false);
    expect(platformmatrixgate(targets.map(target => ({ ...target, declarations: false }))).allowed).toBe(false);
    expect(platformmatrixgate(targets.map(target => ({ ...target, entry: " " }))).allowed).toBe(false);
    const umdonnode = targets.map(target => target.runtime === "node" ? { ...target, format: "umd" as const } : target);
    expect(platformmatrixgate(umdonnode).allowed).toBe(false);
  });

  it("completes the matrix only when every runtime declares exactly one target", () => {
    expect(platformmatrixof(platformtargets()).complete).toBe(true);
    expect(platformmatrixof(platformtargets().slice(1)).complete).toBe(false);
    expect(platformmatrixof([...platformtargets(), platformtargets()[0] as platformtarget]).complete).toBe(false);
  });

  it("verifies one matrix run against the built entries it finds", () => {
    const targets = platformtargets();
    expect(matrixverify({ targets, present: ["umd.ts", "node.ts", "bun.ts", "deno.ts"] })).toMatchObject({ complete: true, missing: [] });
    const missing = matrixverify({ targets, present: ["umd.ts", "node.ts"] });
    expect(missing.complete).toBe(false);
    expect(missing.missing).toEqual(["bun:bun.ts", "deno:deno.ts"]);
    expect(missing.reason).toMatch(/lacks the built entries/);
  });

  it("reads the output file name of every target bundle", () => {
    expect(targetoutput(matrixtargetof(platformtargets(), "browser"))).toBe("devthink.umd.js");
    expect(targetoutput(matrixtargetof(platformtargets(), "node"))).toBe("node.cjs");
    expect(targetoutput(matrixtargetof(platformtargets(), "bun"))).toBe("bun.js");
    expect(targetoutput(matrixtargetof(platformtargets(), "deno"))).toBe("deno.js");
  });
});
