/**
 * json.model.test.ts — the typed decision layer of the json model (root
 * layer).
 */
import { describe, expect, it } from "vitest";
import { decisionerror, gateverdict, validatedecision } from "../json.decision.ts";
import { extractjsonobject, validateverdict } from "../json.parse.ts";
import { createjsonmodel, defaultinstruction } from "../json.engine.ts";

/** Asserts the action throws and the error answers the checks. */
function throwswith(action: () => void, checks: (error: unknown) => boolean): void {
  let caught: unknown;
  let threw = false;
  try {
    action();
  } catch (error) {
    caught = error;
    threw = true;
  }
  expect(threw).toBe(true);
  expect(checks(caught)).toBe(true);
}

describe("the decision domain", () => {
  it("rejects a choice request without options", () => {
    throwswith(
      () => validatedecision({ kind: "choice", prompt: "pick", policy: { minconfidence: 0.7 } }),
      (error: unknown) => error instanceof decisionerror && error.code === "bad-request"
    );
  });

  it("rejects a score request with an inverted range", () => {
    throwswith(
      () => validatedecision({ kind: "score", prompt: "rate", range: { min: 5, max: 1 }, policy: { minconfidence: 0.5 } }),
      (error: unknown) => error instanceof decisionerror && error.code === "bad-request"
    );
  });

  it("gates the verdict on the policy floor and answers the fallback", () => {
    const low = gateverdict("choice", "alpha", 0.4, { minconfidence: 0.7, fallback: { value: "alpha", reason: "default" } });
    expect(low.ok).toBe(true);
    const closed = gateverdict("choice", "alpha", 0.4, { minconfidence: 0.7 });
    expect(closed.ok).toBe(false);
    const open = gateverdict("choice", "alpha", 0.9, { minconfidence: 0.7 });
    expect(open.ok && open.value).toBe("alpha");
  });
});

describe("the verdict parsing", () => {
  it("extracts the object through fences and prose", () => {
    const object = extractjsonobject('Sure! ```json\n{"value": "alpha", "confidence": 0.9}\n``` hope that helps');
    expect(object.value).toBe("alpha");
  });

  it("respects braces inside strings while counting", () => {
    const object = extractjsonobject('{"value": "a}b", "confidence": 1} trailing }');
    expect(object.value).toBe("a}b");
  });

  it("coerces the yesno kind and clamps the score", () => {
    const yes = validateverdict({ kind: "yesno" }, { value: "Yes", confidence: 0.8 });
    expect(yes.value).toBe(true);
    const score = validateverdict({ kind: "score", range: { min: 0, max: 10 } }, { value: 14, confidence: 2 });
    expect(score.value).toBe(10);
    expect(score.confidence).toBe(1);
  });

  it("refuses a choice answer outside the options", () => {
    throwswith(
      () => validateverdict({ kind: "choice", options: ["alpha", "beta"] }, { value: "gamma", confidence: 1 }),
      (error: unknown) => error instanceof decisionerror && error.code === "bad-verdict"
    );
  });
});

describe("the second layer", () => {
  it("answers a parsed verdict with the recipe instruction", async () => {
    const model = createjsonmodel({
      complete: async () => '{"value": "beta", "confidence": 0.92}',
      recipes: [{ kind: "choice", instruction: "pick fast" }],
    });
    const { verdict, trail } = await model({
      kind: "choice",
      prompt: "which path",
      options: ["alpha", "beta"],
      policy: { minconfidence: 0.5 },
    });
    expect(verdict.ok && verdict.value).toBe("beta");
    expect(trail.rounds).toBe(1);
    expect(trail.instruction).toBe("pick fast");
  });

  it("repairs once when the first answer does not parse", async () => {
    let calls = 0;
    const model = createjsonmodel({
      complete: async () => {
        calls += 1;
        return calls === 1 ? "I think the answer is beta, honestly." : '{"value": "beta", "confidence": 0.8}';
      },
    });
    const { verdict, trail } = await model({
      kind: "choice",
      prompt: "which path",
      options: ["alpha", "beta"],
      policy: { minconfidence: 0.5 },
    });
    expect(verdict.ok && verdict.value).toBe("beta");
    expect(trail.rounds).toBe(2);
    expect(trail.answers.length).toBe(2);
  });

  it("fails honestly when both rounds miss", async () => {
    const model = createjsonmodel({ complete: async () => "no json here" });
    const { verdict } = await model({
      kind: "yesno",
      prompt: "is it",
      policy: { minconfidence: 0.1 },
    });
    expect(verdict.ok).toBe(false);
  });

  it("routes the default instruction per kind", () => {
    const choice = defaultinstruction({ kind: "choice", prompt: "x", options: ["a", "b"], policy: { minconfidence: 0.5 } });
    expect(choice).toMatch(/a \| b/);
  });
});
