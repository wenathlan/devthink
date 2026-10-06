/**
 * json.engine.ts — the second layer of the json model (root layer).
 *
 * the flow the platform runs: the caller declares a typed decision, the
 * engine builds the instruction, one LLM round answers through the injected
 * link (the local gateway client is the natural provider — the engine takes
 * the completer as a parameter so nothing here is bound to one endpoint or
 * one vendor), the answer parses to the verdict and the policy gates it.
 * one repair round re-asks when the first answer does not parse. the recipe
 * table arrives as a parameter (which instruction per decision kind), the
 * competitor practice of the decision gates: declare the recipes, route the
 * kind, measure the confidence, fall back honestly. pure and multi-mode:
 * the same call runs in the browser and in node, with zero DOM and zero
 * storage.
 */
import {
  decisionerror,
  gateverdict,
  validatedecision,
  type DecisionRequest,
  type DecisionVerdict,
} from "./json.decision.ts";
import { extractjsonobject, validateverdict } from "./json.parse.ts";

/** one recipe of the decision router: the instruction the kind asks with. */
export type DecisionRecipe = {
  /** the decision kind the recipe serves. */
  kind: DecisionRequest["kind"];
  /** the extra instruction riding the system side of the round. */
  instruction: string;
};

/** the injected LLM link: one round over the configured gateway. */
export type Completer = (messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) => Promise<string>;

/** the trail of one decide run (the internal cognition of the verdict). */
export type DecisionTrail = {
  /** the rounds the engine paid (1 or 2 with the repair). */
  rounds: number;
  /** the raw answers per round. */
  answers: string[];
  /** the recipe instruction that rode the round. */
  instruction: string;
};

/**
 * builds the default instruction of one kind (the recipe table may
 * override it per kind).
 *
 * @param request the validated request.
 * @returns the instruction text.
 */
export function defaultinstruction(request: DecisionRequest): string {
  if (request.kind === "choice")
    return `Answer only a JSON object {"value": one of [${(request.options ?? []).join(" | ")}], "confidence": 0..1}. No prose.`;
  if (request.kind === "score")
    return `Answer only a JSON object {"value": a number between ${(request.range ?? { min: 0, max: 1 }).min} and ${
      (request.range ?? { min: 0, max: 1 }).max
    }, "confidence": 0..1}. No prose.`;
  return 'Answer only a JSON object {"value": true or false, "confidence": 0..1}. No prose.';
}

/**
 * creates the second layer: the caller injects the LLM link and the recipe
 * table; the returned decide runs the flow per request.
 *
 * @param config the completer (the gateway round) and the recipe table.
 * @returns the decide function with the typed verdict and trail.
 */
export function createjsonmodel(config: {
  complete: Completer;
  recipes?: readonly DecisionRecipe[];
}): (request: DecisionRequest) => Promise<{ verdict: DecisionVerdict; trail: DecisionTrail }> {
  if (!config || typeof config.complete !== "function")
    throw new decisionerror("bad-policy", null, "the json model carries an injected completer");
  const recipes = config.recipes ?? [];

  return async (request) => {
    const validated = validatedecision(request);
    const recipe = recipes.find((entry) => entry.kind === validated.kind);
    const instruction = recipe?.instruction ?? defaultinstruction(validated);
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: instruction },
      { role: "user", content: validated.prompt },
    ];
    const trail: DecisionTrail = { rounds: 0, answers: [], instruction };

    let lasterror: unknown = null;
    for (let round = 0; round < 2; round += 1) {
      trail.rounds += 1;
      const answer = await config.complete(messages);
      trail.answers.push(answer);
      try {
        const object = extractjsonobject(answer);
        const parsed = validateverdict(validated, object);
        return { verdict: gateverdict(validated.kind, parsed.value, parsed.confidence, validated.policy), trail };
      } catch (error) {
        lasterror = error;
        if (round === 0) messages.push({ role: "assistant", content: answer }, { role: "user", content: "Answer again with only the JSON object. No prose, no fences." });
      }
    }
    const detail = lasterror instanceof decisionerror ? lasterror.detail : null;
    return { verdict: { ok: false, kind: validated.kind, reason: `the model never answered a parseable verdict${detail ? ` (${detail})` : ""}` }, trail };
  };
}
