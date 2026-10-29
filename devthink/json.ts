/* ── @section jsonparse ───────────────────────────────────────────── */

/**
 * jsonparse.ts — the extraction and validation of the json verdict from
 * the model answer (root layer).
 *
 * the model answers prose that wraps the verdict: fences, preamble, trailing
 * notes. the extractor finds the first balanced json object in the text
 * (brace counting that respects strings and escapes), the validator checks
 * the object against the decision kind (the value belongs to the options,
 * the yesno coerces, the score clamps to the range, the confidence lands in
 * 0-1) and answers a typed failure when nothing parses. pure and multi-mode:
 * the same call runs in the browser and in node, with zero DOM and zero
 * storage.
 */

/** extracts the first balanced json object of a model answer.
 *
 * @param text the raw answer text.
 * @returns the parsed object.
 * @throws decisionerror with code bad-verdict when nothing parses.
 */
export function extractjsonobject(text: string): Record<string, unknown> {
  const start = text.indexOf("{");
  if (start < 0) throw new decisionerror("bad-verdict", null, "the answer carries no json object");
  let depth = 0;
  let instring = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      if (instring) escaped = true;
      continue;
    }
    if (char === '"') instring = !instring;
    if (instring) continue;
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        const slice = text.slice(start, index + 1);
        try {
          const parsed: unknown = JSON.parse(slice);
          if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
            throw new decisionerror("bad-verdict", null, "the json verdict must be an object");
          return parsed as Record<string, unknown>;
        } catch (error) {
          if (error instanceof decisionerror) throw error;
          throw new decisionerror("bad-verdict", null, "the json verdict does not parse");
        }
      }
    }
  }
  throw new decisionerror("bad-verdict", null, "the json verdict never closes");
}

/** the shape a model verdict must carry. */
export type VerdictObject = { value: unknown; confidence: unknown };

/**
 * validates and coerces one parsed object against the decision kind.
 *
 * @param request the decision request (kind, options, range).
 * @param object the parsed json object.
 * @returns the typed value and the clamped confidence.
 * @throws decisionerror with code bad-verdict naming the failing part.
 */
export function validateverdict(
  request: Pick<DecisionRequest, "kind" | "options" | "range">,
  object: Record<string, unknown>
): { value: string | number | boolean; confidence: number } {
  const rawvalue = object.value;
  const rawconfidence = typeof object.confidence === "number" ? object.confidence : Number(object.confidence);
  if (!Number.isFinite(rawconfidence)) throw new decisionerror("bad-verdict", "confidence", "the verdict carries no numeric confidence");
  const confidence = Math.min(1, Math.max(0, rawconfidence));
  if (request.kind === "choice") {
    if (typeof rawvalue !== "string") throw new decisionerror("bad-verdict", "value", "a choice verdict answers a string");
    const options = request.options ?? [];
    const match = options.find((option) => option.toLowerCase() === rawvalue.trim().toLowerCase());
    if (!match) throw new decisionerror("bad-verdict", rawvalue, "the choice answer leaves the declared options");
    return { value: match, confidence };
  }
  if (request.kind === "yesno") {
    if (typeof rawvalue === "boolean") return { value: rawvalue, confidence };
    if (typeof rawvalue === "string") {
      const normalized = rawvalue.trim().toLowerCase();
      if (normalized === "yes" || normalized === "true") return { value: true, confidence };
      if (normalized === "no" || normalized === "false") return { value: false, confidence };
    }
    throw new decisionerror("bad-verdict", String(rawvalue), "a yesno verdict answers yes/no");
  }
  const score = typeof rawvalue === "number" ? rawvalue : Number(rawvalue);
  if (!Number.isFinite(score)) throw new decisionerror("bad-verdict", "value", "a score verdict answers a number");
  const range = request.range ?? { min: 0, max: 1 };
  return { value: Math.min(range.max, Math.max(range.min, score)), confidence };
}


/* ── @section jsondecision ───────────────────────────────────────────── */

/**
 * jsondecision.ts — the typed decision domain of the json model (root
 * layer).
 *
 * the json model answers a structured question with a structured verdict:
 * the caller declares the decision kind (a choice among options, a score in
 * a range, a yes/no), the policy that gates the confidence and the fallback
 * that answers when the gate closes — every constant arrives as a parameter,
 * so a caller tunes its own decision layer without touching this file (the
 * competitor practice: the confidence policy of the decision gates, the
 * typed choices of the type-safe generation tools). pure and multi-mode:
 * the same call runs in the browser (the chat second layer) and in node
 * (the unit tests), with zero DOM and zero storage.
 */

