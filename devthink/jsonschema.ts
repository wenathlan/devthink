/**
 * jsonschema.ts — the declarative schema bridge of the json model (root
 * layer) — the typellm practice applied: a minimal declared schema (string,
 * integer, number, boolean, enum capped at 24, one object level) compiles
 * into the instruction the model receives and the validator that checks the
 * answer, so the second layer accepts declared shapes beyond the three
 * fixed kinds. one repair round mirrors the engine; the confidence rides
 * the object (the compiler appends the field when the schema does not
 * declare it) and the policy gate closes on it. pure and multi-mode: the
 * same call runs in the browser (the chat second layer) and in node (the
 * unit tests), with zero DOM and zero storage.
 */
import { decisionerror, type DecisionRequest } from "./jsondecision.ts";
import type { Completer, DecisionTrail } from "./jsonengine.ts";
import { extractjsonobject } from "./jsonparse.ts";

/** the machine readable failure codes of the schema domain. */
export type schemaerrorcode = "bad-schema";

/** the typed schema failure, traceable to the declared part. */
export class schemaerror extends Error {
  /** machine readable failure code. */
  readonly code: schemaerrorcode;
  /** the property the declaration fails on (when known). */
  readonly detail: string | null;

  constructor(detail: string | null, message?: string) {
    super(message ?? `schema bad-schema${detail === null ? "" : ` (${detail})`}`);
    this.name = "schemaerror";
    this.code = "bad-schema";
    this.detail = detail;
  }
}

/** the enum cap of the type-safe generation practice (typellm: 24 values). */
export const ENUM_CAP = 24;

/** one declared property: a primitive, an enum or a boolean. */
export type SchemaField = {
  /** the primitive the answer must carry. */
  type: "string" | "integer" | "number" | "boolean";
  /** what the model decides for this property. */
  instructions?: string | undefined;
  /** the closed candidate set (string, integer and number types only). */
  enum?: readonly (string | number)[] | undefined;
  /** absent is accepted when optional (the declared null). */
  optional?: boolean | undefined;
};

/** the declared object shape: one level of named properties. */
export type JsonObjectSchema = {
  /** what the object as a whole decides. */
  instructions?: string | undefined;
  /** the named properties (at least one). */
  properties: Record<string, SchemaField>;
};

/** the compiled schema: the instruction and the validator of one shape. */
export type CompiledSchema = {
  /** the system instruction the model answers against. */
  instruction: string;
  /** the declared property names in declaration order. */
  fields: readonly string[];
  /**
   * validates one parsed object against the shape.
   * @returns the typed record and the clamped confidence.
   * @throws decisionerror with code bad-verdict naming the failing property.
   */
  validate: (object: Record<string, unknown>) => { value: Record<string, unknown>; confidence: number };
};

/** describes one field for the instruction (the definition, not the label). */
function describefield(field: SchemaField): string {
  const base = field.enum ? `one of [${field.enum.join(" | ")}]` : field.type === "integer" ? "an integer" : field.type === "number" ? "a number" : field.type === "boolean" ? "true or false" : "a string";
  const note = field.instructions ? ` — ${field.instructions}` : "";
  const optional = field.optional ? " (optional)" : "";
  return `${base}${note}${optional}`;
}

/** validates one declared field. */
function validfield(name: string, field: SchemaField): void {
  if (!field || (field.type !== "string" && field.type !== "integer" && field.type !== "number" && field.type !== "boolean"))
    throw new schemaerror(name, "the property type is one of string, integer, number, boolean");
  if (field.instructions !== undefined && typeof field.instructions !== "string")
    throw new schemaerror(name, "the instructions are a string");
  if (field.enum !== undefined) {
    if (field.type === "boolean") throw new schemaerror(name, "a boolean carries no enum — true and false are the enum");
    if (!Array.isArray(field.enum) || field.enum.length === 0) throw new schemaerror(name, "the enum carries at least one candidate");
    if (field.enum.length > ENUM_CAP) throw new schemaerror(name, `the enum carries at most ${ENUM_CAP} candidates`);
    const seen = new Set(field.enum.map((option) => String(option)));
    if (seen.size !== field.enum.length) throw new schemaerror(name, "the enum repeats a candidate");
    const wrongtype = field.enum.find(
      (option) => (field.type === "string" && typeof option !== "string") || (field.type !== "string" && typeof option !== "number")
    );
    if (wrongtype !== undefined) throw new schemaerror(name, `the enum candidate ${String(wrongtype)} leaves the declared type`);
    if (field.type === "integer" && field.enum.some((option) => typeof option === "number" && !Number.isInteger(option)))
      throw new schemaerror(name, "an integer enum carries integers only");
  }
}

