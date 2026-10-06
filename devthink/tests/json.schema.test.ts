/**
 * json.schema.test.ts — the declarative schema bridge of the json model
 * (root layer): the compilation to instruction plus validator, the second
 * layer over the declared shape and the bridge from the fixed kinds.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decisionerror } from "../json.decision.ts";
import { compilejsonschema, createschemamodel, schemaerror, schemafromdecision, type JsonObjectSchema, type SchemaField } from "../json.schema.ts";

const review: JsonObjectSchema = {
  instructions: "Review the patch before the agent applies it",
  properties: {
    verdict: { type: "string", enum: ["apply", "fix", "reject"], instructions: "What should happen to the patch?" },
    score: { type: "integer", instructions: "Quality from 0 to 10" },
    note: { type: "string", instructions: "One sentence of feedback", optional: true },
    blocking: { type: "boolean", instructions: "Does it block the release?" },
  },
};

describe("the schema compilation", () => {
  it("builds the instruction with the enum, the fields and the confidence", () => {
    const compiled = compilejsonschema(review);
    assert.match(compiled.instruction, /"verdict": one of \[apply \| fix \| reject\] — What should happen to the patch\?/);
    assert.match(compiled.instruction, /"note": a string — One sentence of feedback \(optional\)/);
    assert.match(compiled.instruction, /"confidence": a number between 0 and 1/);
    assert.deepEqual(compiled.fields, ["verdict", "score", "note", "blocking"]);
  });

  it("keeps a declared confidence and refuses an optional one", () => {
    const declared = compilejsonschema({ properties: { confidence: { type: "number" } } });
    assert.ok(!declared.instruction.includes("self graded confidence"));
    assert.throws(
      () => compilejsonschema({ properties: { confidence: { type: "number", optional: true } } }),
      (error: unknown) => error instanceof schemaerror && error.detail === "confidence"
    );
  });

  it("refuses an empty set, a broken enum, a wrong candidate type and an unknown type", () => {
    assert.throws(() => compilejsonschema({ properties: {} }), (error: unknown) => error instanceof schemaerror);
    assert.throws(
      () => compilejsonschema({ properties: { a: { type: "string", enum: [] } } }),
      (error: unknown) => error instanceof schemaerror && error.detail === "a"
    );
    assert.throws(
      () => compilejsonschema({ properties: { a: { type: "integer", enum: ["one"] } } }),
      (error: unknown) => error instanceof schemaerror
    );
    assert.throws(
      () => compilejsonschema({ properties: { a: { type: "boolean", enum: [true] } as unknown as SchemaField } }),
      (error: unknown) => error instanceof schemaerror
    );
    assert.throws(
      () => compilejsonschema({ properties: { a: { type: "float" } as unknown as SchemaField } }),
      (error: unknown) => error instanceof schemaerror && error.detail === "a"
    );
  });

  it("caps the enum at the type-safe generation limit and refuses repeats", () => {
    const big = Array.from({ length: 25 }, (_, index) => `v${index}`);
    assert.throws(
      () => compilejsonschema({ properties: { a: { type: "string", enum: big } } }),
      (error: unknown) => error instanceof schemaerror
    );
    assert.throws(
      () => compilejsonschema({ properties: { a: { type: "string", enum: ["same", "same"] } } }),
      (error: unknown) => error instanceof schemaerror
    );
  });
});

describe("the schema validation", () => {
  it("accepts a valid object and clamps the confidence", () => {
    const compiled = compilejsonschema(review);
    const parsed = compiled.validate({ verdict: "fix", score: 7, blocking: false, confidence: 1.4 });
    assert.deepEqual(parsed.value, { verdict: "fix", score: 7, blocking: false });
    assert.equal(parsed.confidence, 1);
  });

  it("misses nothing required, allows the optional, refuses the out-of-schema", () => {
    const compiled = compilejsonschema(review);
    assert.ok(compiled.validate({ verdict: "fix", score: 7, blocking: true, confidence: 0.5 }).value);
    assert.throws(
      () => compiled.validate({ verdict: "fix", score: 7, confidence: 0.5 }),
      (error: unknown) => error instanceof decisionerror && error.detail === "blocking"
    );
    assert.throws(
      () => compiled.validate({ verdict: "fix", score: 7, blocking: true, extra: 1, confidence: 0.5 }),
      (error: unknown) => error instanceof decisionerror && error.detail === "extra"
    );
  });

  it("holds the primitive contracts: integer, enum membership, boolean", () => {
    const compiled = compilejsonschema(review);
    assert.throws(
      () => compiled.validate({ verdict: "apply", score: 7.5, blocking: true, confidence: 0.5 }),
      (error: unknown) => error instanceof decisionerror && error.detail === "score"
    );
    assert.throws(
      () => compiled.validate({ verdict: "merge", score: 7, blocking: true, confidence: 0.5 }),
      (error: unknown) => error instanceof decisionerror && error.detail === "verdict"
    );
    assert.throws(
      () => compiled.validate({ verdict: "apply", score: 7, blocking: "no", confidence: 0.5 }),
      (error: unknown) => error instanceof decisionerror && error.detail === "blocking"
    );
  });
});

describe("the schema second layer", () => {
  const policy = { minconfidence: 0.6 };

  it("answers a schema-valid object through the injected completer", async () => {
    const model = createschemamodel({
      complete: async () => '```json\n{"verdict": "apply", "score": 9, "blocking": false, "confidence": 0.93}\n```',
      schema: review,
      policy,
    });
    const { verdict, trail } = await model("review the auth patch");
    assert.equal(verdict.ok && verdict.value.score, 9);
    assert.equal(trail.rounds, 1);
    assert.match(trail.instruction, /Review the patch/);
  });

  it("repairs once and fails honestly after the second miss", async () => {
    let calls = 0;
    const model = createschemamodel({
      complete: async () => {
        calls += 1;
        return calls === 1 ? "The verdict is apply, clearly." : '{"verdict": "apply", "score": 9, "blocking": false, "confidence": 0.7}';
      },
      schema: review,
      policy,
    });
    const good = await model("review it");
    assert.equal(good.verdict.ok && good.trail.rounds, 2);
    const dead = createschemamodel({ complete: async () => "no json here", schema: review, policy });
    const { verdict, trail } = await dead("review it");
    assert.equal(verdict.ok, false);
    assert.equal(trail.rounds, 2);
  });

  it("closes the gate on low confidence and answers the fallback record", async () => {
    const closed = createschemamodel({
      complete: async () => '{"verdict": "apply", "score": 9, "blocking": false, "confidence": 0.2}',
      schema: review,
      policy,
    });
    const { verdict } = await closed("review it");
    assert.equal(verdict.ok, false);
    const fallback = createschemamodel({
      complete: async () => '{"verdict": "apply", "score": 9, "blocking": false, "confidence": 0.2}',
      schema: review,
      policy: { minconfidence: 0.6, fallback: { value: { verdict: "reject" }, reason: "low confidence" } },
    });
    const next = await fallback("review it");
    assert.equal(next.verdict.ok && next.verdict.value.verdict, "reject");
  });
});

describe("the decision bridge", () => {
  it("reads the fixed kinds as declared schemas", () => {
    const choice = compilejsonschema(schemafromdecision({ kind: "choice", options: ["alpha", "beta"] }));
    assert.match(choice.instruction, /alpha \| beta/);
    assert.equal(choice.validate({ value: "beta", confidence: 0.8 }).value.value, "beta");
    const yesno = compilejsonschema(schemafromdecision({ kind: "yesno" }));
    assert.equal(yesno.validate({ value: true, confidence: 0.5 }).value.value, true);
    const score = compilejsonschema(schemafromdecision({ kind: "score", range: { min: 0, max: 10 } }));
    assert.equal(score.validate({ value: 4, confidence: 0.5 }).value.value, 4);
  });

  it("refuses a choice schema without candidates", () => {
    assert.throws(
      () => schemafromdecision({ kind: "choice" }),
      (error: unknown) => error instanceof schemaerror && error.detail === "options"
    );
  });
});
