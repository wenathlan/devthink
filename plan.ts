/**
 * The plan module of the 1.1.90 consolidation: every correlated variation of the plan logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the life of a plan file: planlint reads the plan on disk and lints it against the same policy engine the extension runs (originprofile grading, sensitive class consents, portable capability gates, schemastrict unknown field refusal, explicit gate declarations, loop and retry bounds) so an error diagnostic refuses the file before any run starts; planreview renders the review half of the interface the same plan passes on its way to execution (plancards with their risk groups and correction memory matches, stepapprove resolutions with their immutable log events, diffpreviews of write class steps with mask verdicts, stepstimeline nodes derived from progress records with no new state, and the hash chained logstream the surface verifies live as entries arrive).
 * The linter never executes anything and the review surface never bypasses the human: every bound, window and buffer stays the user's choice with no engine cap.
 */

/* ── Merged from planlint.ts ── */

import type { actionkind, classconsent, originprofile, planfile, planfilestep, planlintdiagnostic, portableruleset, sensitiveclass, toolstep } from "./types.js";
import { missingclassconsents, originprofileof, profilegrade, sensitiveclassesof } from "./security.js";
import { portablecapabilitygate, resolvedrisk } from "./policy.js";

/**
 * Planlint logic of the 1.1.67 family.
 * The plan file on disk lints against the same policy engine the extension runs: every step grades against the originprofile of the plan origin, every sensitive class needs the consent the extension would demand, every kind stays inside the portable capability set of the target runtime, unknown fields refuse under schemastrict, sensitive steps declare their gate explicitly, selectors that cannot resolve without a live page flag, and unbounded loops and missing retry bounds surface before any run starts.
 * The linter never executes anything and never touches a page: it reads the plan file and the compiled portable rule set only, and an error diagnostic refuses the file before flowrun ever sees it.
 */

/** The step fields a plan file carries; any other field refuses under schemastrict with the path that names it. */
export const planfilestepfields: readonly string[] = ["id", "kind", "label", "target", "value", "options", "gate", "bound", "attempts"];

/** The control flow kinds whose loop bound the linter reads; an absent bound flags as unbounded. */
export const loopkinds: readonly string[] = ["loop", "whileloop", "repeatuntil"];

/** The retrying kinds whose attempts the linter reads; absent attempts flag as missing retry bounds. */
export const retrykinds: readonly string[] = ["retryaction", "trycatch"];

/** Reads one string field of an unknown record or refuses with the path that names it. */
function textfield(value: Record<string, unknown>, field: string, path: string): string {
  const fieldvalue = value[field];
  if (typeof fieldvalue !== "string" || fieldvalue.trim() === "") throw new Error(`${path} needs its ${field} as a non-empty string.`);
  return fieldvalue;
}

