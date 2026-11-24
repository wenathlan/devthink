/**
 * @file jury.ts
 * @module intelligence/jury
 * @description
 *  The jury of three diverse members with inverse calibration weighting —
 *  the wave/getry-jury intelligence honesty laws of the getry family.
 *
 *  v2.0.187 wave/getry-jury seat (2026-11-20): every trust decision the
 *  intelligence pipeline makes routes through a jury of THREE DIVERSE
 *  members — three different provider families from the configured pool,
 *  never three calls to one model — and the verdict answers as a weighted
 *  aggregate where each member weighs inversely proportional to its
 *  demonstrated confidence error (an overconfident member weighs less; the
 *  honest log of json.ts feeds the calibration, an honest seed serves until
 *  the log carries per member evidence). The intelligence honesty laws ride
 *  the verdict: the gray zone 0.30-0.70 never auto acts (a needs review
 *  verdict escalates to a human), a confidence below the 0.30 floor answers
 *  an explicit unknown (never a guess), the anti sycophancy law bans
 *  flattery and false confidence on every member round and the aggregation
 *  never rewards agreement seeking answers, and every token estimate the
 *  trail surfaces presents through the tilde meter (an estimate never
 *  presents as an exact count).
 *
 *  Composition: the jury seats beside the single member lane the json
 *  decision domain already owns — createjsonmodel stays the one backend
 *  completer flow for callers that pin a single model, while the jury
 *  routes a decision across three diverse backends and aggregates the
 *  positions with calibration weights. The single member flow (the request
 *  validation, the verdict extraction and the verdict coercion) rides the
 *  json domain exactly as shipped — the jury never duplicates it, it
 *  multiplies it honestly.
 *
 *  Zero runtime dependencies beyond the two in family seats it reads: the
 *  json decision domain (./json.js — the request validation, the answer
 *  extraction, the verdict coercion and the honest measurement record
 *  shape) and the intelligence domain root (./intelligence.js — the family
 *  intelligence score for member selection, the honesty laws and the tilde
 *  token meter). Pure and multi mode: the same call runs in the browser
 *  and in node, with zero DOM and zero storage.
 *
 * @author devthink
 * @license GPL-3.0-only
 * @version 2.0.187
 * @date 2026-11-20
 */

/* the json decision domain supplies the single member grammar the jury multiplies: the request validation, the answer extraction, the verdict coercion, the default instruction and the recipe types (never duplicated here). */
import {
  defaultinstruction,
  extractjsonobject,
  validatedecision,
  validateverdict,
  type DecisionKind,
  type DecisionRecipe,
  type DecisionRequest,
} from "./json.js";
/* the intelligence domain root supplies the family intelligence score of the member selection, the anti sycophancy law line and scan, and the tilde token meter (the intelligence honesty laws seat there — one law, no copies, no import cycle). */
import { detectsycophancy, estimatetokens, intelligencescore, intelligencehonestyline, tokenmeter } from "./intelligence.js";

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the jury laws — the gray zone, the confidence floor and the anti sycophancy discount. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * the jury laws: the gray zone constants, the sycophancy discount and the
 * weight error floor. the gray zone bounds are LAW, not parameters — the
 * checklist mandates pin 0.30 and 0.70 — while every other bound of this
 * file (the seed error, the error floor, the dissent tolerance, the
 * smoothing prior) is a documented parameter a caller may tune through the
 * config objects.
 */

/** the gray zone floor (LAW): an aggregated confidence at or above 0.30 that stays below {@link jurygrayhigh} never auto acts — the verdict escalates for a human review. */
export const jurygraylow = 0.30;

/** the gray zone ceiling (LAW): only an aggregated confidence at or above 0.70 may act; the band between the floor and this ceiling is the gray zone. */
export const jurygrayhigh = 0.70;

/** the flattery discount (the anti sycophancy law): a member whose answer carries a flattery marker keeps its vote — the position is evidence — but its self graded confidence halves before the aggregation, so agreement seeking never buys trust. */
export const jurysycophancydiscount = 0.5;

/** the machine readable failure codes of the jury domain. */
export type juryerrorcode = "bad-pool" | "bad-calibration" | "bad-verdict";

/** the typed jury failure, traceable to the code and the detail (the grammar mirrors the decision and policy errors of the json domain). */
export class juryerror extends Error {
  /** machine readable failure code. */
  readonly code: juryerrorcode;
  /** the detail the failure is about (when known). */
  readonly detail: string | null;

