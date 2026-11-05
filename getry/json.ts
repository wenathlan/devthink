/**
 * json — consolidated json engine logics of the getry family.
 * @module json
 * @family wave/logicfold2
 * One keyed file per family: the former variant arms (jsonpolicy, jsonschema)
 * retired into this seat with every export preserved under the same name.
 */

/* ===== block: json ===== */
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

/* ===== block: jsonpolicy ===== */
/**
 * jsonpolicy.ts — the confidence policies of the json model (root layer):
 * the muse-jev-playbook practices, typed — policy tables per use (every
 * threshold a parameter, zero hardcode), the honest measurement (expected
 * against received, bucketed by confidence band), the shadow → active
 * rollout ladder and the reference router with the rotation by hit history.
 * pure and multi-mode: browser and node, zero DOM and zero storage — the
 * log lives in memory and serializes to JSONL.
 */


/** the machine readable failure codes of the policy domain. */
export type policyerrorcode = "bad-table" | "bad-band" | "bad-record" | "bad-router" | "bad-rollout";

/** the typed policy failure, traceable to the code and the detail. */
export class policyerror extends Error {
  /** machine readable failure code. */
  readonly code: policyerrorcode;
  /** the detail the failure is about (when known). */
  readonly detail: string | null;

  constructor(code: policyerrorcode, detail: string | null, message?: string) {
    super(message ?? `policy ${code}${detail === null ? "" : ` (${detail})`}`);
    this.name = "policyerror";
    this.code = code;
    this.detail = detail;
  }
}

/** the confidence bands of the playbook: act, surface, escalate. */
export type ConfidenceBand = "act" | "surface" | "escalate";

/** the band thresholds: >= high acts, < low escalates, between surfaces. */
export type BandThresholds = { high: number; low: number };

/** validates one band table (low below high, both inside 0-1). */
function validbands(bands: BandThresholds): BandThresholds {
  const { high, low } = bands;
  if (!Number.isFinite(high) || !Number.isFinite(low) || low < 0 || high > 1 || low >= high)
    throw new policyerror("bad-band", null, "the band thresholds carry a low below high, both inside 0-1");
  return bands;
}

/**
 * confidenceband — one confidence against the band table (the playbook
 * default: >= 0.80 acts, 0.50-0.79 surfaces, < 0.50 escalates).
 */
export function confidenceband(confidence: number, bands: BandThresholds = { high: 0.8, low: 0.5 }): ConfidenceBand {
  validbands(bands);
  if (!Number.isFinite(confidence)) throw new policyerror("bad-band", String(confidence), "the confidence must be a number");
  if (confidence >= bands.high) return "act";
  if (confidence < bands.low) return "escalate";
  return "surface";
}

/** one use of the decision layer: its name, the policy and the honest note. */
export type PolicyEntry = { name: string; policy: DecisionPolicy; note?: string };

/**
 * buildpolicytable — validates the caller's table (unique non-empty names,
 * a finite confidence floor, a typed fallback) and freezes it.
 * @throws policyerror with code bad-table on the first broken entry.
 */
export function buildpolicytable(entries: readonly PolicyEntry[]): readonly PolicyEntry[] {
  const seen = new Set<string>();
  for (const entry of entries) {
    if (!entry || typeof entry.name !== "string" || entry.name.trim() === "")
      throw new policyerror("bad-table", null, "every table entry carries a non-empty name");
    const key = entry.name.trim().toLowerCase();
    if (seen.has(key)) throw new policyerror("bad-table", entry.name, "the table names a use twice");
    seen.add(key);
    const policy = entry.policy;
    if (!policy || !Number.isFinite(policy.minconfidence) || policy.minconfidence < 0 || policy.minconfidence > 1)
      throw new policyerror("bad-table", entry.name, "the policy floor must sit between 0 and 1");
    const fallback = policy.fallback?.value;
    if (fallback !== undefined && typeof fallback !== "string" && typeof fallback !== "number" && typeof fallback !== "boolean")
      throw new policyerror("bad-table", entry.name, "the fallback answers a string, number or boolean");
  }
  return entries.map((entry) => ({ ...entry, policy: { ...entry.policy } }));
}

