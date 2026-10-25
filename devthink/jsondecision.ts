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
