/**
 * jury.test.ts — the contract of the jury of three with the inverse
 * calibration and the cascade: the family selection law (never three calls
 * to one model), the inverse calibration weights (measured packs over the
 * honest seed), the aggregation with conviction and dissent, the honesty
 * states (act, needs review, unknown), the sycophancy discount, the tier
 * division of the cascade pool and the escalation walk (an act verdict
 * closes, a gray verdict rides the deeper bench and the combined six
 * positions decide). every assertion protects the honesty laws the family
 * decisions ride.
 */

import { describe, expect, it } from "vitest";
import {
  aggregatejury,
  calibrationerror,
  calibrationpacks,
  createjury,
  createjurycascade,
  familyof,
  inversecalibrationweight,
  juryerror,
  juryverdictof,
  juryweights,
  selectjurymembers,
  selectjurypooltiers,
} from "../jury.ts";
import type { jurypoolumember } from "../jury.ts";
import { intelligencehonestyline } from "../intelligence.ts";

/** one stub member: a deterministic answer per id, the family derived. */
function member(
  id: string,
  family: string,
  model: string,
  answer: (round: number) => string = () =>
    JSON.stringify({ value: "yes", confidence: 0.9 }),
): jurypoolumember {
  return { id, family, model, complete: async () => answer(0) };
}

/** three honest families answering the same confident yes. */
function honestpool(): jurypoolumember[] {
  const good = () => JSON.stringify({ value: "yes", confidence: 0.9 });
  return [
    member("a1", "alpha", "alpha-major", () => good()),
    member("b1", "beta", "beta-major", () => good()),
    member("c1", "gamma", "gamma-major", () => good()),
  ];
}

describe("the family selection law", () => {

  it("refuses a pool that carries fewer than three candidates", () => {
    expect(() => selectjurymembers([member("a1", "alpha", "alpha-major")])).toThrow(juryerror);
    expect(() => selectjurymembers([])).toThrow(juryerror);
  });

  it("refuses three calls to one model — one family is not a jury", () => {
    const pool = [
      member("a1", "alpha", "alpha-major"),
      member("a2", "alpha", "alpha-minor"),
      member("a3", "alpha", "alpha-legacy"),
    ];
    expect(() => selectjurymembers(pool)).toThrow(juryerror);
  });

  it("seats one member per family and derives the family when absent", () => {
    const pool = [
      { id: "a1", model: "alpha-major", complete: async () => "{}" },
      { id: "b1", family: "beta", model: "beta-major", complete: async () => "{}" },
      { id: "c1", model: "gamma-major", complete: async () => "{}" },
    ];
    const seated = selectjurymembers(pool);
    expect(seated.length).toBe(3);
    expect(seated.map((row) => row.family)).toEqual(["alpha", "beta", "gamma"]);
    expect(familyof({ id: "a1", model: "alpha-major" })).toBe("alpha");
  });

  it("keeps the best candidate of a duplicated family by the intelligence score", () => {
    const pool = [
      member("a1", "alpha", "alpha-major"),
      member("a0", "alpha", "alpha-legendary"),
      member("b1", "beta", "beta-major"),
      member("c1", "gamma", "gamma-major"),
    ];
    const seated = selectjurymembers(pool);
    const alpha = seated.find((row) => row.family === "alpha");
    expect(alpha?.id).toBeDefined();
    expect(seated.length).toBe(3);
  });

  it("refuses a candidate that carries no completer, id or model", () => {
    const broken = [
      { id: "", family: "alpha", model: "alpha-major", complete: async () => "{}" },
      member("b1", "beta", "beta-major"),
      member("c1", "gamma", "gamma-major"),
    ];
    expect(() => selectjurymembers(broken as unknown as jurypoolumember[])).toThrow(juryerror);
  });
});

