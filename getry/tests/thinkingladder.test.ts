import { describe, expect, it } from "vitest";
import {
  DEFAULTTHINKINGLEVEL,
  THINKINGLEVELS,
  TWOCALLSTHRESHOLD,
  type ThinkingLevelName,
  budgetof,
  clampbudget,
  defaultthinkinglevel,
  fallbackchain,
  islevel,
  lanesof,
  listlevels,
  providerchain,
  type thinkingproviderrow,
  providersserving,
  registerthinkinglevels,
  targettier,
  twocallspattern,
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

// ---------------------------------------------------------------------------
// the thinking seat routing — the tier ladder, the budget clamp, the
// two-calls verdict, the fallback chain, the lanes and the provider catalog
// (the pr19 thinking seat: the level selects the model tier, the token
// budget and the fallback chain — pure math, no gateway import)
// ---------------------------------------------------------------------------

describe("the thinking seat routing (the family seed ladder)", () => {
  it("routes each seed rung to its model tier by ladder position", () => {
    registerthinkinglevels(THINKINGLEVELS, { default: "high" });
    expect(targettier("none")).toBe(4);
    expect(targettier("minimal")).toBe(4);
    expect(targettier("low")).toBe(3);
    expect(targettier("medium")).toBe(3);
    expect(targettier("high")).toBe(2);
    expect(targettier("xhigh")).toBe(1);
    expect(targettier("max")).toBe(1);
  });

  it("routes an unknown level to the default rung's tier", () => {
    registerthinkinglevels(THINKINGLEVELS, { default: "high" });
    expect(targettier("bogus" as ThinkingLevelName)).toBe(2);
  });

  it("clamps the level budget to the model output ceiling", () => {
    registerthinkinglevels(THINKINGLEVELS, { default: "high" });
    expect(clampbudget("high")).toBe(68000);
    expect(clampbudget("high", 16384)).toBe(16384);
    expect(clampbudget("none", 16384)).toBe(0);
    // a missing or invalid ceiling never clamps
    expect(clampbudget("high", undefined)).toBe(68000);
    expect(clampbudget("high", Number.NaN)).toBe(68000);
    expect(clampbudget("high", -1)).toBe(68000);
  });

  it("answers the two-calls verdict the engine's zai lane always carried", () => {
    registerthinkinglevels(THINKINGLEVELS, { default: "high" });
    // a thinking level always rides the pattern
    expect(twocallspattern({ level: "minimal", responsemax: 0 })).toBe(true);
    expect(twocallspattern({ level: "high", responsemax: 1 })).toBe(true);
    // none rides the pattern only when the windows cross the threshold
    expect(twocallspattern({ level: "none", responsemax: 1000 })).toBe(false);
    expect(twocallspattern({ level: "none", responsemax: TWOCALLSTHRESHOLD + 1 })).toBe(true);
    // a config threshold and a config budget override win
    expect(twocallspattern({ level: "none", responsemax: 100, threshold: 50 })).toBe(true);
    expect(twocallspattern({ level: "none", responsemax: 100, budget: TWOCALLSTHRESHOLD })).toBe(true);
  });

  it("orders the fallback chain by tier distance, budget fit, score and id", () => {
    registerthinkinglevels(THINKINGLEVELS, { default: "high" });
    const chain = fallbackchain(
      [
        { id: "tier1-small", reasoning: true, maxoutput: 4096, rank: { score: 60, tier: 1 } },
        { id: "tier2-a", reasoning: true, maxoutput: 131072, rank: { score: 40, tier: 2 } },
        { id: "tier2-b", reasoning: true, maxoutput: 131072, rank: { score: 44, tier: 2 } },
        { id: "tier1-big", reasoning: true, maxoutput: 131072, rank: { score: 55, tier: 1 } },
        { id: "tier3", reasoning: true, maxoutput: 131072, rank: { score: 30, tier: 3 } },
        { id: "unranked", reasoning: true, maxoutput: 131072 },
        { id: "nonthinking", reasoning: false, maxoutput: 131072, rank: { score: 90, tier: 1 } },
      ],
      "high",
    );
    // level high targets tier 2: tier-2 rows first (score desc), then the
    // tier-1 row that holds the full budget, then every remaining tier-1
    // and tier-3 row by distance (fullfit before score — the small tier-1
    // rides below the full-fit tier-3), the unranked row last; the
    // reasoning-false row never serves
    expect(chain.map((row) => row.id)).toEqual([
      "tier2-b",
      "tier2-a",
      "tier1-big",
      "tier3",
      "tier1-small",
      "unranked",
    ]);
    // the none level serves every row (no thinking budget to carry)
    expect(fallbackchain([{ id: "nonthinking", reasoning: false }], "none")).toHaveLength(1);
  });

  it("resolves the session and stream lanes in bind order", () => {
    expect(lanesof({})).toEqual([]);
    expect(lanesof({ stream: false, sessionid: null })).toEqual([]);
    expect(lanesof({ stream: true })).toEqual(["stream"]);
    expect(lanesof({ sessionid: "chat-9f21" })).toEqual(["session"]);
    expect(lanesof({ stream: true, sessionid: "chat-9f21" })).toEqual(["session", "stream"]);
    expect(lanesof({ sessionid: "   " })).toEqual([]);
  });

  it("orders the provider chain live first and serves only capable catalogs", () => {
    registerthinkinglevels(THINKINGLEVELS, { default: "high" });
    const catalog: thinkingproviderrow[] = [
      { provider: "pausedone", badge: "paused", models: [{ id: "p1", reasoning: true, rank: { score: 50, tier: 2 } }] },
      { provider: "liveone", badge: "live", models: [{ id: "l1", reasoning: true, rank: { score: 40, tier: 2 } }] },
      { provider: "blind", badge: "live", models: [{ id: "b1", reasoning: false }] },
    ];
    expect(providersserving(catalog, "high").map((row) => row.provider)).toEqual(["liveone", "pausedone"]);
    const chain = providerchain(catalog, "high");
    expect(chain.map((candidate) => `${candidate.provider}/${candidate.model.id}`)).toEqual([
      "liveone/l1",
      "pausedone/p1",
    ]);
  });
});

describe("the thinking seat routing (a registered ladder)", () => {
  it("routes the tier by position over any registered ladder length", () => {
    registerthinkinglevels(
      [
        { level: "quick", budget: 100, desc: "registered floor" },
        { level: "mid", budget: 900, desc: "registered middle" },
        { level: "deep", budget: 90000, desc: "registered ceiling" },
      ],
      { default: "mid" },
    );
    expect(targettier("quick")).toBe(4);
    expect(targettier("mid")).toBe(3);
    expect(targettier("deep")).toBe(1);
    expect(clampbudget("deep", 16384)).toBe(16384);
  });

  it("answers the ceiling a single-rung registration carries", () => {
    registerthinkinglevels([{ level: "only", budget: 500, desc: "the only rung" }], { default: "only" });
    expect(targettier("only")).toBe(1);
    registerthinkinglevels([{ level: "off", budget: 0, desc: "no thinking at all" }], { default: "off" });
    expect(targettier("off")).toBe(4);
  });

  it("restores the family seed for the suites that follow", () => {
    registerthinkinglevels(THINKINGLEVELS, { default: "high" });
    expect(listlevels()).toEqual(THINKINGLEVELS);
    expect(targettier("high")).toBe(2);
  });
});