/** Parses one plan file under schemastrict: the version, goal and origin are mandatory, every step maps onto the plan file step shape and unknown fields refuse with the path that names them. */
export function parseplanfile(value: unknown): planfile {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("The plan file must be a json object.");
  const root = value as Record<string, unknown>;
  const rootfields = ["version", "goal", "origin", "steps", "grants", "denials"];
  const unknownrootfields = Object.keys(root).filter(key => !rootfields.includes(key));
  if (unknownrootfields.length > 0) throw new Error(`The plan file carries the unknown field${unknownrootfields.length === 1 ? "" : "s"} ${unknownrootfields.join(", ")}; schemastrict refuses unknown plan fields.`);
  const version = textfield(root, "version", "The plan file");
  const goal = textfield(root, "goal", "The plan file");
  const origin = textfield(root, "origin", "The plan file");
  if (!origin.startsWith("https://")) throw new Error("The plan file origin must be an HTTPS origin.");
  if (!Array.isArray(root.steps) || root.steps.length === 0) throw new Error("The plan file needs at least one step.");
  const steps: planfilestep[] = [];
  root.steps.forEach((rawstep, index) => {
    const path = `The plan file step at index ${index}`;
    if (typeof rawstep !== "object" || rawstep === null || Array.isArray(rawstep)) throw new Error(`${path} must be an object.`);
    const step = rawstep as Record<string, unknown>;
    const unknownfields = Object.keys(step).filter(key => !planfilestepfields.includes(key));
    if (unknownfields.length > 0) throw new Error(`${path} carries the unknown field${unknownfields.length === 1 ? "" : "s"} ${unknownfields.join(", ")}; schemastrict refuses unknown plan fields.`);
    const parsed: planfilestep = { id: textfield(step, "id", path), kind: textfield(step, "kind", path), label: textfield(step, "label", path) };
    if (step.target !== undefined) parsed.target = textfield(step, "target", path);
    if (step.value !== undefined) parsed.value = String(step.value);
    if (step.options !== undefined) parsed.options = String(step.options);
    if (step.gate !== undefined) {
      if (typeof step.gate !== "boolean") throw new Error(`${path} carries a gate declaration that is not a boolean.`);
      parsed.gate = step.gate;
    }
    if (step.bound !== undefined) {
      if (typeof step.bound !== "number" || !Number.isInteger(step.bound) || step.bound < 1) throw new Error(`${path} carries a loop bound that is not a positive integer.`);
      parsed.bound = step.bound;
    }
    if (step.attempts !== undefined) {
      if (typeof step.attempts !== "number" || !Number.isInteger(step.attempts) || step.attempts < 1) throw new Error(`${path} carries retry attempts that are not a positive integer.`);
      parsed.attempts = step.attempts;
    }
    steps.push(parsed);
  });
  const file: planfile = { version, goal, origin, steps };
  if (root.grants !== undefined) {
    if (!Array.isArray(root.grants) || !root.grants.every(grant => typeof grant === "string" && grant.trim() !== "")) throw new Error("The plan file grants must be a list of non-empty action kind names.");
    file.grants = root.grants.filter((grant): grant is string => typeof grant === "string");
  }
  if (root.denials !== undefined) {
    if (!Array.isArray(root.denials) || !root.denials.every(denial => typeof denial === "string" && denial.trim() !== "")) throw new Error("The plan file denials must be a list of non-empty action kind names.");
    file.denials = root.denials.filter((denial): denial is string => typeof denial === "string");
  }
  return file;
}

/** Reads the originprofile of one plan file: the profile builds from the declared kind grants exactly the way the extension builds it, so the lint and the runtime grade the same step the same way. */
export function planoriginprofile(file: planfile, now: number): originprofile {
  return originprofileof({ origin: file.origin, grants: (file.grants ?? []) as actionkind[], denials: (file.denials ?? []) as actionkind[], now });
}

/** Reads the derived risk of one plan file step: the same risk derivation the extension runs, so the lint and the runtime grade one step identically. The 1.1.80 cli family shares this grade with the risk summary planlint prints. */
export function plansteprisk(step: planfilestep): "read" | "interaction" | "sensitive" {
  const mapped = { id: step.id, kind: step.kind as actionkind, label: step.label, summary: step.label, ...(step.target !== undefined ? { target: step.target } : {}), ...(step.value !== undefined ? { value: step.value } : {}), ...(step.options !== undefined ? { options: step.options } : {}), risk: "sensitive" } as toolstep;
  try { return resolvedrisk(mapped); } catch { return "sensitive"; }
}

const steprisk = plansteprisk;