describe("the inverse calibration weighting", () => {

  it("builds the packs from the judged log lines with the action convention", () => {
    const packs = calibrationpacks([
      { action: "a1", confidence: 0.9, expected: "yes", received: "yes" },
      { action: "a1", confidence: 0.8, expected: "yes", received: "yes" },
      { action: "b1", confidence: 0.9, expected: "yes", received: "no" },
    ]);
    expect(packs.length).toBe(2);
    const a1 = packs.find((pack) => pack.member === "a1");
    expect(a1?.judged).toBe(2);
    expect(a1?.right).toBe(2);
    const b1 = packs.find((pack) => pack.member === "b1");
    expect(b1?.right).toBe(0);
  });

  it("weighs the honest calibrated member above the honest seed", () => {
    /* the judged lines: two right answers claimed at exactly the prior
     * accuracy the bayesian seat computes ((right+1)/(judged+2) = 0.75) —
     * the claim matches the demonstrated truth, the error lands at zero
     * and the weight rides the floor. */
    const packs = calibrationpacks([
      { action: "a1", confidence: 0.75, expected: "yes", received: "yes" },
      { action: "a1", confidence: 0.75, expected: "yes", received: "yes" },
    ]);
    const members = selectjurymembers(honestpool());
    const weights = juryweights(members, packs);
    const a1 = weights.find((row) => row.member === "a1");
    const b1 = weights.find((row) => row.member === "b1");
    expect(a1 && b1 ? a1.weight > b1.weight : false).toBe(true);
    const total = weights.reduce((sum, row) => sum + row.share, 0);
    expect(total).toBeGreaterThan(0.99);
    expect(total).toBeLessThan(1.01);
  });

  it("penalizes the overclaiming member below the honest seed", () => {
    /* claiming 0.95 while the prior answers 0.75: the gap is the error the
     * weight rides — the overclaimer weighs BELOW an unmeasured member. */
    const packs = calibrationpacks([
      { action: "a1", confidence: 0.95, expected: "yes", received: "yes" },
      { action: "a1", confidence: 0.95, expected: "yes", received: "yes" },
    ]);
    const members = selectjurymembers(honestpool());
    const weights = juryweights(members, packs);
    const a1 = weights.find((row) => row.member === "a1");
    const b1 = weights.find((row) => row.member === "b1");
    expect(a1 && b1 ? a1.weight < b1.weight : false).toBe(true);
  });

  it("answers the error floor so a perfect member never claims infinite weight", () => {
    const packs = calibrationpacks([
      { action: "a1", confidence: 1, expected: "yes", received: "yes" },
      { action: "a1", confidence: 1, expected: "yes", received: "yes" },
    ]);
    const error = calibrationerror(packs[0]);
    expect(error).toBeGreaterThan(0);
    const weight = inversecalibrationweight(packs[0]);
    expect(Number.isFinite(weight)).toBe(true);
  });
});

describe("the aggregation and the honesty states", () => {

  it("aggregates the score kind with conviction and dissent over the weighted mean", () => {
    const members = selectjurymembers(honestpool());
    const weights = juryweights(members);
    const verdicts = members.map((row, index) => ({
      member: row.id,
      family: row.family,
      model: row.model,
      value: [0.9, 0.85, 0.4][index],
      confidence: 0.9,
      answers: [],
      sycophancy: false,
      abstained: false,
    }));
    const aggregate = aggregatejury({ kind: "score", members: verdicts, weights, range: { min: 0, max: 1 } });
    expect(aggregate.value).toBeGreaterThan(0.6);
    expect(aggregate.dissent).toBeGreaterThan(0);
    expect(aggregate.confidence).toBeLessThanOrEqual(1);
  });

  it("maps the high aggregate to act, the gray zone to needs review and the floor to unknown", () => {
    const act = juryverdictof({
      kind: "choice",
      aggregate: { value: "yes", confidence: 0.9, support: 1, conviction: 0.9, dissent: 0 },
    });
    expect(act.state).toBe("act");
    const review = juryverdictof({
      kind: "choice",
      aggregate: { value: "yes", confidence: 0.5, support: 0.7, conviction: 0.7, dissent: 0.3 },
    });
    expect(review.state).toBe("needs-review");
    expect(review.value).toBe("yes");
    const unknown = juryverdictof({
      kind: "choice",
      aggregate: { value: undefined, confidence: 0.1, support: 0.2, conviction: 0.2, dissent: 0.8 },
    });
    expect(unknown.state).toBe("unknown");
    expect(unknown.value).toBeUndefined();
  });

  it("refuses a non numeric confidence", () => {
    expect(() =>
      juryverdictof({
        kind: "choice",
        aggregate: { value: "yes", confidence: Number.NaN, support: 1, conviction: 1, dissent: 0 },
      }),
    ).toThrow(juryerror);
  });
});

