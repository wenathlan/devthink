import { describe, expect, it } from "vitest";
import { comparemetricdefaults, comparesessionmetrics, firstdivergenceof, joinruns, outputcomparesessionof, outputcompareview, stepcomparisonof, taskinputsignatureof } from "../evidence.js";
import { outputcomparegate, outputcomparereadonlygate } from "../policy.js";
import type { runlogentry } from "../types.js";

const now = 1_800_000_000_000;

function entry(stepid: string, state: runlogentry["state"], summary: string, duration: number, startedat = now): runlogentry {
  return { stepid, label: stepid, state, startedat, duration, summary };
}

describe("outputcompare of two runs", () => {
  it("gates the comparison to runs that share a task input signature and never executes a step", () => {
    const signaturea = taskinputsignatureof({ objective: "digest the invoice table", steps: ["focus", "inspect", "click"] });
    const signatureb = taskinputsignatureof({ objective: "digest the invoice table", steps: ["focus", "inspect", "click"] });
    const signaturec = taskinputsignatureof({ objective: "digest the invoice table", steps: ["focus", "inspect"] });
    expect(signaturea).toBe(signatureb);
    expect(signaturea).not.toBe(signaturec);
    expect(outputcomparegate({ signaturea, signatureb }).allowed).toBe(true);
    expect(outputcomparegate({ signaturea, signatureb: signaturec }).allowed).toBe(false);
    expect(outputcomparegate({ signaturea, signatureb: signaturec }).reason).toMatch(/different task input signatures/);
    expect(outputcomparegate({ signaturea: "", signatureb: "" }).allowed).toBe(false);
    expect(outputcomparereadonlygate({ executessteps: true }).allowed).toBe(false);
    expect(outputcomparereadonlygate({ executessteps: true }).reason).toMatch(/never executes/);
    expect(outputcomparereadonlygate({ executessteps: false }).allowed).toBe(true);
    expect(comparemetricdefaults()).toEqual(["agreement", "divergence", "durationdelta"]);
  });

  it("joins two runs on their step sequence and grades agreement, divergence and duration deltas", () => {
    const logsa = [entry("s1", "done", "focused the table", 100), entry("s2", "done", "clicked export", 200), entry("s3", "done", "only in run a", 50)];
    const logsb = [entry("s1", "done", "focused the table", 120), entry("s2", "done", "clicked export twice", 300)];
    const joined = joinruns(logsa, logsb);
    expect(joined.map(pair => pair.stepid)).toEqual(["s1", "s2", "s3"]);
    expect(joined[2]?.a).toBeDefined();
    expect(joined[2]?.b).toBeUndefined();
    const grades = joined.map(pair => stepcomparisonof(pair));
    expect(grades[0]?.agreement).toBe("agree");
    expect(grades[0]?.durationdelta).toBe(-20);
    expect(grades[1]?.agreement).toBe("diverge");
    expect(grades[1]?.durationdelta).toBe(-100);
    expect(grades[2]?.agreement).toBe("onlyone");
    expect(grades[2]?.durationdelta).toBe(0);
    expect(firstdivergenceof(grades)).toBe(1);
    expect(firstdivergenceof([grades[0] as never])).toBeUndefined();
  });

  it("builds the comparison session with its metric set and highlights the first divergence", () => {
    const logsa = [entry("s1", "done", "focused", 100), entry("s2", "done", "clicked", 200)];
    const logsb = [entry("s1", "done", "focused", 100), entry("s2", "done", "clicked differently", 260)];
    const session = outputcomparesessionof({ runids: ["runa", "runb"], logsa, logsb, now });
    expect(session.runids).toEqual(["runa", "runb"]);
    expect(session.metrics).toEqual(["agreement", "divergence", "durationdelta"]);
    expect(session.firstdivergence).toBe(1);
    expect(() => outputcomparesessionof({ runids: ["runa", " "], logsa, logsb, now })).toThrow(/both run ids/);
    expect(() => outputcomparesessionof({ runids: ["runa", "runa"], logsa, logsb, now })).toThrow(/distinct runs/);
    const view = outputcompareview(session);
    expect(view[1]?.highlighted).toBe(true);
    expect(view[0]?.highlighted).toBe(false);
    const metrics = comparesessionmetrics(session);
    expect(metrics.agree).toBe(1);
    expect(metrics.diverge).toBe(1);
    expect(metrics.reason).toMatch(/first divergence at step index 1/);
    const agreeing = outputcomparesessionof({ runids: ["runa", "runb"], logsa: [entry("s1", "done", "same", 10)], logsb: [entry("s1", "done", "same", 10)], now });
    expect(agreeing.firstdivergence).toBeUndefined();
    expect(comparesessionmetrics(agreeing).reason).toMatch(/agreement across the whole sequence/);
  });
});