/** Lints one plan file against the compiled portable rule set: every rule of the set runs, every diagnostic carries its code, path and severity, and an error diagnostic refuses the file before any run starts. */
export function lintplanfile(input: { file: planfile; ruleset: portableruleset; capabilities: string[]; consents?: classconsent[]; now: number }): planlintdiagnostic[] {
  const diagnostics: planlintdiagnostic[] = [];
  const rules = new Set(input.ruleset.rules.map(rule => rule.id));
  const profile: originprofile = input.file.origin.trim() === "" ? { profileid: "missing", origin: input.file.origin, grants: (input.file.grants ?? []) as actionkind[], denials: (input.file.denials ?? []) as actionkind[], createdat: input.now, updatedat: input.now } : planoriginprofile(input.file, input.now);
  input.file.steps.forEach((step, index) => {
    const path = `steps[${index}]`;
    if (rules.has("originprofilegrade")) {
      const grade = profilegrade({ profile, kind: step.kind as actionkind, sensitive: steprisk(step) === "sensitive" });
      if (!grade.allowed) diagnostics.push({ code: "plan.origin.grade", path: `${path}.kind`, severity: "error", message: `The step ${step.id} of kind ${step.kind} fails the originprofile of ${input.file.origin}: ${grade.reason ?? "the originprofile refuses the kind."}` });
    }
    if (rules.has("classconsent")) {
      const classes = sensitiveclassesof({ kind: step.kind as actionkind, ...(step.value !== undefined ? { value: step.value } : {}), ...(step.options !== undefined ? { options: step.options } : {}) });
      const missing = missingclassconsents({ origin: input.file.origin, classes: classes.classes, bydefault: classes.bydefault, consents: input.consents ?? [], now: input.now });
      if (missing.needed) diagnostics.push({ code: "plan.consent.class", path: `${path}.kind`, severity: "error", message: `The step ${step.id} needs the sensitive class consent${missing.missing.length === 1 ? "" : "s"} ${missing.missing.join(", ")} for ${input.file.origin}; the extension demands the same fresh consent before the step runs.` });
    }
    if (rules.has("portablecapability")) {
      const capability = portablecapabilitygate({ kind: step.kind, capabilities: input.capabilities });
      if (!capability.allowed) diagnostics.push({ code: "plan.capability.kind", path: `${path}.kind`, severity: "error", message: capability.reason ?? "The step kind exceeds the portable capability set." });
    }
    if (rules.has("gatedeclaration")) {
      const sensitive = steprisk(step) === "sensitive" || sensitiveclassesof({ kind: step.kind as actionkind, ...(step.value !== undefined ? { value: step.value } : {}), ...(step.options !== undefined ? { options: step.options } : {}) }).sensitive;
      if (sensitive && step.gate !== true) diagnostics.push({ code: "plan.gate.declaration", path: `${path}.gate`, severity: "error", message: `The step ${step.id} of kind ${step.kind} is sensitive and declares no gate; a sensitive step without an explicit gate declaration refuses before any run starts.` });
    }
    if (rules.has("staticselector") && step.target !== undefined && /\{\{[^{}]*\}\}/.test(step.target)) {
      diagnostics.push({ code: "plan.selector.static", path: `${path}.target`, severity: "info", message: `The target of the step ${step.id} carries the template ${step.target}; a templated selector resolves only against the live page of the run.` });
    }
    if (rules.has("loopbound") && loopkinds.includes(step.kind) && step.bound === undefined) {
      diagnostics.push({ code: "plan.control.loopbound", path: `${path}.bound`, severity: "warn", message: `The loop step ${step.id} of kind ${step.kind} carries no bound; the linter flags every unbounded loop so the author states the iteration ceiling they want.` });
    }
    if (rules.has("retrybound") && retrykinds.includes(step.kind) && step.attempts === undefined) {
      diagnostics.push({ code: "plan.control.retrybound", path: `${path}.attempts`, severity: "warn", message: `The retrying step ${step.id} of kind ${step.kind} carries no attempts; the linter flags every missing retry bound so the author states the attempts they reviewed.` });
    }
  });
  if (input.file.goal.trim() === "") diagnostics.push({ code: "plan.goal.empty", path: "goal", severity: "error", message: "The plan file carries no goal; a goalless plan reviews nothing." });
  if (input.file.origin.trim() === "") diagnostics.push({ code: "plan.origin.empty", path: "origin", severity: "error", message: "The plan file carries no origin; an originless plan matches no profile." });
  return diagnostics;
}