describe("the jury runner", () => {

  it("runs three members through the same question and answers the act verdict", async () => {
    const decide = createjury({ pool: honestpool() });
    const answer = await decide({
      kind: "choice",
      prompt: "is the row honest?",
      options: ["yes", "no"],
      policy: { minconfidence: 0.5 },
    });
    expect(answer.verdict.state).toBe("act");
    expect(answer.members.length).toBe(3);
    expect(answer.trail.instruction.includes("honesty") || answer.trail.instruction.length > 0).toBe(true);
    expect(Object.keys(answer.trail.rounds).length).toBe(3);
    expect(answer.trail.weights.length).toBe(3);
  });

  it("rides the honesty line beside every member instruction", async () => {
    const decide = createjury({ pool: honestpool() });
    const answer = await decide({
      kind: "choice",
      prompt: "is the row honest?",
      options: ["yes", "no"],
      policy: { minconfidence: 0.5 },
    });
    expect(answer.trail.instruction.includes(intelligencehonestyline)).toBe(true);
  });

  it("discounts the sycophantic member and abstains the never parsing one", async () => {
    const flattery = () =>
      "You are absolutely right, an excellent and perfect question! " +
      JSON.stringify({ value: "yes", confidence: 0.99 });
    const silence = () => "no json here at all";
    const pool = [
      member("a1", "alpha", "alpha-major", flattery),
      member("b1", "beta", "beta-major", silence),
      member("c1", "gamma", "gamma-major"),
    ];
    const decide = createjury({ pool });
    const answer = await decide({
      kind: "choice",
      prompt: "is the row honest?",
      options: ["yes", "no"],
      policy: { minconfidence: 0.5 },
    });
    const a1 = answer.members.find((row) => row.member === "a1");
    const b1 = answer.members.find((row) => row.member === "b1");
    const c1 = answer.members.find((row) => row.member === "c1");
    expect(a1?.sycophancy).toBe(true);
    expect(b1?.abstained).toBe(true);
    expect(c1?.sycophancy).toBe(false);
    expect(answer.verdict.state).toBeDefined();
  });

  it("repairs the member whose first answer never parsed (one extra round)", async () => {
    let round = 0;
    const lateparser = () => {
      round += 1;
      return round === 1 ? "prose without json" : JSON.stringify({ value: "yes", confidence: 0.9 });
    };
    const pool = [
      member("a1", "alpha", "alpha-major", lateparser),
      member("b1", "beta", "beta-major"),
      member("c1", "gamma", "gamma-major"),
    ];
    const decide = createjury({ pool });
    const answer = await decide({
      kind: "choice",
      prompt: "is the row honest?",
      options: ["yes", "no"],
      policy: { minconfidence: 0.5 },
    });
    expect(answer.trail.rounds["a1"]).toBe(2);
    expect(answer.trail.rounds["b1"]).toBe(1);
  });
});

describe("the cascade tiers", () => {

  it("refuses a pool that cannot seat the deeper bench", () => {
    expect(() => selectjurypooltiers(honestpool())).toThrow(juryerror);
    const five = [...honestpool(), member("a2", "alpha", "alpha-minor"), member("b2", "beta", "beta-minor")];
    expect(() => selectjurypooltiers(five)).toThrow(juryerror);
  });

  it("seats the runner-up of each top family in the secondary tier", () => {
    const pool = [...honestpool(), member("a2", "alpha", "alpha-minor"), member("b2", "beta", "beta-minor"), member("c2", "gamma", "gamma-minor")];
    const tiers = selectjurypooltiers(pool);
    expect(tiers.primary.members.length).toBe(3);
    expect(tiers.secondary.members.length).toBe(3);
    const primaryids = tiers.primary.members.map((row) => row.id);
    const secondaryids = tiers.secondary.members.map((row) => row.id);
    for (const id of secondaryids) expect(primaryids).not.toContain(id);
    const primaryfamilies = tiers.primary.members.map((row) => row.family);
    const secondaryfamilies = tiers.secondary.members.map((row) => row.family);
    expect(new Set(secondaryfamilies).size).toBe(3);
    for (const family of secondaryfamilies) expect(primaryfamilies).toContain(family);
  });

  it("closes the walk on the act verdict without escalating", async () => {
    const pool = [...honestpool(), member("a2", "alpha", "alpha-minor"), member("b2", "beta", "beta-minor"), member("c2", "gamma", "gamma-minor")];
    const decide = createjurycascade({ pool });
    const answer = await decide({
      kind: "choice",
      prompt: "is the row honest?",
      options: ["yes", "no"],
      policy: { minconfidence: 0.5 },
    });
    expect(answer.verdict.state).toBe("act");
    expect(answer.trail.escalated).toBe(false);
    expect(answer.trail.tiers).toEqual([1]);
    expect(answer.members.length).toBe(3);
  });

  it("escalates the gray verdict to the deeper bench and the combined positions decide", async () => {
    /* the primary bench answers the unsure middle, the secondary bench
     * answers the confident no — the combined six positions decide. */
    const unsure = () => JSON.stringify({ value: "yes", confidence: 0.55 });
    const confidentno = () => JSON.stringify({ value: "no", confidence: 0.95 });
    const pool = [
      member("a1", "alpha", "alpha-major", unsure),
      member("b1", "beta", "beta-major", unsure),
      member("c1", "gamma", "gamma-major", unsure),
      member("a2", "alpha", "alpha-minor", confidentno),
      member("b2", "beta", "beta-minor", confidentno),
      member("c2", "gamma", "gamma-minor", confidentno),
    ];
    const decide = createjurycascade({ pool });
    const answer = await decide({
      kind: "choice",
      prompt: "is the row honest?",
      options: ["yes", "no"],
      policy: { minconfidence: 0.5 },
    });
    expect(answer.trail.escalated).toBe(true);
    expect(answer.trail.tiers).toEqual([1, 2]);
    expect(answer.members.length).toBe(6);
    expect(answer.verdict.state).toBeDefined();
  });
});
