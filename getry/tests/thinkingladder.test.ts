import { describe, expect, it } from "bun:test";
import {
  DEFAULTTHINKINGLEVEL,
  THINKINGLEVELS,
  budgetof,
  defaultthinkinglevel,
  islevel,
  listlevels,
  registerthinkinglevels,
} from "../thinking.ts";
import { autothinking } from "../utils.ts";

// ---------------------------------------------------------------------------
// the registerable ladder — the engine freedom law: levels depend on what
// the person registers, never a fixed 7 (pr5)
// ---------------------------------------------------------------------------

describe("the thinking ladder registration (the engine freedom law)", () => {
  it("answers the seven rung family seed when nothing is registered", () => {
    expect(listlevels()).toEqual(THINKINGLEVELS);
    expect(defaultthinkinglevel()).toBe(DEFAULTTHINKINGLEVEL);
    expect(defaultthinkinglevel()).toBe("high");
  });

  it("accepts any count of registered rungs — more than seven rides", () => {
    const twelve = Array.from({ length: 12 }, (_, i) => ({
      level: `run${i}` as const,
      budget: 1000 * (i + 1),
      desc: `registered rung ${i}`,
    }));
    const live = registerthinkinglevels(twelve, { default: "run11" });
    expect(live).toHaveLength(12);
    expect(listlevels()).toHaveLength(12);
    expect(islevel("run0")).toBe(true);
    expect(islevel("run11")).toBe(true);
    expect(islevel("high")).toBe(false);
    expect(budgetof("run3")).toBe(4000);
    expect(autothinking("RUN3")).toBe("run3");
    expect(defaultthinkinglevel()).toBe("run11");
    expect(autothinking("bogus")).toBe("run11");
  });

  it("accepts fewer rungs than seven — one rung rides", () => {
    registerthinkinglevels([{ level: "deep", budget: 999999, desc: "the only rung" }], { default: "deep" });
    expect(listlevels()).toHaveLength(1);
    expect(budgetof("deep")).toBe(999999);
    expect(autothinking("anything")).toBe("deep");
  });

  it("skips invalid entries and keeps the last duplicate", () => {
    const live = registerthinkinglevels(
      [
        { level: "", budget: 5, desc: "nameless" },
        { level: "solo", budget: 7, desc: "first" },
        { level: "solo", budget: 9, desc: "last wins" },
        { level: "negative", budget: -1, desc: "floors to zero" },
      ],
      { default: "solo" },
    );
    expect(live.map((rung) => rung.level)).toEqual(["solo", "negative"]);
    expect(budgetof("solo")).toBe(9);
    expect(budgetof("negative")).toBe(0);
  });

  it("an empty registration answers the ladder untouched", () => {
    const before = listlevels();
    expect(registerthinkinglevels([])).toEqual(before);
  });

  it("restores the family seed when the seed rides back", () => {
    registerthinkinglevels(THINKINGLEVELS);
    expect(listlevels()).toEqual(THINKINGLEVELS);
    expect(islevel("high")).toBe(true);
    expect(autothinking("maximum")).toBe("max");
    expect(defaultthinkinglevel()).toBe("high");
  });
});