  constructor(code: juryerrorcode, detail: string | null, message?: string) {
    super(message ?? `jury ${code}${detail === null ? "" : ` (${detail})`}`);
    this.name = "juryerror";
    this.code = code;
    this.detail = detail;
  }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the pool and the member selection — three diverse families. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * the member selection: the configured pool carries one completer per
 * candidate backend (the caller binds the provider, the model and the
 * injected link exactly the way the single member json model binds one),
 * and the jury seats THREE members from THREE DISTINCT provider families —
 * the highest intelligence score of each family, ties broken
 * alphabetically so the seat stays deterministic.
 */

/** one candidate of the jury pool: the member id, the provider family label, the model id and the injected completer bound to that backend. */
export type jurypoolumember = {
  /** the member id the calibration packs and the verdict report name. */
  id: string;
  /** the provider family label (the diversity key); absent derives from the model id (the segment after the provider prefix, before the first dash). */
  family?: string | undefined;
  /** the model id the completer routes to (the intelligence score reads it). */
  model: string;
  /** the injected LLM link of this backend — one round of messages to its provider (the json domain completer grammar). */
  complete: (messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) => Promise<string>;
};

/** derives the provider family of a pool candidate: the declared label wins, absent candidates answer the model id segment after the provider prefix (z-ai/glm-5.3-flash answers glm, gemini-3.6-flash answers gemini). */
export function familyof(member: Pick<jurypoolumember, "id" | "family" | "model">): string {
  const declared = member.family?.trim();
  if (declared !== undefined && declared !== "") return declared.toLowerCase();
  const bare = member.model.toLowerCase().split("/").pop() ?? member.model.toLowerCase();
  const family = bare.split("-")[0] ?? "";
  return family.trim() === "" ? member.id.toLowerCase() : family;
}

/** the seated jury member: the pool candidate plus its derived family. */
export type seatedmember = jurypoolumember & { family: string };

/**
 * selectjurymembers — seats the jury of three: one member per distinct
 * provider family (the highest intelligence score of the family, ties
 * broken alphabetically), so the jury never answers as three calls to one
 * model. the pool order never matters — the seat stays deterministic.
 *
 * @param pool the configured candidate pool (at least three distinct families).
 * @returns the three seated members.
 * @throws juryerror with code bad-pool when the pool carries fewer than three distinct families or fewer than three candidates.
 */
export function selectjurymembers(pool: readonly jurypoolumember[]): seatedmember[] {
  if (!Array.isArray(pool) || pool.length < 3)
    throw new juryerror("bad-pool", null, "the jury seats three members and the pool carries fewer than three candidates");
  const families = new Map<string, jurypoolumember>();
  for (const candidate of pool) {
    if (!candidate || typeof candidate.id !== "string" || candidate.id.trim() === "" || typeof candidate.model !== "string" || candidate.model.trim() === "" || typeof candidate.complete !== "function")
      throw new juryerror("bad-pool", String(candidate?.id ?? null), "every pool candidate carries an id, a model and a completer");
    const family = familyof(candidate);
    const seated = families.get(family);
    if (seated === undefined) {
      families.set(family, candidate);
      continue;
    }
    const byscore = intelligencescore(candidate.model) - intelligencescore(seated.model);
    const byid = candidate.id.localeCompare(seated.id);
    if (byscore > 0 || (byscore === 0 && byid < 0)) families.set(family, candidate);
  }
  if (families.size < 3)
    throw new juryerror(
      "bad-pool",
      [...families.keys()].join(", "),
      `the jury needs three diverse provider families and the pool carries ${families.size} (${[...families.keys()].join(", ")}) — three calls to one model are not a jury`,
    );
  return [...families.entries()]
    .sort(([one], [two]) => one.localeCompare(two))
    .map(([family, candidate]) => ({ ...candidate, family }));
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: the inverse calibration weighting. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * the inverse calibration weighting: each member carries a calibration
 * weight inversely proportional to its demonstrated confidence error —
 * the gap between what the member claims and what its judged lines show.
 * the calibration data the family already carries is the honest measurement
 * of the json domain (createmeasurement: expected against received per
 * logged line), so the packs build from those lines with one documented
 * convention: the action field of a log line names the member that answered
 * it. no per member calibration data exists in the family logs yet, so the
 * unmeasured member seats on the honest seed below — documented, equal and
 * replaceable by measured packs the day the log accumulates them.
 */

/** one calibration pack: the member's judged lines condensed (judged count, right count, the mean claimed confidence). */
export type calibrationpack = {
  /** the member id the pack calibrates (the action field of the honest log lines names it). */
  member: string;
  /** how many judged lines the pack read (a line judges when it carries both expected and received). */
  judged: number;
  /** how many judged lines met the expectation (expected equals received). */
  right: number;
  /** the mean confidence the member claimed over its judged lines (0-1). */
  meanconfidence: number;
};

/**
 * the honest seed (a PARAMETER, not law): no per member calibration data
 * exists in the family logs yet, so every unmeasured member seats with the
 * seed claim 0.65 against the smoothed accuracy 0.5 of an empty log — the
 * seed error 0.15 says an unmeasured member is assumed mildly overconfident
 * (the published 2025-2026 calibration studies of frontier chat models sit
 * in exactly that band), and because every unmeasured member seeds
 * identically the seed keeps the jury equal until evidence differentiates
 * the members. feed measured packs from the honest log and the seed
 * retires per member on its own.
 */
export const juryseedconfidence = 0.65;

/** the seed error of an unmeasured member (the mean confidence 0.65 the seed claims minus the 0.5 smoothed accuracy of an empty log) — documented above on {@link juryseedconfidence}. */
export const juryseederror = Math.abs(juryseedconfidence - 0.5);

/** the smoothing prior of the accuracy estimate: one hit and one miss ride every pack, so a one line pack never answers a 0 or 1 accuracy and a zero line pack answers 0.5 (the honest neutral). */
export const jurypriorstrength = 2;

/** the error floor of the inverse weight (a PARAMETER): the weight is 1/(error+floor), so the floor bounds the dynamic range at 1:20 (a perfectly calibrated member never outweighs a maximally miscalibrated one by more than twenty times) and no error ever divides by zero. */
export const juryerrorfloor = 0.05;

/**
 * calibrationpacks — builds the per member packs from the honest
 * measurement lines of the json domain: a line joins its member pack when
 * its action field names the member (the documented convention — the
 * action is free form text, so the caller records the answering member's
 * id there), and a line judges when it carries both expected and received
 * (exactly the judged semantics the measurement summary reads).
 *
 * @param lines the honest measurement lines (the createmeasurement record shape — question, action, confidence, expected, received).
 * @returns the calibration packs of every member the lines name.
 */
export function calibrationpacks(lines: ReadonlyArray<{ action?: string | undefined; confidence: number; expected?: string | undefined; received?: string | undefined }>): calibrationpack[] {
  if (!Array.isArray(lines)) throw new juryerror("bad-calibration", null, "the calibration packs read an array of honest log lines");
  const groups = new Map<string, { judged: number; right: number; confidencesum: number }>();
  for (const line of lines) {
    if (!line || !Number.isFinite(line.confidence) || line.confidence < 0 || line.confidence > 1)
      throw new juryerror("bad-calibration", String(line?.action ?? null), "every calibration line carries a confidence between 0 and 1");
    const member = String(line.action ?? "").trim();
    if (member === "") continue;
    const book = groups.get(member) ?? { judged: 0, right: 0, confidencesum: 0 };
    book.confidencesum += line.confidence;
    if (line.expected !== undefined && line.received !== undefined) {
      book.judged += 1;
      if (line.expected === line.received) book.right += 1;
    }
    groups.set(member, book);
  }
  return [...groups.entries()].map(([member, book]) => ({
    member,
    judged: book.judged,
    right: book.right,
    meanconfidence: book.judged === 0 ? juryseedconfidence : book.confidencesum / book.judged,
  }));
}

/**
 * calibrationerror — the demonstrated confidence error of one pack: the
 * gap between the mean confidence the member claimed and its smoothed
 * observed accuracy ((right + 1) / (judged + 2), the one hit one miss
 * prior). an overconfident member (claims high, hits low) carries a large
 * error; an underconfident member carries the same large error — the jury
 * distrusts miscalibration in both directions, overconfidence is just the
 * commoner disease.
 */
export function calibrationerror(pack: calibrationpack): number {
  const accuracy = (pack.right + 1) / (pack.judged + jurypriorstrength);
  const claim = pack.judged === 0 ? juryseedconfidence : pack.meanconfidence;
  return Math.abs(claim - accuracy);
}

/**
 * inversecalibrationweight — the raw weight of one pack: inversely
 * proportional to the demonstrated confidence error, 1/(error + {@link
 * juryerrorfloor}). an unmeasured member answers the seed error weight —
 * equal to every other unmeasured member.
 */
export function inversecalibrationweight(pack: calibrationpack): number {
  return 1 / (calibrationerror(pack) + juryerrorfloor);
}

/** one seated weight row: the member, its calibration error, its raw weight and its normalized share of the jury. */
export type juryweight = { member: string; error: number; weight: number; share: number };

/**
 * juryweights — weighs the seated members: every member carries the seed
 * pack unless a measured pack of its id rides the config, then the weights
 * normalize to shares that sum to one (the vote counts shares, the report
 * carries both).
 */
export function juryweights(members: readonly seatedmember[], packs: readonly calibrationpack[] = []): juryweight[] {
  const measured = new Map(packs.map((pack) => [pack.member, pack]));
  const rows = members.map((member) => {
    const pack = measured.get(member.id) ?? { member: member.id, judged: 0, right: 0, meanconfidence: juryseedconfidence };
    return { member: member.id, error: calibrationerror(pack), weight: inversecalibrationweight(pack), share: 0 };
  });
  const total = rows.reduce((sum, row) => sum + row.weight, 0);
  if (total <= 0 || !Number.isFinite(total)) throw new juryerror("bad-calibration", null, "the jury weights degenerated — the calibration packs carry a non finite error");
  return rows.map((row) => ({ ...row, share: row.weight / total }));
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: the member rounds and the verdict aggregation. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * the verdict aggregation: the three member positions aggregate with the
 * calibration shares — the winning side answers its weighted conviction
 * scaled by its support (a unanimous jury answers its full conviction, a
 * split jury answers the conviction its agreement buys, and NO arrangement
 * of agreement ever adds confidence beyond the members' own claims: the
 * anti sycophancy law). a flattery carrying member keeps its vote but
 * halves its self graded confidence; an abstaining member (an answer that
 * never parsed across both rounds) keeps its seat, its weight counts
 * against the support, and its raw answers still report.
 */

/** one member's position on the question: the value it voted, its (discounted) confidence, its raw answers and its honesty flags. */
export type jurymemberverdict = {
  /** the member id. */
  member: string;
  /** the member's provider family. */
  family: string;
  /** the member's model id. */
  model: string;
  /** the value the member voted (absent when the member abstained). */
  value?: string | number | boolean | undefined;
  /** the member's confidence AFTER the anti sycophancy discount (0 when the member abstained). */
  confidence: number;
  /** the raw answers the member gave, per round (the report always shows all three raw positions). */
  answers: string[];
  /** the flattery flag of the member's answers (the matched marker rides the trail). */
  sycophancy: boolean;
  /** the flattery marker that fired (when one did). */
  marker?: string | undefined;
  /** true when neither round answered a parseable verdict — the member abstains (its weight still counts against the support). */
  abstained: boolean;
};

/** the state of the jury verdict (the intelligence honesty laws): act only above the gray zone, needs review inside the gray zone, unknown below the floor. */
export type juryverdictstate = "act" | "needs-review" | "unknown";

/** the jury verdict: the state, the provisional value, the aggregated confidence and the aggregation trail (support, conviction, dissent). */
export type juryverdict = {
  /** the decision kind the question posed. */
  kind: DecisionKind;
  /** the verdict state (the gray zone law). */
  state: juryverdictstate;
  /** the aggregated value — present for act and needs review, ALWAYS absent for unknown (a confidence below the floor answers unknown, never a guess). */
  value?: string | number | boolean | undefined;
  /** the aggregated confidence (0-1). */
  confidence: number;
  /** the weight share of the members voting the aggregated value. */
  support: number;
  /** the weighted mean confidence of the voting members (after the sycophancy discount). */
  conviction: number;
  /** the weight share that dissented (voted another value, sat outside the score tolerance, or abstained). */
  dissent: number;
  /** the honest reason the state answers (the gray zone and the floor name their bounds). */
  reason: string;
};

/** the dissent tolerance of a score verdict (a PARAMETER): a member dissents a score aggregate when its value sits further than a quarter of the declared range from the weighted mean. */
export const juryscoretolerance = 0.25;

/** the aggregation of one jury round: the winning value with the weighted math trail that produced it. */
export type aggregation = { value?: string | number | boolean | undefined; confidence: number; support: number; conviction: number; dissent: number };

/**
 * aggregatejury — aggregates the three member positions with the
 * calibration shares:
 *  - choice and yesno: the value with the largest share weight wins (ties
 *    break on the lexicographically smallest value so the seat stays
 *    deterministic); the support is the winner's share of the whole jury
 *    (abstentions count against it), the conviction is the winner side's
 *    weighted mean confidence, and the aggregate is conviction times
 *    support — agreement never adds anything, dissent subtracts.
 *  - score: the weighted mean of the values is the aggregate, a member
 *    dissents when its value sits further than {@link juryscoretolerance}
 *    of the range from that mean, and the aggregate is the voting
 *    conviction scaled by the agreeing share.
 * the aggregate never exceeds the highest member claim (no amplification
 * through agreement — the anti sycophancy law of the aggregation).
 */
export function aggregatejury(input: {
  kind: DecisionKind;
  members: readonly jurymemberverdict[];
  weights: readonly juryweight[];
  range?: { min: number; max: number } | undefined;
}): aggregation {
  const shares = new Map(input.weights.map((row) => [row.member, row.share]));
  const voting = input.members.filter((member) => !member.abstained && member.value !== undefined);
  const seatedweight = input.weights.reduce((sum, row) => sum + row.share, 0);
  if (voting.length === 0 || seatedweight <= 0)
    return { confidence: 0, support: 0, conviction: 0, dissent: 1 };
  if (input.kind === "score") {
    const range = input.range ?? { min: 0, max: 1 };
    const span = Math.abs(range.max - range.min);
    const valueweight = voting.reduce((sum, member) => sum + (shares.get(member.member) ?? 0), 0);
    const meanvalue = voting.reduce((sum, member) => sum + (shares.get(member.member) ?? 0) * Number(member.value), 0) / valueweight;
    const dissenters = voting.filter((member) => Math.abs(Number(member.value) - meanvalue) > juryscoretolerance * span);
    const dissent = dissenters.reduce((sum, member) => sum + (shares.get(member.member) ?? 0), 0) / seatedweight;
    const conviction = voting.reduce((sum, member) => sum + (shares.get(member.member) ?? 0) * member.confidence, 0) / valueweight;
    const confidence = Math.min(1, Math.max(0, conviction * (1 - dissent)));
    const value = Math.min(range.max, Math.max(range.min, meanvalue));
    return { value, confidence, support: 1 - dissent, conviction, dissent };
  }
  const tally = new Map<string, { weight: number; conviction: number; convictionweight: number; value: string | number | boolean }>();
  for (const member of voting) {
    const key = String(member.value);
    const share = shares.get(member.member) ?? 0;
    const book = tally.get(key) ?? { weight: 0, conviction: 0, convictionweight: 0, value: member.value as string | number | boolean };
    book.weight += share;
    book.conviction += share * member.confidence;
    book.convictionweight += share;
    tally.set(key, book);
  }
  const winner = [...tally.entries()].sort(([one, left], [two, right]) => right.weight - left.weight || one.localeCompare(two))[0];
  const book = winner[1] as { weight: number; conviction: number; convictionweight: number; value: string | number | boolean };
  const support = book.weight / seatedweight;
  const dissent = 1 - support;
  const conviction = book.convictionweight === 0 ? 0 : book.conviction / book.convictionweight;
  const confidence = Math.min(1, Math.max(0, conviction * support));
  return { value: book.value, confidence, support, conviction, dissent };
}

/**
 * juryverdictof — maps one aggregation onto the honesty law states: an
 * aggregated confidence at or above 0.70 acts, at or above 0.30 but below
 * 0.70 NEVER auto acts (the verdict answers needs review and carries the
 * provisional value for the human that reviews the three raw positions),
 * and below 0.30 answers unknown — the value falls away entirely, because
 * a confidence below the floor is never a guess.
 */
export function juryverdictof(input: {
  kind: DecisionKind;
  aggregate: aggregation;
}): juryverdict {
  const { confidence } = input.aggregate;
  if (!Number.isFinite(confidence))
    throw new juryerror("bad-verdict", String(confidence), "the aggregated confidence must be a number");
  if (confidence >= jurygrayhigh)
    return {
      kind: input.kind,
      state: "act",
      value: input.aggregate.value,
      confidence,
      support: input.aggregate.support,
      conviction: input.aggregate.conviction,
      dissent: input.aggregate.dissent,
      reason: `the aggregated confidence ${confidence.toFixed(2)} sits at or above the act ceiling ${jurygrayhigh} — the jury acts`,
    };
  if (confidence >= jurygraylow)
    return {
      kind: input.kind,
      state: "needs-review",
      value: input.aggregate.value,
      confidence,
      support: input.aggregate.support,
      conviction: input.aggregate.conviction,
      dissent: input.aggregate.dissent,
      reason: `the aggregated confidence ${confidence.toFixed(2)} sits inside the gray zone ${jurygraylow}-${jurygrayhigh} — the jury never auto acts on it; a human reviews the three raw positions`,
    };
  return {
    kind: input.kind,
    state: "unknown",
    value: undefined,
    confidence,
    support: input.aggregate.support,
    conviction: input.aggregate.conviction,
    dissent: input.aggregate.dissent,
    reason: `the aggregated confidence ${confidence.toFixed(2)} sits below the floor ${jurygraylow} — the jury answers unknown rather than a guess`,
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 5: the jury runner — the diverse rounds, the honesty line and the trail. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * the jury runner: the decision request validates through the json domain
 * (the single member grammar, reused — never duplicated), three diverse
 * members answer the SAME question in parallel (each through its own
 * provider family), each member round seats the anti sycophancy law line
 * beside the instruction, one repair round re-asks a member whose answer
 * never parsed (mirroring the single member flow), the positions
 * aggregate with the inverse calibration shares and the honesty laws map
 * the aggregate to its state. the trail reports every member's raw
 * answers, its flattery flag and the tilde metered size of its rounds —
 * nothing about the three positions ever hides behind the aggregate.
 */

/** the trail of one jury run: the instruction, the per member rounds, the seated weights and the metered round sizes. */
export type jurytrail = {
  /** the recipe instruction that rode every member round (the law line beside it). */
  instruction: string;
  /** the rounds each member paid (1 or 2 with the repair). */
  rounds: Record<string, number>;
  /** the tilde metered prompt size of every member round (an estimate never presents as exact). */
  meters: Record<string, string>;
  /** the seated weight rows (the calibration error, the raw weight and the share of each member). */
  weights: juryweight[];
};

/**
 * createjury — the jury seat: the caller configures the candidate pool
 * (one completer per backend, at least three distinct provider families),
 * the optional measured calibration packs (the honest log lines of the
 * json domain feed them through {@link calibrationpacks} — absent packs
 * seat the documented honest seed) and the optional recipe table; the
 * returned decide runs every decision request through the jury of three.
 *
 * @param config the pool, the calibration packs and the recipe table.
 * @returns the decide function (the verdict, the three member positions and the trail).
 */
export function createjury(config: {
  pool: readonly jurypoolumember[];
  calibration?: readonly calibrationpack[] | undefined;
  recipes?: readonly DecisionRecipe[] | undefined;
}): (request: DecisionRequest) => Promise<{ verdict: juryverdict; members: jurymemberverdict[]; trail: jurytrail }> {
  if (!config || !Array.isArray(config.pool))
    throw new juryerror("bad-pool", null, "the jury config carries a pool array");
  const members = selectjurymembers(config.pool);
  const weights = juryweights(members, config.calibration ?? []);
  const recipes = config.recipes ?? [];

  return async (request) => {
    const validated = validatedecision(request);
    const recipe = recipes.find((entry) => entry.kind === validated.kind);
    const instruction = recipe?.instruction ?? defaultinstruction(validated);
    const system = `${instruction}\n${intelligencehonestyline}`;
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: system },
      { role: "user", content: validated.prompt },
    ];

    const positions = await Promise.all(
      members.map(async (member): Promise<jurymemberverdict> => {
        const roundmessages = messages.map((message) => ({ ...message }));
        const answers: string[] = [];
        let parsed: { value: string | number | boolean; confidence: number } | undefined = undefined;
        for (let round = 0; round < 2; round += 1) {
          const answer = await member.complete(roundmessages);
          answers.push(answer);
          try {
            parsed = validateverdict(validated, extractjsonobject(answer));
            break;
          } catch {
            if (round === 0)
              roundmessages.push(
                { role: "assistant", content: answer },
                { role: "user", content: "Answer again with only the JSON object. No prose, no fences, no flattery." },
              );
          }
        }
        const scan = detectsycophancy(answers.join("\n"));
        const confidence =
          parsed === undefined
            ? 0
            : Math.min(1, Math.max(0, parsed.confidence * (scan.sycophancy ? jurysycophancydiscount : 1)));
        return {
          member: member.id,
          family: member.family,
          model: member.model,
          ...(parsed === undefined ? {} : { value: parsed.value }),
          confidence,
          answers,
          sycophancy: scan.sycophancy,
          ...(scan.marker !== undefined ? { marker: scan.marker } : {}),
          abstained: parsed === undefined,
        };
      }),
    );

    const aggregate = aggregatejury({
      kind: validated.kind,
      members: positions,
      weights,
      ...(validated.range !== undefined ? { range: validated.range } : {}),
    });
    const verdict = juryverdictof({ kind: validated.kind, aggregate });
    const rounds: Record<string, number> = {};
    const meters: Record<string, string> = {};
    for (const position of positions) {
      rounds[position.member] = position.answers.length;
      meters[position.member] = tokenmeter(estimatetokens(system + validated.prompt)) + ` × ${position.answers.length} rounds`;
    }
    return {
      verdict,
      members: positions,
      trail: { instruction: system, rounds, meters, weights },
    };
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 6: the cascade — the deeper bench the gray verdict escalates to. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * the jury cascade: the family law seats the jury of three with the
 * inverse calibration AND the cascade — a gray verdict (needs review or
 * unknown) never ends the walk while the pool carries a deeper bench. the
 * pool divides into two tiers of three: the primary tier seats the best
 * member of each provider family, the secondary tier seats the runner-up
 * of those same families (a different model per seat, the diversity law
 * holds inside every tier). the primary jury answers first; an act verdict
 * closes the walk, and a gray verdict escalates: the secondary tier
 * answers the same question and the combined six positions decide — the
 * aggregate the family weights carry, the same honesty states on top.
 * nothing about the escalation hides: the trail names both tiers, every
 * member position and the combined aggregate.
 */

/** one tier of the cascade: the seated members and the calibration weights the tier rides. */
export type jurytier = {
  /** the tier rank (1 = the primary bench, 2 = the deeper bench). */
  rank: number;
  /** the seated members of this tier (three distinct provider families). */
  members: seatedmember[];
  /** the calibration weights of this tier's members. */
  weights: juryweight[];
};

/**
 * selectjurypooltiers — divides the candidate pool into the two cascade
 * tiers: per provider family the candidates rank by the intelligence score
 * (ties break by the id so the selection is deterministic), the primary
 * tier seats the best candidate of the three top families and the
 * secondary tier seats the runner-up of those same families, pulling the
 * best remaining candidate of a later family when a top family carries no
 * runner-up (one seat per family inside every tier — the diversity law
 * holds inside both benches). a pool that cannot seat both tiers refuses
 * loudly: the cascade needs the deeper bench, a single tier rides
 * {@link createjury} directly.
 *
 * @param pool the candidate pool (six candidates across at least three families for the full bench).
 * @returns the two tiers with their members and weights.
 */
export function selectjurypooltiers(pool: readonly jurypoolumember[]): { primary: jurytier; secondary: jurytier } {
  if (!Array.isArray(pool) || pool.length < 6)
    throw new juryerror("bad-pool", String(pool?.length ?? 0), "the cascade pool carries fewer than six candidates — the deeper bench never seats");
  const validated = selectjurymembers(pool); /* rides the candidate validation and the family floor */
  void validated;
  const families = new Map<string, jurypoolumember[]>();
  for (const candidate of pool) {
    const family = familyof(candidate);
    const roster = families.get(family) ?? [];
    roster.push(candidate);
    families.set(family, roster);
  }
  const rankof = (candidate: jurypoolumember): number => -intelligencescore(candidate.model);
  const ranked = [...families.entries()]
    .map(([family, roster]) => ({
      family,
      roster: [...roster].sort((one, two) => rankof(one) - rankof(two) || one.id.localeCompare(two.id)),
    }))
    .sort((one, two) => rankof(one.roster[0]) - rankof(two.roster[0]) || one.family.localeCompare(two.family));
  const primaries: seatedmember[] = [];
  const runnerups: seatedmember[] = [];
  const spares: seatedmember[] = [];
  for (const entry of ranked) {
    const [best, runner, ...others] = entry.roster;
    void others;
    if (primaries.length < 3) {
      primaries.push({ ...best, family: entry.family });
      if (runner !== undefined) runnerups.push({ ...runner, family: entry.family });
    } else if (spares.length < 3) {
      spares.push({ ...(runner ?? best), family: entry.family });
    }
  }
  /* the secondary bench seats the runner-up of each primary family first
   * (the honest deeper bench of the same families), the best remaining
   * candidates of the later families filling whatever seat stays open —
   * one seat per family inside the tier, the diversity law holds. */
  const secondaries: seatedmember[] = [];
  const secondaryfamilies = new Set<string>();
  for (const candidate of [...runnerups, ...spares]) {
    if (secondaries.length >= 3) break;
    if (!secondaryfamilies.has(candidate.family)) {
      secondaries.push(candidate);
      secondaryfamilies.add(candidate.family);
    }
  }
  if (primaries.length < 3)
    throw new juryerror("bad-pool", `${primaries.length}`, "the primary tier seats fewer than three families");
  if (secondaries.length < 3)
    throw new juryerror(
      "bad-pool",
      `${secondaries.length}`,
      "the secondary tier seats fewer than three candidates — the deeper bench never seats",
    );
  const primarytier: jurytier = { rank: 1, members: primaries, weights: juryweights(primaries) };
  const secondarytier: jurytier = { rank: 2, members: secondaries, weights: juryweights(secondaries) };
  return { primary: primarytier, secondary: secondarytier };
}

/**
 * createjurycascade — the cascading jury seat: the caller configures the
 * candidate pool (six candidates across at least three provider families),
 * the optional measured calibration packs and the optional recipe table;
 * the returned decide runs the primary bench first and escalates every
 * gray verdict to the deeper bench, the combined six positions deciding
 * the final state under the same honesty laws.
 *
 * @param config the pool, the calibration packs and the recipe table.
 * @returns the decide function (the verdict, the per tier positions and the trail with both tiers).
 */
export function createjurycascade(config: {
  pool: readonly jurypoolumember[];
  calibration?: readonly calibrationpack[] | undefined;
  recipes?: readonly DecisionRecipe[] | undefined;
}): (request: DecisionRequest) => Promise<{
  verdict: juryverdict;
  members: jurymemberverdict[];
  trail: jurytrail & { tiers: number[]; escalated: boolean };
}> {
  const { primary, secondary } = selectjurypooltiers(config.pool);
  const calibrations = config.calibration;
  const tierdecide = (tier: jurytier) =>
    createjury({
      pool: tier.members,
      ...(calibrations !== undefined ? { calibration: calibrations } : {}),
      ...(config.recipes !== undefined ? { recipes: config.recipes } : {}),
    });
  const primarydecide = tierdecide(primary);
  const secondarydecide = tierdecide(secondary);
  return async (request) => {
    const first = await primarydecide(request);
    if (first.verdict.state === "act") {
      return {
        verdict: first.verdict,
        members: first.members,
        trail: { ...first.trail, tiers: [1], escalated: false },
      };
    }
    /* the gray verdict escalates: the deeper bench answers the same
     * question and the combined six positions decide under the same laws. */
    const second = await secondarydecide(request);
    const combined = aggregatejury({
      kind: first.verdict.kind,
      members: [...first.members, ...second.members],
      weights: [...primary.weights, ...secondary.weights],
      /* the score kind keeps its bounds through the escalation: the
       * request's own range rides the combined aggregate (the validated
       * seat already refused a score without one). */
      ...(first.verdict.kind === "score" && request.range !== undefined ? { range: request.range } : {}),
    });
    const verdict = juryverdictof({ kind: first.verdict.kind, aggregate: combined });
    const trail: jurytrail & { tiers: number[]; escalated: boolean } = {
      instruction: first.trail.instruction,
      rounds: { ...first.trail.rounds, ...second.trail.rounds },
      meters: { ...first.trail.meters, ...second.trail.meters },
      weights: [...primary.weights, ...secondary.weights],
      tiers: [1, 2],
      escalated: true,
    };
    return { verdict, members: [...first.members, ...second.members], trail };
  };
}