/**
 * defaultpolicytable — the playbook per-question minimums as parameters:
 * the choice trust floor, the cache reuse, the subagent spawn and the retry
 * stop. the overrides replace an entry wholesale; nothing here is law.
 */
export function defaultpolicytable(overrides: Record<string, DecisionPolicy> = {}): readonly PolicyEntry[] {
  const base: PolicyEntry[] = [
    { name: "choice", policy: { minconfidence: 0.55 }, note: "below the floor the choice winner is not trusted" },
    { name: "reuse", policy: { minconfidence: 0.65 }, note: "the cached artifact answers instead of redoing the work" },
    { name: "subagent", policy: { minconfidence: 0.75 }, note: "spawn a specialist only above this" },
    { name: "stopretry", policy: { minconfidence: 0.55 }, note: "stop retrying a failed approach above this" },
  ];
  const kept = base.filter((entry) => overrides[entry.name] === undefined);
  const replaced = Object.entries(overrides).map(([name, policy]) => ({ name, policy }));
  return buildpolicytable([...kept, ...replaced]);
}

/** policyfor — the policy of one use; unknown names fail honestly. */
export function policyfor(table: readonly PolicyEntry[], name: string): DecisionPolicy {
  const entry = table.find((candidate) => candidate.name.toLowerCase() === name.trim().toLowerCase());
  if (!entry) throw new policyerror("bad-table", name, "the table carries no such use");
  return entry.policy;
}

/** the rollout mode of one decision (shadow logs, active enforces). */
export type DecisionMode = "shadow" | "active";

/**
 * one honest line of the decision log (expected against received — the
 * question, the action, the confidence, the mode, the wall time).
 */
export type MeasurementRecord = {
  at: number;
  question: string;
  action: string;
  confidence: number;
  mode: DecisionMode;
  /** what the caller expected (absent: the line still counts by band). */
  expected?: string | undefined;
  /** what actually happened. */
  received?: string | undefined;
  ms?: number | undefined;
};

/**
 * the per-question rollup: the band counts plus the judged high band
 * (expected met received) and the chronic medium share.
 */
export type MeasurementSummary = {
  question: string;
  total: number;
  bands: Record<ConfidenceBand, number>;
  judgedhigh: number;
  righthigh: number;
  judged: number;
  mediumshare: number;
};

/** the honest measurement handle (in memory, JSONL out). */
export type HonestMeasurement = {
  record: (entry: MeasurementRecord) => MeasurementRecord;
  summary: (question?: string) => MeasurementSummary[];
  tojsonl: () => string;
};

/**
 * createmeasurement — the honest log: the caller records expected against
 * received per decision and the summary says which question packs earn
 * enforcement (calibration, not marketing).
 */