/**
 * compilejsonschema — one declared shape to the instruction plus the
 * validator: the bridge that lets the second layer answer schemas beyond
 * the fixed kinds. the compiler appends the confidence property when the
 * schema does not declare one (the gate feeds on it) and refuses an
 * optional confidence (the gate cannot read an absent floor).
 *
 * @param schema the declared object shape.
 * @returns the compiled instruction, fields and validator.
 * @throws schemaerror on the first broken declaration.
 */
export function compilejsonschema(schema: JsonObjectSchema): CompiledSchema {
  if (!schema || typeof schema !== "object" || !schema.properties || typeof schema.properties !== "object")
    throw new schemaerror(null, "the schema carries a properties record");
  if (schema.instructions !== undefined && typeof schema.instructions !== "string")
    throw new schemaerror(null, "the schema instructions are a string");
  const names = Object.keys(schema.properties);
  if (names.length === 0) throw new schemaerror(null, "the schema declares at least one property");
  for (const name of names) {
    if (name === "confidence" && schema.properties[name]?.optional)
      throw new schemaerror(name, "the confidence property is the gate — declare it required");
    validfield(name, schema.properties[name]);
  }

  const header = `Answer only a JSON object with exactly these properties${schema.instructions ? ` — ${schema.instructions}` : ""}. No prose, no fences.`;
  const lines = names.map((name) => `- "${name}": ${describefield(schema.properties[name])}`);
  if (!names.includes("confidence")) lines.push('- "confidence": a number between 0 and 1 — your self graded confidence in the answer.');
  const instruction = [header, ...lines].join("\n");

  return {
    instruction,
    fields: names,
    validate(object) {
      if (!object || typeof object !== "object" || Array.isArray(object))
        throw new decisionerror("bad-verdict", null, "the schema verdict must be an object");
      const value: Record<string, unknown> = {};
      for (const name of names) {
        const field = schema.properties[name];
        const raw = object[name];
        if (raw === undefined || raw === null) {
          if (field?.optional) continue;
          throw new decisionerror("bad-verdict", name, "the schema verdict misses a required property");
        }
        if (field?.type === "string") {
          if (typeof raw !== "string") throw new decisionerror("bad-verdict", name, "the property answers a string");
          const text = raw.trim();
          if (field.enum && !field.enum.some((option) => option === text)) throw new decisionerror("bad-verdict", name, "the answer leaves the declared enum");
          value[name] = text;
        } else if (field?.type === "integer") {
          if (typeof raw !== "number" || !Number.isInteger(raw)) throw new decisionerror("bad-verdict", name, "the property answers an integer");
          if (field.enum && !field.enum.some((option) => option === raw)) throw new decisionerror("bad-verdict", name, "the answer leaves the declared enum");
          value[name] = raw;
        } else if (field?.type === "number") {
          if (typeof raw !== "number" || !Number.isFinite(raw)) throw new decisionerror("bad-verdict", name, "the property answers a number");
          if (field.enum && !field.enum.some((option) => option === raw)) throw new decisionerror("bad-verdict", name, "the answer leaves the declared enum");
          value[name] = raw;
        } else {
          if (typeof raw !== "boolean") throw new decisionerror("bad-verdict", name, "the property answers true or false");
          value[name] = raw;
        }
      }
      for (const key of Object.keys(object)) {
        if (key !== "confidence" && !names.includes(key))
          throw new decisionerror("bad-verdict", key, "the answer carries an out-of-schema property");
      }
      const rawconfidence = typeof object.confidence === "number" ? object.confidence : Number(object.confidence);
      if (!Number.isFinite(rawconfidence)) throw new decisionerror("bad-verdict", "confidence", "the verdict carries no numeric confidence");
      return { value, confidence: Math.min(1, Math.max(0, rawconfidence)) };
    },
  };
}

/* --------------------------- the second layer -------------------------- */

