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
import { decisionerror, type DecisionKind, type DecisionRequest } from "./jsondecision.ts";

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
