/**
 * json.model.test.ts — the typed decision layer of the json model (root
 * layer).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decisionerror, gateverdict, validatedecision } from "../json.decision.ts";
import { extractjsonobject, validateverdict } from "../json.parse.ts";
import { createjsonmodel, defaultinstruction } from "../json.engine.ts";

describe("the decision domain", () => {
  it("rejects a choice request without options", () => {
    assert.throws(
      () => validatedecision({ kind: "choice", prompt: "pick", policy: { minconfidence: 0.7 } }),
      (error: unknown) => error instanceof decisionerror && error.code === "bad-request"
    );
  });

  it("rejects a score request with an inverted range", () => {
    assert.throws(
      () => validatedecision({ kind: "score", prompt: "rate", range: { min: 5, max: 1 }, policy: { minconfidence: 0.5 } }),
      (error: unknown) => error instanceof decisionerror && error.code === "bad-request"
    );
  });

  it("gates the verdict on the policy floor and answers the fallback", () => {
    const low = gateverdict("choice", "alpha", 0.4, { minconfidence: 0.7, fallback: { value: "alpha", reason: "default" } });
    assert.equal(low.ok, true);
    const closed = gateverdict("choice", "alpha", 0.4, { minconfidence: 0.7 });
    assert.equal(closed.ok, false);
    const open = gateverdict("choice", "alpha", 0.9, { minconfidence: 0.7 });
    assert.equal(open.ok && open.value, "alpha");
  });
});

describe("the verdict parsing", () => {
  it("extracts the object through fences and prose", () => {
    const object = extractjsonobject('Sure! ```json\n{"value": "alpha", "confidence": 0.9}\n``` hope that helps');
    assert.equal(object.value, "alpha");
  });

  it("respects braces inside strings while counting", () => {
    const object = extractjsonobject('{"value": "a}b", "confidence": 1} trailing }');
    assert.equal(object.value, "a}b");
  });

  it("coerces the yesno kind and clamps the score", () => {
    const yes = validateverdict({ kind: "yesno" }, { value: "Yes", confidence: 0.8 });
    assert.equal(yes.value, true);
    const score = validateverdict({ kind: "score", range: { min: 0, max: 10 } }, { value: 14, confidence: 2 });
    assert.equal(score.value, 10);
    assert.equal(score.confidence, 1);
  });

  it("refuses a choice answer outside the options", () => {
    assert.throws(
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
    assert.equal(verdict.ok && verdict.value, "beta");
    assert.equal(trail.rounds, 1);
    assert.equal(trail.instruction, "pick fast");
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
    assert.equal(verdict.ok && verdict.value, "beta");
    assert.equal(trail.rounds, 2);
    assert.equal(trail.answers.length, 2);
  });

  it("fails honestly when both rounds miss", async () => {
    const model = createjsonmodel({ complete: async () => "no json here" });
    const { verdict } = await model({
      kind: "yesno",
      prompt: "is it",
      policy: { minconfidence: 0.1 },
    });
    assert.equal(verdict.ok, false);
  });

  it("routes the default instruction per kind", () => {
    const choice = defaultinstruction({ kind: "choice", prompt: "x", options: ["a", "b"], policy: { minconfidence: 0.5 } });
    assert.match(choice, /a \| b/);
  });
});