/** Formats one diagnostic set for the terminal: the human format lists one line per diagnostic with its severity, path and message, and the json format carries the whole set as one json array. */
export function formatdiagnostics(diagnostics: planlintdiagnostic[], format: "human" | "json"): string {
  if (format === "json") return JSON.stringify(diagnostics, null, 2);
  if (diagnostics.length === 0) return "No planlint diagnostics.";
  return diagnostics.map(diagnostic => `${diagnostic.severity.toUpperCase()} ${diagnostic.code} at ${diagnostic.path}: ${diagnostic.message}`).join("\n");
}

/** Reads the exit code of one lint run: any error diagnostic exits non zero, while info and warn diagnostics keep the run green. */
export function planlintexitcode(diagnostics: planlintdiagnostic[]): number {
  return diagnostics.some(diagnostic => diagnostic.severity === "error") ? 1 : 0;
}

/** Reads the cache key of one compiled portable rule set: the version and the rule ids compose one deterministic key so repeat runs reuse the parsed rules until the set changes. */
export function rulesetcachekey(ruleset: portableruleset): string {
  return `planlint-${ruleset.version}-${ruleset.rules.map(rule => rule.id).join("+")}`;
}

/** Reads the plan lint summary of one file for the audit trail: the diagnostic counts per severity beside the exit code the run carries. */
export function planlintsummary(diagnostics: planlintdiagnostic[]): { info: number; warn: number; error: number; exitcode: number; reason: string } {
  const info = diagnostics.filter(diagnostic => diagnostic.severity === "info").length;
  const warn = diagnostics.filter(diagnostic => diagnostic.severity === "warn").length;
  const error = diagnostics.filter(diagnostic => diagnostic.severity === "error").length;
  return { info, warn, error, exitcode: planlintexitcode(diagnostics), reason: `The plan lint raised ${info} info, ${warn} warn and ${error} error diagnostic${info + warn + error === 1 ? "" : "s"}; ${error > 0 ? "the error diagnostics refuse the plan file before any run starts" : "no error diagnostic refuses the plan file"}.` };
}

/** Reads the sensitive classes one plan file needs consent for, so the flowrun gate waits name the classes the terminal prompt shows. */
export function plansensitiveclasses(file: planfile): sensitiveclass[] {
  const classes = new Set<sensitiveclass>();
  for (const step of file.steps) for (const sensitiveclass of sensitiveclassesof({ kind: step.kind as actionkind, ...(step.value !== undefined ? { value: step.value } : {}), ...(step.options !== undefined ? { options: step.options } : {}) }).classes) classes.add(sensitiveclass);
  return [...classes];
}

/* ── Merged from planreview.ts ── */

import type { actionrisk, agentplan, correctionentry, diffchange, diffpreviewpayload, gatewaitevidence, loghash, loglevel, logstreamevent, logstreamfilter, planprogress, plancard, plancardgroup, stepapproveresolution, stepoutcome, stepstimelinenode, uisurface } from "./types.js";
import { defaultenvironment } from "./environments.js";
import { matchingcorrections } from "./session.js";
import { entryhashof } from "./security.js";
import { randomid } from "./memory.js";

/**
 * Plan review surface logic of the 1.1.64 family, part one.
 * The review half of the interface lives here: plancards render one card per proposed step with its kind, risk class, environment and options and group by risk class with the sensitive classes expanded by default while the matching corrections of correctionmemory sit beside their steps; stepapprove resolves exactly one step per distinct human action with approve, reject and edit provenance that lands in the immutable log; diffpreview compares the observed before state with the predicted after state of write class steps only and highlights added, changed and removed fields with masked values carrying their mask verdicts; the stepstimeline derives its pending, running, waiting, done, failed and halted nodes from progress records with no new state, showing durations, environment badges and deep link anchors; and the logstream appends live events with level, source and step ref behind a hash chain the surface verifies as entries arrive while the bounded live window keeps the full history in memory.
 * No bound is ever hardcoded: the live buffer window stays the user's choice with no engine cap, and no review surface ever bypasses the human review.
 */

