/**
 * jsonpolicy.ts — the confidence policies of the json model (root layer):
 * the muse-jev-playbook practices, typed — policy tables per use (every
 * threshold a parameter, zero hardcode), the honest measurement (expected
 * against received, bucketed by confidence band), the shadow → active
 * rollout ladder and the reference router with the rotation by hit history.
 * pure and multi-mode: browser and node, zero DOM and zero storage — the
 * log lives in memory and serializes to JSONL.
 */
import type { DecisionPolicy } from "./jsondecision.ts";

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