export function createmeasurement(config: { cap?: number; bands?: BandThresholds } = {}): HonestMeasurement {
  const cap = config.cap ?? 500;
  if (!Number.isInteger(cap) || cap < 1) throw new policyerror("bad-record", null, "the log cap must be a positive integer");
  const bands = validbands(config.bands ?? { high: 0.8, low: 0.5 });
  const lines: MeasurementRecord[] = [];

  const normalized = (entry: MeasurementRecord): MeasurementRecord => {
    if (!entry || typeof entry.question !== "string" || entry.question.trim() === "" || typeof entry.action !== "string" || entry.action.trim() === "")
      throw new policyerror("bad-record", null, "the log line names a question and an action");
    if (!Number.isFinite(entry.confidence) || entry.confidence < 0 || entry.confidence > 1)
      throw new policyerror("bad-record", entry.question, "the logged confidence must sit between 0 and 1");
    return {
      ...entry,
      at: Number.isFinite(entry.at) ? entry.at : Date.now(),
      question: entry.question.trim(),
      action: entry.action.trim(),
      confidence: entry.confidence,
      mode: entry.mode === "active" ? "active" : "shadow",
    };
  };

  return {
    record(entry) {
      lines.push(normalized(entry));
      if (lines.length > cap) lines.splice(0, lines.length - cap);
      return lines[lines.length - 1];
    },
    summary(question) {
      const rows = question ? lines.filter((line) => line.question === question) : lines;
      const groups = new Map<string, MeasurementRecord[]>();
      for (const line of rows) {
        const bucket = groups.get(line.question);
        if (bucket) bucket.push(line);
        else groups.set(line.question, [line]);
      }
      const out: MeasurementSummary[] = [];
      for (const [name, bucket] of groups) {
        const bandcount: Record<ConfidenceBand, number> = { act: 0, surface: 0, escalate: 0 };
        let judgedhigh = 0;
        let righthigh = 0;
        let judged = 0;
        let medium = 0;
        for (const line of bucket) {
          bandcount[confidenceband(line.confidence, bands)] += 1;
          if (line.expected !== undefined && line.received !== undefined) {
            judged += 1;
            if (line.confidence >= bands.high) {
              judgedhigh += 1;
              if (line.expected === line.received) righthigh += 1;
            }
            if (line.confidence >= bands.low && line.confidence < bands.high) medium += 1;
          }
        }
        out.push({ question: name, total: bucket.length, bands: bandcount, judgedhigh, righthigh, judged, mediumshare: judged === 0 ? 0 : medium / judged });
      }
      return out;
    },
    tojsonl() {
      return lines.map((line) => JSON.stringify(line)).join("\n");
    },
  };
}

/** the rollout verdict for one question pack. */
export type RolloutVerdict = "promote" | "keep-shadow" | "demote" | "insufficient";

/** the ladder thresholds (the playbook defaults, all parameters). */
export type RolloutPolicy = {
  minjudged: number;
  promoteaccuracy: number;
  minjudgedkill: number;
  killaccuracy: number;
  chronicmedium: number;
};

/** validates one rollout policy. */
function validrollout(policy: RolloutPolicy): RolloutPolicy {
  const finite01 = (value: number) => Number.isFinite(value) && value > 0 && value <= 1;
  if (!Number.isInteger(policy.minjudged) || policy.minjudged < 1 || !Number.isInteger(policy.minjudgedkill) || policy.minjudgedkill < 1)
    throw new policyerror("bad-rollout", null, "the rollout carries positive integer windows");
  if (!finite01(policy.promoteaccuracy) || !finite01(policy.killaccuracy) || !finite01(policy.chronicmedium))
    throw new policyerror("bad-rollout", null, "the rollout rates must sit inside 0-1");
  return policy;
}

/**
 * reviewrollout — the ladder done honestly: promote only when the high band
 * is right on the log (9 of 10 over the window), demote on kill accuracy or
 * a chronically medium question (the question is malformed, not the
 * threshold), insufficient while the evidence is short.
 */
export function reviewrollout(
  summary: MeasurementSummary,
  policy: Partial<RolloutPolicy> = {}
): { question: string; verdict: RolloutVerdict; reason: string } {
  const full = validrollout({ minjudged: 20, promoteaccuracy: 0.9, minjudgedkill: 30, killaccuracy: 0.9, chronicmedium: 0.5, ...policy });
  const accuracy = summary.judgedhigh === 0 ? 0 : summary.righthigh / summary.judgedhigh;
  const percent = `${(accuracy * 100).toFixed(0)}%`;
  if (summary.judgedhigh >= full.minjudgedkill && accuracy < full.killaccuracy)
    return { question: summary.question, verdict: "demote", reason: `high-band accuracy ${percent} over ${summary.judgedhigh} judged` };
  if (summary.mediumshare >= full.chronicmedium && summary.judgedhigh < full.minjudgedkill)
    return { question: summary.question, verdict: "demote", reason: `chronic medium confidence (${(summary.mediumshare * 100).toFixed(0)}% of judged) — the question is malformed` };
  if (summary.judgedhigh >= full.minjudged && accuracy >= full.promoteaccuracy)
    return { question: summary.question, verdict: "promote", reason: `high-band accuracy ${percent} over ${summary.judgedhigh} judged` };
  if (summary.judgedhigh < full.minjudged)
    return { question: summary.question, verdict: "insufficient", reason: `only ${summary.judgedhigh} judged high-band lines (need ${full.minjudged})` };
  return { question: summary.question, verdict: "keep-shadow", reason: `high-band accuracy ${percent} below the promote bar` };
}