/** Builds one plancard per proposed step: the kind, the risk class, the execution environment, the reviewed options, the summary, the matching corrections from correctionmemory and the edit before approve offer of a pending plan. */
export function plancardsof(input: { plan: agentplan; corrections: correctionentry[] }): plancard[] {
  return input.plan.steps.map((step: toolstep) => ({
    stepid: step.id,
    kind: step.kind,
    risk: step.risk,
    environment: step.environment ?? defaultenvironment(step),
    options: step.options ?? "",
    summary: step.summary,
    corrections: matchingcorrections(input.corrections, { origin: input.plan.origin, kind: step.kind }).map(entry => ({ id: entry.id, source: entry.source, reason: entry.reason })),
    editable: input.plan.state === "pending",
  }));
}

/** Groups the plancards by risk class: the sensitive group expands by default while the read and interaction groups start folded. */
export function plancardgroups(cards: plancard[]): plancardgroup[] {
  const order: actionrisk[] = ["sensitive", "interaction", "read"];
  return order.map(risk => ({ risk, cards: cards.filter(card => card.risk === risk), expanded: risk === "sensitive" })).filter(group => group.cards.length > 0);
}

/** Builds one stepapprove resolution: the step, the plan, the origin, the decision, the distinct human surface and the edited step shape an edit carries. */
export function stepresolutionof(input: { stepid: string; planid: string; origin: string; resolution: "approve" | "reject" | "edit"; surface: uisurface; edited?: string; at: number }): stepapproveresolution {
  if (input.stepid.trim() === "") throw new Error("The stepapprove resolution needs its step.");
  if (input.resolution === "edit" && (input.edited ?? "").trim() === "") throw new Error("The edited resolution needs its corrected step shape.");
  return { stepid: input.stepid, planid: input.planid, origin: input.origin, resolution: input.resolution, surface: input.surface, ...(input.edited !== undefined && input.edited.trim() !== "" ? { edited: input.edited } : {}), at: input.at };
}

/** Builds the immutable log event of one stepapprove resolution: the review kind entry the sealed chain keeps. */
export function resolutionlogeventof(resolution: stepapproveresolution): { kind: "review"; summary: string; stepid: string } {
  return {
    kind: "review",
    stepid: resolution.stepid,
    summary: resolution.resolution === "edit"
      ? `The user edited the step ${resolution.stepid} of the plan ${resolution.planid} from the ${resolution.surface} before approving; the corrected shape rides the plan.`
      : `The user ${resolution.resolution === "approve" ? "approved" : "rejected"} the step ${resolution.stepid} of the plan ${resolution.planid} from the ${resolution.surface}; one distinct human action resolved the step alone.`,
  };
}

/** Appends one stepapprove resolution to the per origin history: the review provenance stays queryable per origin. */
export function resolutionhistoryafter(history: stepapproveresolution[], resolution: stepapproveresolution): stepapproveresolution[] {
  return [resolution, ...history];
}

/** Derives the mask verdicts of one state pair: every sensitive field shape carries its verdict reason while the rest stays unmasked. */
export function maskverdictsof(state: Record<string, string>, sensitivefields: string[]): Record<string, string> {
  const verdicts: Record<string, string> = {};
  for (const [field, value] of Object.entries(state)) {
    if (sensitivefields.includes(field)) verdicts[field] = `The ${field} value stays masked (${value.length} characters) and never renders in the clear.`;
  }
  return verdicts;
}