/** the machine readable failure codes of the decision domain. */
export type decisionerrorcode = "bad-kind" | "bad-request" | "bad-policy" | "bad-verdict";

/** the typed decision failure, traceable to the code and the detail. */
export class decisionerror extends Error {
  /** machine readable failure code. */
  readonly code: decisionerrorcode;
  /** the detail the failure is about (when known). */
  readonly detail: string | null;

  constructor(code: decisionerrorcode, detail: string | null, message?: string) {
    super(message ?? `decision ${code}${detail === null ? "" : ` (${detail})`}`);
    this.name = "decisionerror";
    this.code = code;
    this.detail = detail;
  }
}

/** the decision kinds the model answers. */
export type DecisionKind = "choice" | "score" | "yesno";

/** the policy the verdict must satisfy before the caller acts on it. */
export type DecisionPolicy = {
  /** the confidence floor (0-1); below it the fallback answers. */
  minconfidence: number;
  /** what answers when the gate closes (absent: the verdict fails honestly). */
  fallback?: { value: string | number | boolean; reason: string };
};

/** the request the model answers. */
export type DecisionRequest = {
  /** the decision kind. */
  kind: DecisionKind;
  /** the question posed to the model. */
  prompt: string;
  /** the options of a choice decision (required for kind choice). */
  options?: readonly string[];
  /** the inclusive range of a score decision (required for kind score). */
  range?: { min: number; max: number };
  /** the confidence policy (required — the caller tunes its own gate). */
  policy: DecisionPolicy;
};

/** the verdict the second layer answers. */
export type DecisionVerdict =
  | { ok: true; kind: DecisionKind; value: string | number | boolean; confidence: number }
  | { ok: false; kind: DecisionKind; reason: string };

/**
 * validates one decision request before the model pays for it.
 *
 * @param request the request to validate.
 * @returns the request typed as validated.
 * @throws decisionerror with the failing part.
 */
export function validatedecision(request: DecisionRequest): DecisionRequest {
  if (!request || typeof request !== "object") throw new decisionerror("bad-request", null, "decision request must be an object");
  if (request.kind !== "choice" && request.kind !== "score" && request.kind !== "yesno")
    throw new decisionerror("bad-kind", String((request as { kind?: unknown }).kind));
  if (typeof request.prompt !== "string" || request.prompt.trim() === "")
    throw new decisionerror("bad-request", "prompt", "the decision prompt must be a non-empty string");
  const policy = request.policy;
  if (!policy || typeof policy !== "object" || !Number.isFinite(policy.minconfidence) || policy.minconfidence < 0 || policy.minconfidence > 1)
    throw new decisionerror("bad-policy", null, "the confidence policy must carry a minconfidence between 0 and 1");
  if (request.kind === "choice" && (!Array.isArray(request.options) || request.options.length < 2))
    throw new decisionerror("bad-request", "options", "a choice decision carries at least two options");
  if (request.kind === "score") {
    const range = request.range;
    if (!range || !Number.isFinite(range.min) || !Number.isFinite(range.max) || range.min >= range.max)
      throw new decisionerror("bad-request", "range", "a score decision carries an increasing min/max range");
  }
  return request;
}

/**
 * gates one verdict against the policy: the confidence floor decides
 * whether the caller acts on the model or on the fallback.
 *
 * @param kind the decision kind of the request.
 * @param value the parsed verdict value.
 * @param confidence the model confidence (0-1).
 * @param policy the policy of the request.
 * @returns the verdict (the fallback answers when the gate closes).
 */
export function gateverdict(
  kind: DecisionKind,
  value: string | number | boolean,
  confidence: number,
  policy: DecisionPolicy
): DecisionVerdict {
  if (confidence >= policy.minconfidence) return { ok: true, kind, value, confidence };
  if (policy.fallback) return { ok: true, kind, value: policy.fallback.value, confidence };
  return { ok: false, kind, reason: `confidence ${confidence} below the policy floor ${policy.minconfidence}` };
}


/* ── @section jsonengine ───────────────────────────────────────────── */

/**
 * jsonengine.ts — the second layer of the json model (root layer).
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