/** the policy the schema verdict must satisfy (the record is the value). */
export type SchemaPolicy = {
  /** the confidence floor (0-1); below it the fallback answers. */
  minconfidence: number;
  /** what answers when the gate closes (absent: the verdict fails honestly). */
  fallback?: { value: Record<string, unknown>; reason: string } | undefined;
};

/** the verdict of one schema round (the record replaces the scalar value). */
export type SchemaVerdict =
  | { ok: true; value: Record<string, unknown>; confidence: number }
  | { ok: false; reason: string };

/**
 * createschemamodel — the second layer over a declared shape: the same
 * grammar as the engine (an injected completer, one repair round, the
 * trail) with the schema instruction and the schema validator.
 *
 * @param config the completer, the declared schema and the policy.
 * @returns the decide function over the schema.
 */
export function createschemamodel(config: { complete: Completer; schema: JsonObjectSchema; policy: SchemaPolicy }): (prompt: string) => Promise<{ verdict: SchemaVerdict; trail: DecisionTrail }> {
  if (!config || typeof config.complete !== "function")
    throw new decisionerror("bad-policy", null, "the schema model carries an injected completer");
  const compiled = compilejsonschema(config.schema);
  const policy = config.policy;
  if (!policy || !Number.isFinite(policy.minconfidence) || policy.minconfidence < 0 || policy.minconfidence > 1)
    throw new decisionerror("bad-policy", null, "the schema policy floor must sit between 0 and 1");

  return async (prompt) => {
    if (typeof prompt !== "string" || prompt.trim() === "")
      throw new decisionerror("bad-request", null, "the schema prompt must be a non-empty string");
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: compiled.instruction },
      { role: "user", content: prompt },
    ];
    const trail: DecisionTrail = { rounds: 0, answers: [], instruction: compiled.instruction };

    let lasterror: unknown = null;
    for (let round = 0; round < 2; round += 1) {
      trail.rounds += 1;
      const answer = await config.complete(messages);
      trail.answers.push(answer);
      try {
        const parsed = compiled.validate(extractjsonobject(answer));
        if (parsed.confidence >= policy.minconfidence)
          return { verdict: { ok: true, value: parsed.value, confidence: parsed.confidence }, trail };
        if (policy.fallback)
          return { verdict: { ok: true, value: policy.fallback.value, confidence: parsed.confidence }, trail };
        return { verdict: { ok: false, reason: `confidence ${parsed.confidence} below the policy floor ${policy.minconfidence}` }, trail };
      } catch (error) {
        lasterror = error;
        if (round === 0)
          messages.push({ role: "assistant", content: answer }, { role: "user", content: "Answer again with only the JSON object. No prose, no fences." });
      }
    }
    const detail = lasterror instanceof decisionerror ? lasterror.detail : null;
    return { verdict: { ok: false, reason: `the model never answered a schema-valid object${detail ? ` (${detail})` : ""}` }, trail };
  };
}

/* ----------------------------- the bridge ------------------------------ */

/**
 * schemafromdecision — the fixed kinds as declared schemas (the reverse
 * bridge): the engine requests and the schema requests interoperate over
 * the same object grammar.
 *
 * @param request the fixed-kind shape (kind, options, range).
 * @returns the equivalent declared schema.
 */
export function schemafromdecision(request: Pick<DecisionRequest, "kind" | "options" | "range">): JsonObjectSchema {
  if (request.kind === "choice") {
    if (!Array.isArray(request.options) || request.options.length < 2)
      throw new schemaerror("options", "a choice schema carries at least two candidates");
    return {
      properties: {
        value: { type: "string", enum: [...request.options], instructions: "the chosen option" },
        confidence: { type: "number", instructions: "between 0 and 1" },
      },
    };
  }
  if (request.kind === "score") {
    const range = request.range ?? { min: 0, max: 1 };
    return {
      instructions: `a number between ${range.min} and ${range.max}`,
      properties: {
        value: { type: "number", instructions: `between ${range.min} and ${range.max}` },
        confidence: { type: "number", instructions: "between 0 and 1" },
      },
    };
  }
  return {
    properties: {
      value: { type: "boolean", instructions: "true or false" },
      confidence: { type: "number", instructions: "between 0 and 1" },
    },
  };
}