/** Compares the observed before state with the predicted after state of one write class step: added, changed and removed fields with the mask verdicts of masked values. */
export function diffpreviewof(input: { stepid: string; before: Record<string, string>; after: Record<string, string>; maskverdicts?: Record<string, string>; provenance: "inline" | "offscreenworker" }): diffpreviewpayload {
  const changes: diffchange[] = [];
  const fields = [...new Set([...Object.keys(input.before), ...Object.keys(input.after)])];
  for (const field of fields) {
    const hasbefore = Object.prototype.hasOwnProperty.call(input.before, field);
    const hasafter = Object.prototype.hasOwnProperty.call(input.after, field);
    const beforevalue = input.before[field];
    const aftervalue = input.after[field];
    if (hasbefore && !hasafter && beforevalue !== undefined) changes.push({ field, kind: "removed", before: beforevalue });
    else if (!hasbefore && hasafter && aftervalue !== undefined) changes.push({ field, kind: "added", after: aftervalue });
    else if (hasbefore && hasafter && beforevalue !== undefined && aftervalue !== undefined && beforevalue !== aftervalue) changes.push({ field, kind: "changed", before: beforevalue, after: aftervalue });
  }
  return { stepid: input.stepid, before: input.before, after: input.after, changes, maskverdicts: input.maskverdicts ?? {}, provenance: input.provenance };
}

/** Derives the stepstimeline nodes from the plan and its progress records with no new state: pending, running, waiting, done, failed and halted statuses, durations, environment badges, the active mark and the deep link anchors. */
export function stepstimelinenodes(input: { plan: agentplan; progress?: planprogress; now: number }): stepstimelinenode[] {
  const completed = input.progress?.completedsteps ?? [];
  const outcomes: stepoutcome[] = input.progress?.outcomes ?? [];
  const environments = input.progress?.environments;
  const turnarounds = input.progress?.turnarounds;
  const gatewaits = input.progress?.gatewaits;
  let activeset = false;
  let blocked = false;
  return input.plan.steps.map((step: toolstep) => {
    const outcome = [...outcomes].reverse().find(candidate => candidate.stepid === step.id);
    const gatewait: gatewaitevidence | undefined = gatewaits?.[step.id];
    let status: stepstimelinenode["status"];
    if (outcome !== undefined) status = outcome.ok ? "done" : "failed";
    else if (gatewait !== undefined) status = "waiting";
    else if (completed.includes(step.id)) status = "done";
    else if (input.plan.state === "cancelled" || input.plan.state === "expired") status = "halted";
    else if (input.plan.state === "rejected") status = "halted";
    else if (input.plan.state === "approved" && !activeset && !blocked) { status = "running"; activeset = true; }
    else status = "pending";
    if (status === "waiting") blocked = true;
    const active = status === "running";
    return {
      stepid: step.id,
      kind: step.kind,
      status,
      ...(turnarounds?.[step.id] !== undefined ? { durationms: turnarounds[step.id] } : {}),
      ...(environments?.[step.id] !== undefined ? { environment: environments[step.id] } : step.environment !== undefined ? { environment: step.environment } : {}),
      active,
      anchor: `#step-${step.id}`,
      ...(outcome !== undefined ? { resultsummary: outcome.summary } : {}),
    };
  });
}

/** Returns the deep link anchor of the active node the timeline scrolls to during a run. */
export function activetimelineanchor(nodes: stepstimelinenode[]): string | undefined {
  return nodes.find(node => node.active)?.anchor;
}

/** The genesis hash the first logstream event chains to, mirroring the immutable log genesis. */
export const logstreamgenesis = "0".repeat(64);

/** Builds one logstream event behind the hash chain: the level, the source, the origin, the summary, the optional step ref, the mask verdict of the source payload and the link to the previous event. */
export async function logstreameventof(input: { level: loglevel; source: string; origin: string; summary: string; stepid?: string; masked: boolean; maskverdict: string; previous: string; at: number }): Promise<logstreamevent> {
  if (input.summary.trim() === "") throw new Error("The logstream event needs its summary.");
  const id = randomid();
  const hash: loghash = await entryhashof({ previous: input.previous, entry: { id, runid: "surfaces", kind: "step", summary: input.summary, origin: input.origin, ...(input.stepid !== undefined ? { stepid: input.stepid } : {}), at: input.at } });
  return { id, level: input.level, source: input.source, origin: input.origin, summary: input.summary, ...(input.stepid !== undefined ? { stepid: input.stepid } : {}), masked: input.masked, maskverdict: input.maskverdict, hash, at: input.at };
}