/** one reference route: the question form and the recipe that serves it. */
export type RouterRoute = { form: string; recipe: string; alternate?: string | undefined };

/** the serving stats of one route (the rotation feeds on them). */
export type RouterStats = { hit: number; miss: number; accuracy: number | null; serving: string };

/** the reference router handle (route, record, stats). */
export type ReferenceRouter = {
  route: (form: string) => string;
  record: (form: string, hit: boolean) => void;
  stats: (form: string) => RouterStats;
};

/**
 * createreferencerouter — which recipe answers which question form, with
 * the rotation by hit history: when a form's accuracy falls below the
 * accuracy floor (default 0.6) over the judged window (default 5), the
 * alternate recipe takes the route — the complement of the engine's static
 * recipe table.
 */
export function createreferencerouter(config: { routes: readonly RouterRoute[]; minaccuracy?: number; minjudged?: number }): ReferenceRouter {
  if (!config || !Array.isArray(config.routes) || config.routes.length === 0)
    throw new policyerror("bad-router", null, "the router carries at least one route");
  const minaccuracy = config.minaccuracy ?? 0.6;
  const minjudged = config.minjudged ?? 5;
  if (!Number.isFinite(minaccuracy) || minaccuracy <= 0 || minaccuracy >= 1 || !Number.isInteger(minjudged) || minjudged < 1)
    throw new policyerror("bad-router", null, "the router floor sits inside 0-1 and the window is a positive integer");

  const table = new Map<string, RouterRoute>();
  for (const route of config.routes) {
    if (!route || typeof route.form !== "string" || route.form.trim() === "" || typeof route.recipe !== "string" || route.recipe.trim() === "")
      throw new policyerror("bad-router", null, "every route names a form and a recipe");
    const key = route.form.trim().toLowerCase();
    if (table.has(key)) throw new policyerror("bad-router", route.form, "the router maps a form twice");
    if (route.alternate !== undefined && (typeof route.alternate !== "string" || route.alternate.trim() === ""))
      throw new policyerror("bad-router", route.form, "the alternate recipe is a non-empty string");
    table.set(key, { form: key, recipe: route.recipe.trim(), alternate: route.alternate?.trim() });
  }

  const history = new Map<string, { hit: number; miss: number }>();
  const keyof = (form: string): string => {
    const key = form.trim().toLowerCase();
    if (!table.has(key)) throw new policyerror("bad-router", form, "the router carries no such form");
    return key;
  };
  const servingfor = (key: string): string => {
    const route = table.get(key);
    if (!route) throw new policyerror("bad-router", key, "the router carries no such form");
    const book = history.get(key);
    const judged = book ? book.hit + book.miss : 0;
    const accuracy = book && judged > 0 ? book.hit / judged : 1;
    const rotate = book !== undefined && judged >= minjudged && accuracy < minaccuracy && typeof route.alternate === "string";
    return rotate && route.alternate ? route.alternate : route.recipe;
  };

  return {
    route(form) {
      return servingfor(keyof(form));
    },
    record(form, hit) {
      const key = keyof(form);
      const book = history.get(key) ?? { hit: 0, miss: 0 };
      if (hit) book.hit += 1;
      else book.miss += 1;
      history.set(key, book);
    },
    stats(form) {
      const key = keyof(form);
      const book = history.get(key);
      const judged = book ? book.hit + book.miss : 0;
      return { hit: book?.hit ?? 0, miss: book?.miss ?? 0, accuracy: book && judged > 0 ? book.hit / judged : null, serving: servingfor(key) };
    },
  };
}

/* ===== block: jsonschema ===== */
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