/** Appends one logstream event to the in memory history: the history stays full while the live window reads its bounded slice. */
export function appendlogstreamevent(events: logstreamevent[], event: logstreamevent): logstreamevent[] {
  return [...events, event];
}

/** Filters the logstream events by level, origin and step ref: an absent filter keeps every event. */
export function filterlogstream(events: logstreamevent[], filter: logstreamfilter): logstreamevent[] {
  return events.filter(event => (filter.level === undefined || event.level === filter.level) && (filter.origin === undefined || filter.origin === "" || event.origin === filter.origin) && (filter.stepid === undefined || filter.stepid === "" || event.stepid === filter.stepid));
}

/** Returns the bounded live window of the logstream: the user configured bound keeps the newest events while the full history stays in memory; an absent bound keeps every event live. */
export function livebufferof(events: logstreamevent[], bound: number | undefined): logstreamevent[] {
  if (bound === undefined) return events;
  if (!Number.isInteger(bound) || bound <= 0) return events;
  return events.slice(-bound);
}

/** Verifies the logstream hash chain live as entries arrive: every event links to its predecessor and a broken link names its position. */
export async function verifylogstream(events: logstreamevent[]): Promise<{ valid: boolean; brokenat?: number; reason: string }> {
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];
    if (event === undefined) continue;
    const predecessor = events[index - 1];
    const expectedprevious = index === 0 || predecessor === undefined ? logstreamgenesis : predecessor.hash.current;
    if (event.hash.previous !== expectedprevious) return { valid: false, brokenat: index, reason: `The logstream chain breaks at the event ${event.id}: its previous hash does not link to its predecessor.` };
    const recomputed = await entryhashof({ previous: event.hash.previous, entry: { id: event.id, runid: "surfaces", kind: "step", summary: event.summary, origin: event.origin, ...(event.stepid !== undefined ? { stepid: event.stepid } : {}), at: event.at } });
    if (recomputed.current !== event.hash.current) return { valid: false, brokenat: index, reason: `The logstream chain breaks at the event ${event.id}: its own hash does not reproduce.` };
  }
  return { valid: true, reason: `The logstream chain of ${events.length} event${events.length === 1 ? "" : "s"} verifies link by link.` };
}

/** Copies one verified range of the logstream as an audit excerpt: an unverified chain refuses the copy while a verified range renders its entries with level, source and mask verdict. */
export async function auditexcerptof(events: logstreamevent[], input: { from: number; to: number }): Promise<{ ok: boolean; text: string; reason: string }> {
  if (input.from < 0 || input.to <= input.from || input.to > events.length) return { ok: false, text: "", reason: `The excerpt range ${input.from} to ${input.to} names no contiguous slice of the ${events.length} event${events.length === 1 ? "" : "s"}.` };
  const range = events.slice(input.from, input.to);
  const verification = await verifylogstream(range);
  if (!verification.valid) return { ok: false, text: "", reason: `The excerpt refuses the copy: ${verification.reason}` };
  const text = range.map(event => `[${event.at}] ${event.level} ${event.source}${event.stepid !== undefined ? ` step ${event.stepid}` : ""} ${event.origin} — ${event.summary}${event.masked ? ` (${event.maskverdict})` : ""}`).join("\n");
  return { ok: true, text, reason: `The excerpt copied the verified range ${input.from} to ${input.to} of the logstream.` };
}

/** Maps one audit kind onto the logstream level its event carries: errors stream as error, the refusal family streams as warn and the rest streams as info. */
export function loglevelof(kind: string): loglevel {
  if (kind === "error") return "error";
  if (["deny", "revoke", "stop", "quarantine", "phish", "defer", "schema", "expiry"].includes(kind)) return "warn";
  return "info";
}
