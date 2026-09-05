import type { agentplan, clockadapter, environmentkind, gatewaitevidence, perfrecord, planprogress, shotpair, shotrecord, snapshotchange, stepoutcome, wizardstate } from "./types.js";
import { packageversion, protocolmajor } from "./version.js";

/**
 * Execution-progress logics for reviewed plans.
 * Every correlated rule for step completion, outcome history, deduplication and plan closure lives in this file. The 1.1.81 library modes keep the module clock free: the progress model takes the clock adapter the runtime injects, so the timestamps answer the adapter seam instead of a clock the module creates.
 */

/** One release candidate provenance stamp of the rc audit trail: the package release and the protocol major of the build that produced the stamped entry, so the audit trail answers which release wrote every progress record and every step stamp. */
export interface provenancestamp {
  /** The package release of the build that produced the stamped entry, read from the version.ts packageversion const. */
  release: string;
  /** The frozen protocol major of the build that produced the stamped entry, read from the version.ts protocolmajor const. */
  protocolmajor: number;
}

/** Stamps the release candidate provenance of this build: every progress record the stamp functions create and every outcome they record carries the stamp, so the audit trail names the release that produced each entry. */
export function provenancestampof(): provenancestamp {
  return { release: packageversion, protocolmajor };
}

/** Reads the current timestamp through the clock adapter the runtime injected: the progress module owns no clock, so the running bundle decides what now means. Example: `progressnow(clock)` answers the adapter timestamp. */
export function progressnow(clock: clockadapter): number {
  return clock.now();
}

/** Records one step outcome through the clock adapter: the completion stamp and the outcome append in one pass, so a caller drives the progress model with the injected clock alone. Example: `recordoutcomewithclock(progress, planid, outcome, clock)` stamps the adapter timestamp. */
export function recordoutcomewithclock(progress: planprogress | undefined, planid: string, outcome: stepoutcome, clock: clockadapter): planprogress {
  return recordoutcome(progress, planid, outcome, clock.now());
}

/** Returns a fresh progress record for a plan that has not executed any step yet; the record carries the release candidate provenance stamp of the build that created it. */
export function emptyprogress(planid: string, now: number): planprogress {
  return { planid, completedsteps: [], provenance: provenancestampof(), updatedat: now };
}

/** Records one successfully executed step; repeated executions of the same step stay deduplicated, and a fresh record carries the release candidate provenance stamp of the build that wrote it. */
export function recordstep(progress: planprogress | undefined, planid: string, stepid: string, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  if (base.completedsteps.includes(stepid)) return { ...base, updatedat: now };
  return { planid, completedsteps: [...base.completedsteps, stepid], provenance: provenancestampof(), updatedat: now };
}

/** Records one structured step outcome beside the completion log; outcomes are never truncated and every outcome gains the release candidate provenance stamp of the build that recorded it. */
export function recordoutcome(progress: planprogress | undefined, planid: string, outcome: stepoutcome, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  return { ...base, outcomes: [...(base.outcomes ?? []), { ...outcome, provenance: provenancestampof() }], updatedat: now };
}

/** Records the execution environment of one completed step so the evidence trail reads where every step ran; repeated records of one step keep the latest environment. */
export function recordenvironment(progress: planprogress | undefined, planid: string, stepid: string, environment: environmentkind, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  return { ...base, environments: { ...(base.environments ?? {}), [stepid]: environment }, updatedat: now };
}

/** Reads the recorded execution environment of one step of the tracked plan. */
export function environmentof(progress: planprogress | undefined, planid: string, stepid: string): environmentkind | undefined {
  if (!progress || progress.planid !== planid) return undefined;
  return (progress.environments ?? {})[stepid];
}

/** Records the worker turnaround of one offloaded step in milliseconds for later profiling; repeated records of one step keep the latest turnaround. */
export function recordturnaround(progress: planprogress | undefined, planid: string, stepid: string, milliseconds: number, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  return { ...base, turnarounds: { ...(base.turnarounds ?? {}), [stepid]: milliseconds }, updatedat: now };
}

/** Reads the recorded worker turnaround of one step of the tracked plan, in milliseconds. */
export function turnaroundof(progress: planprogress | undefined, planid: string, stepid: string): number | undefined {
  if (!progress || progress.planid !== planid) return undefined;
  return (progress.turnarounds ?? {})[stepid];
}

/** Records the gate wait of one gated step beside its step durations: the confirm gate the step waited at with its waited milliseconds; repeated records of one step keep the latest wait. */
export function recordgatewait(progress: planprogress | undefined, planid: string, stepid: string, entry: gatewaitevidence, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  return { ...base, gatewaits: { ...(base.gatewaits ?? {}), [stepid]: entry }, updatedat: now };
}

/** Reads the recorded gate wait of one step of the tracked plan. */
export function gatewaitof(progress: planprogress | undefined, planid: string, stepid: string): gatewaitevidence | undefined {
  if (!progress || progress.planid !== planid) return undefined;
  return (progress.gatewaits ?? {})[stepid];
}

/** Records the perf data of one executed step beside its outcome: the duration, the query count, the cache hits and the delta flag the step cost; repeated records of one step keep the latest measurement. */
export function recordperf(progress: planprogress | undefined, planid: string, stepid: string, record: perfrecord, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  return { ...base, perf: { ...(base.perf ?? {}), [stepid]: record }, updatedat: now };
}

/** Reads the recorded perf record of one step of the tracked plan: the duration, the query count and the cache hits beside the delta flag. */
export function perfof(progress: planprogress | undefined, planid: string, stepid: string): perfrecord | undefined {
  if (!progress || progress.planid !== planid) return undefined;
  return (progress.perf ?? {})[stepid];
}

/** Records the snapshot change set of one executed step in the incrsnapshot change format, so progress deltas reuse the exact change format the snapshot builder emits; repeated records of one step keep the latest change set. */
export function recorddeltas(progress: planprogress | undefined, planid: string, stepid: string, changes: snapshotchange[], now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  return { ...base, deltas: { ...(base.deltas ?? {}), [stepid]: changes }, updatedat: now };
}

/** Reads the recorded snapshot change set of one step of the tracked plan, in the incrsnapshot change format. */
export function deltasof(progress: planprogress | undefined, planid: string, stepid: string): snapshotchange[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.deltas ?? {})[stepid] ?? [];
}

/** True only when every step of the plan has a recorded, successful execution. */
export function iscomplete(progress: planprogress | undefined, plan: agentplan): boolean {
  if (!progress || progress.planid !== plan.id) return false;
  const required = plan.steps.map(step => step.id);
  return required.length > 0 && required.every(id => progress.completedsteps.includes(id));
}

/** Clears progress whenever a different plan replaces the tracked one while preserving prior history snapshots; the fresh record carries the release candidate provenance stamp of the build that reset it. */
export function resetforplan(progress: planprogress | undefined, plan: agentplan, now: number): planprogress {
  if (progress && progress.planid === plan.id) return progress;
  if (!progress) return emptyprogress(plan.id, now);
  const snapshot: planprogress = { planid: progress.planid, completedsteps: progress.completedsteps, ...(progress.outcomes ? { outcomes: progress.outcomes } : {}), updatedat: progress.updatedat };
  return { planid: plan.id, completedsteps: [], outcomes: [], prior: [...(progress.prior ?? []), snapshot], provenance: provenancestampof(), updatedat: now };
}

/** True when a reviewed watch lifetime window has closed at the given time. */
export function watchclosed(startedat: number, lifetime: number, now: number): boolean {
  return now >= startedat + lifetime;
}

/** Records one watch step as completed only once its reviewed lifetime window has closed. */
export function recordwatchcompletion(progress: planprogress | undefined, planid: string, stepid: string, startedat: number, lifetime: number, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  if (!watchclosed(startedat, lifetime, now)) return base;
  return recordstep(base, planid, stepid, now);
}

/** One navlist entry completion record with its index, url and outcome. */
export interface naventry {
  index: number;
  url: string;
  ok: boolean;
}

/** Records one navlist entry as it completes, beside the step outcome log, so the trail shows current url and remaining count. */
export function recordnaventry(progress: planprogress | undefined, planid: string, stepid: string, entry: naventry, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome: stepoutcome = { stepid, ok: entry.ok, summary: `Navigation list entry ${entry.index + 1} of ${entry.url} ${entry.ok ? "completed" : "failed"}.`, details: { naventry: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded navlist entry completion of one step, oldest first. */
export function naventries(progress: planprogress | undefined, planid: string, stepid: string): naventry[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.naventry !== undefined).map(outcome => outcome.details?.naventry as naventry);
}

/** Assigns one tab to the running task so progress tracks work across its tabs. */
export function assigntasktab(progress: planprogress | undefined, planid: string, tabid: number, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  if ((base.tasktabs ?? []).includes(tabid)) return { ...base, updatedat: now };
  return { ...base, tasktabs: [...(base.tasktabs ?? []), tabid], updatedat: now };
}

/** Releases one task tab when its work inside the running task ends. */
export function releasetasktab(progress: planprogress | undefined, planid: string, tabid: number, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const remaining = (base.tasktabs ?? []).filter(id => id !== tabid);
  const { tasktabs: released, ...rest } = base;
  void released;
  return { ...rest, ...(remaining.length > 0 ? { tasktabs: remaining } : {}), updatedat: now };
}

/** Returns the tabs assigned to the running task, in assignment order. */
export function tasktabs(progress: planprogress | undefined, planid: string): number[] {
  if (!progress || progress.planid !== planid) return [];
  return progress.tasktabs ?? [];
}

/** Returns the wizard completion share as executed steps over the total steps. */
export function wizardcompletion(state: wizardstate): number {
  if (state.steps <= 0) return 0;
  return Math.min(1, state.completed.filter(Boolean).length / state.steps);
}

/** Returns the extraction progress share as rows collected over the user estimated total; an absent estimate stays at zero. */
export function extractionshare(rowscollected: number, estimatedtotal: number): number {
  if (!Number.isFinite(estimatedtotal) || estimatedtotal <= 0) return 0;
  return Math.min(1, Math.max(0, rowscollected) / estimatedtotal);
}

/** One extraction page completion record with its page number, row count and cursor. */
export interface extractionentry {
  page: number;
  rows: number;
  cursor: number;
}

/** Records one extracted page in the plan progress outcome log with its page count, row count and resume cursor. */
export function recordextraction(progress: planprogress | undefined, planid: string, stepid: string, entry: extractionentry, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome: stepoutcome = { stepid, ok: true, summary: `Extraction page ${entry.page} collected ${entry.rows} row${entry.rows === 1 ? "" : "s"} at cursor ${entry.cursor}.`, details: { extraction: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded extraction page completion of one step, oldest first. */
export function extractionentries(progress: planprogress | undefined, planid: string, stepid: string): extractionentry[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.extraction !== undefined).map(outcome => outcome.details?.extraction as extractionentry);
}

/** Records one wizard step completion into the plan progress outcome log, beside the step log, with the step index and total steps. */
export function recordwizardstep(progress: planprogress | undefined, planid: string, stepid: string, state: wizardstate, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const executed = Math.min(state.index, state.steps);
  const done = executed >= state.steps;
  const outcome: stepoutcome = { stepid, ok: done, summary: `Wizard step ${executed} of ${state.steps} ${done ? "completed the wizard" : "executed"}.`, details: { wizard: { index: state.index, steps: state.steps, completed: [...state.completed] } }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns the batch download progress share as files completed over the total files of the batch. */
export function downloadshare(completed: number, total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.min(1, Math.max(0, completed) / total);
}

/** One batch download file completion record with its index, url and resulting state. */
export interface downloadentry {
  index: number;
  url: string;
  state: string;
}

/** Records one batch download file completion in the plan progress outcome log so the queue shows live per file states. */
export function recorddownload(progress: planprogress | undefined, planid: string, stepid: string, entry: downloadentry, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome: stepoutcome = { stepid, ok: entry.state === "complete", summary: `Download ${entry.index + 1} of ${entry.url} ended in the ${entry.state} state.`, details: { download: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded batch download file completion of one step, oldest first. */
export function downloadentries(progress: planprogress | undefined, planid: string, stepid: string): downloadentry[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.download !== undefined).map(outcome => outcome.details?.download as downloadentry);
}

/** Records one capture completion in the plan progress outcome log with the record id, format and byte size as reviewable evidence. */
export function recordcapture(progress: planprogress | undefined, planid: string, stepid: string, capture: shotrecord, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const bytes = capture.bytes?.length ?? 0;
  const outcome: stepoutcome = { stepid, ok: true, summary: `Captured a ${capture.format} ${capture.kind} shot of ${capture.width} by ${capture.height} pixels with ${bytes} character${bytes === 1 ? "" : "s"} of image data.`, details: { capture: { id: capture.id, kind: capture.kind, format: capture.format, width: capture.width, height: capture.height, bytes } }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Records one before and after shotpair of a wrapped action in the plan progress outcome log with both shot ids and the dom snapshot id. */
export function recordpair(progress: planprogress | undefined, planid: string, stepid: string, pair: shotpair, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome: stepoutcome = { stepid, ok: true, summary: `Paired the before shot ${pair.beforeid} with the after shot ${pair.afterid} around the ${pair.actionkind} action.`, details: { shotpair: { id: pair.id, beforeid: pair.beforeid, afterid: pair.afterid, actionkind: pair.actionkind, ...(pair.target !== undefined ? { target: pair.target } : {}), ...(pair.domsnapshotid !== undefined ? { domsnapshotid: pair.domsnapshotid } : {}) } }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded capture completion of one step, oldest first. */
export function captureentries(progress: planprogress | undefined, planid: string, stepid: string): Array<{ id: string; kind: string; format: string; width: number; height: number; bytes: number }> {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.capture !== undefined).map(outcome => outcome.details?.capture as { id: string; kind: string; format: string; width: number; height: number; bytes: number });
}

/** Returns every recorded shotpair of one step, oldest first. */
export function pairentries(progress: planprogress | undefined, planid: string, stepid: string): Array<{ id: string; beforeid: string; afterid: string; actionkind: string }> {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.shotpair !== undefined).map(outcome => outcome.details?.shotpair as { id: string; beforeid: string; afterid: string; actionkind: string });
}

/** Records one media capture completion in the plan progress outcome log with the record id, kind, scope and byte size as reviewable evidence. */
export function recordmedia(progress: planprogress | undefined, planid: string, stepid: string, media: { id: string; kind: string; scope: string; bytes: number }, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome: stepoutcome = { stepid, ok: true, summary: `Captured a ${media.kind} media record of ${media.scope} scope with ${media.bytes} character${media.bytes === 1 ? "" : "s"} of media data.`, details: { media }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded media capture completion of one step, oldest first. */
export function mediaentries(progress: planprogress | undefined, planid: string, stepid: string): Array<{ id: string; kind: string; scope: string; bytes: number }> {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.media !== undefined).map(outcome => outcome.details?.media as { id: string; kind: string; scope: string; bytes: number });
}

/** One outbound call completion record with its transport facts, retries and byte counts as reviewable evidence. */
export interface callentry {
  id: string;
  kind: string;
  origin: string;
  method: string;
  status: number;
  statusclass: string;
  duration: number;
  retries: number;
  bytes: number;
}

/** Records one outbound call completion in the plan progress outcome log with method, origin, status class, retries and byte counts. */
export function recordcall(progress: planprogress | undefined, planid: string, stepid: string, entry: callentry, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome: stepoutcome = { stepid, ok: entry.statusclass === "success", summary: `Outbound ${entry.method} ${entry.kind} call to ${entry.origin} ended in the ${entry.status} ${entry.statusclass} class after ${entry.retries} retr${entry.retries === 1 ? "y" : "ies"} and ${entry.bytes} byte${entry.bytes === 1 ? "" : "s"}.`, details: { call: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded outbound call completion of one step, oldest first. */
export function callentries(progress: planprogress | undefined, planid: string, stepid: string): callentry[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.call !== undefined).map(outcome => outcome.details?.call as callentry);
}

/** One fetch retry progress record with its attempt number, url and backoff wait. */
export interface fetchretryentry {
  attempt: number;
  url: string;
  wait: number;
  reason: string;
}

/** Records one fetch retry in the plan progress outcome log so the sidepanel reports fetch progress on each retry. */
export function recordfetchretry(progress: planprogress | undefined, planid: string, stepid: string, retry: fetchretryentry, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome: stepoutcome = { stepid, ok: false, summary: `Fetch attempt ${retry.attempt} of ${retry.url} failed (${retry.reason}); retrying after a ${retry.wait} millisecond backoff.`, details: { fetchretry: retry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded fetch retry of one step, oldest first. */
export function fetchretryentries(progress: planprogress | undefined, planid: string, stepid: string): fetchretryentry[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.fetchretry !== undefined).map(outcome => outcome.details?.fetchretry as fetchretryentry);
}

/** One channel lifecycle evidence record with its id, kind, state and message counters. */
export interface channelentry {
  id: string;
  kind: string;
  state: string;
  url: string;
  sent: number;
  received: number;
}

/** Records one channel lifecycle transition in the plan progress outcome log with its message counters. */
export function recordchannel(progress: planprogress | undefined, planid: string, stepid: string, entry: channelentry, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome: stepoutcome = { stepid, ok: entry.state !== "failed", summary: `The ${entry.kind} channel of ${entry.url} is ${entry.state} after ${entry.sent} sent and ${entry.received} received message${entry.received === 1 ? "" : "s"}.`, details: { channel: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded channel lifecycle transition of one step, oldest first. */
export function channelentries(progress: planprogress | undefined, planid: string, stepid: string): channelentry[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.channel !== undefined).map(outcome => outcome.details?.channel as channelentry);
}

/** One observed exchange evidence record with its correlation id, transport facts and error class. */
export interface exchangeevidence {
  id: string;
  correlationid: string;
  method: string;
  origin: string;
  url: string;
  status: number;
  statusclass: string;
  duration: number;
  bytes: number;
  errorclass?: string;
}

/** Records one observed request exchange in the plan progress outcome log with its correlation id, status class, duration and byte size. */
export function recordexchange(progress: planprogress | undefined, planid: string, stepid: string, entry: exchangeevidence, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome: stepoutcome = { stepid, ok: entry.errorclass === undefined && entry.statusclass === "success", summary: `Observed the ${entry.method} request of ${entry.url} as exchange ${entry.correlationid} in the ${entry.status} ${entry.statusclass} class over ${entry.duration} millisecond${entry.duration === 1 ? "" : "s"}${entry.errorclass !== undefined ? ` failing with the ${entry.errorclass} class` : ""}.`, details: { exchange: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded exchange evidence of one step, oldest first. */
export function exchangeentries(progress: planprogress | undefined, planid: string, stepid: string): exchangeevidence[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.exchange !== undefined).map(outcome => outcome.details?.exchange as exchangeevidence);
}

/** One event stream evidence record with its url, event name, observed count and last event id. */
export interface evententry {
  url: string;
  name: string;
  events: number;
  lasteventid?: string;
}

/** Records one server sent events observation in the plan progress outcome log with the event name, the observed count and the resume point. */
export function recordevent(progress: planprogress | undefined, planid: string, stepid: string, entry: evententry, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome: stepoutcome = { stepid, ok: true, summary: `The event stream of ${entry.url} observed ${entry.events} ${entry.name || "message"} event${entry.events === 1 ? "" : "s"}${entry.lasteventid !== undefined ? ` resuming from ${entry.lasteventid}` : ""}.`, details: { event: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded event stream observation of one step, oldest first. */
export function evententries(progress: planprogress | undefined, planid: string, stepid: string): evententry[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.event !== undefined).map(outcome => outcome.details?.event as evententry);
}

/** One long poll iteration evidence record with its poll number, cursor value and stop state. */
export interface pollentry {
  poll: number;
  cursor?: string;
  status: number;
  stopped: boolean;
  reason: string;
}

/** Records one long poll iteration in the plan progress outcome log with its cursor value, status and stop reason. */
export function recordpoll(progress: planprogress | undefined, planid: string, stepid: string, entry: pollentry, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome: stepoutcome = { stepid, ok: true, summary: `Long poll ${entry.poll} returned the ${entry.status} status${entry.cursor !== undefined ? ` at cursor ${entry.cursor}` : ""} and ${entry.stopped ? `stopped: ${entry.reason}` : "continues"}.`, details: { poll: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded long poll iteration of one step, oldest first. */
export function pollentries(progress: planprogress | undefined, planid: string, stepid: string): pollentry[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.poll !== undefined).map(outcome => outcome.details?.poll as pollentry);
}

/** One traffic control evidence record of the run: the rule counts applied, blocked and mocked with the hits of the active rules. */
export interface controlevidence {
  applied: number;
  blocked: number;
  mocked: number;
  reverts: number;
  reason: string;
}

/** Records one traffic control state change in the plan progress outcome log with the applied, blocked and mocked rule counts. */
export function recordcontrol(progress: planprogress | undefined, planid: string, stepid: string, entry: controlevidence, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome: stepoutcome = { stepid, ok: true, summary: `${entry.reason}: ${entry.applied} applied rule${entry.applied === 1 ? "" : "s"}, ${entry.blocked} blocked request${entry.blocked === 1 ? "" : "s"}, ${entry.mocked} mocked response${entry.mocked === 1 ? "" : "s"} and ${entry.reverts} reverted rule${entry.reverts === 1 ? "" : "s"}.`, details: { control: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded traffic control evidence of one step, oldest first. */
export function controlentries(progress: planprogress | undefined, planid: string, stepid: string): controlevidence[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.control !== undefined).map(outcome => outcome.details?.control as controlevidence);
}

/** One multipart upload progress record with its chunk count, uploaded bytes and total byte size. */
export interface uploadentry {
  chunk: number;
  chunks: number;
  uploaded: number;
  bytes: number;
}

/** Records one multipart upload progress note in the plan progress outcome log with the uploaded chunk and byte counts. */
export function recordupload(progress: planprogress | undefined, planid: string, stepid: string, entry: uploadentry, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome: stepoutcome = { stepid, ok: true, summary: `The multipart upload moved chunk ${entry.chunk} of ${entry.chunks} with ${entry.uploaded} of ${entry.bytes} bytes sent.`, details: { upload: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded multipart upload progress note of one step, oldest first. */
export function uploadentries(progress: planprogress | undefined, planid: string, stepid: string): uploadentry[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.upload !== undefined).map(outcome => outcome.details?.upload as uploadentry);
}

/** One run timeline evidence record of a debugging step: the entry, error, rejection and long task counts with the spam collapse count. */
export interface timelineevidence {
  entries: number;
  collapsed: number;
  errors: number;
  rejections: number;
  longtasks: number;
}

/** Records one run timeline capture in the plan progress outcome log with the entry, error, rejection and long task counts of the watched window. */
export function recordtimeline(progress: planprogress | undefined, planid: string, stepid: string, entry: timelineevidence, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome: stepoutcome = { stepid, ok: true, summary: `Captured ${entry.entries} timeline entr${entry.entries === 1 ? "y" : "ies"} with ${entry.collapsed} collapsed repeat${entry.collapsed === 1 ? "" : "s"}, ${entry.errors} error${entry.errors === 1 ? "" : "s"}, ${entry.rejections} rejection${entry.rejections === 1 ? "" : "s"} and ${entry.longtasks} long task${entry.longtasks === 1 ? "" : "s"}.`, details: { timeline: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded run timeline capture of one step, oldest first. */
export function timelineevidences(progress: planprogress | undefined, planid: string, stepid: string): timelineevidence[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.timeline !== undefined).map(outcome => outcome.details?.timeline as timelineevidence);
}

/** One devtools protocol evidence record of a debugging part two step: the family, the method or domain, the duration, the error class, the matched event or hit counts and the captured frame count. */
export interface cdpevidence {
  family: "attach" | "detach" | "command" | "watch" | "breakpoint" | "step" | "pause" | "override";
  method?: string;
  domain?: string;
  duration?: number;
  errorclass?: string;
  events?: number;
  hits?: number;
  frames?: number;
  domains?: number;
}

/** Records one devtools protocol evidence in the plan progress outcome log with the family, the method or domain, the duration and the error class of the step. */
export function recordcdp(progress: planprogress | undefined, planid: string, stepid: string, entry: cdpevidence, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const summary = entry.family === "command"
    ? `The reviewed ${entry.method ?? "raw"} command of the ${entry.domain ?? "unknown"} domain returned in ${entry.duration ?? 0} millisecond${(entry.duration ?? 0) === 1 ? "" : "s"}${entry.errorclass !== undefined ? ` with the ${entry.errorclass} error class` : ""}.`
    : `The devtools ${entry.family} step ran${entry.domain !== undefined ? ` on the ${entry.domain} domain` : ""}${entry.events !== undefined ? ` and matched ${entry.events} event${entry.events === 1 ? "" : "s"}` : ""}${entry.hits !== undefined ? ` with ${entry.hits} hit${entry.hits === 1 ? "" : "s"}` : ""}${entry.frames !== undefined ? ` capturing ${entry.frames} call frame${entry.frames === 1 ? "" : "s"}` : ""}.`;
  const outcome: stepoutcome = { stepid, ok: entry.errorclass === undefined, summary, details: { cdp: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded devtools protocol evidence of one step, oldest first. */
export function cdpevidences(progress: planprogress | undefined, planid: string, stepid: string): cdpevidence[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.cdp !== undefined).map(outcome => outcome.details?.cdp as cdpevidence);
}

/** One profiling evidence record of a debugging part three step: the instrument family, the metric, sample, node and event counts, the byte size, the flagged step count and the record ids of the heavy artifacts. */
export interface profileevidence {
  family: "flow" | "heap" | "memory" | "cpu" | "shift" | "trace" | "annotate" | "replay" | "sourcemap";
  metrics?: number;
  samples?: number;
  nodes?: number;
  events?: number;
  bytes?: number;
  flagged?: number;
  recordids?: string[];
}

/** Records one profiling evidence in the plan progress outcome log with the instrument family, the counts of the capture and the record ids of the heavy artifacts. */
export function recordprofile(progress: planprogress | undefined, planid: string, stepid: string, entry: profileevidence, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const counts = `${entry.metrics !== undefined ? `${entry.metrics} metric${entry.metrics === 1 ? "" : "s"}, ` : ""}${entry.samples !== undefined ? `${entry.samples} sample${entry.samples === 1 ? "" : "s"}, ` : ""}${entry.nodes !== undefined ? `${entry.nodes} node${entry.nodes === 1 ? "" : "s"}, ` : ""}${entry.events !== undefined ? `${entry.events} event${entry.events === 1 ? "" : "s"}, ` : ""}${entry.bytes !== undefined ? `${entry.bytes} byte${entry.bytes === 1 ? "" : "s"}, ` : ""}${entry.flagged !== undefined ? `${entry.flagged} flagged step${entry.flagged === 1 ? "" : "s"}, ` : ""}`.replace(/, $/, "");
  const outcome: stepoutcome = { stepid, ok: true, summary: `The profiling ${entry.family} capture ran${counts.length > 0 ? ` with ${counts}` : ""}.`, details: { profile: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded profiling evidence of one step, oldest first. */
export function profileevidences(progress: planprogress | undefined, planid: string, stepid: string): profileevidence[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.profile !== undefined).map(outcome => outcome.details?.profile as profileevidence);
}

/** One emulation evidence record of a run: the applied and reverted layer names of the step with the reason the state changed. */
export interface emulationevidence {
  applied: string[];
  reverted: string[];
  reason: string;
}

/** Records one emulation state change in the plan progress outcome log with the applied and reverted layer names of the step. */
export function recordemulation(progress: planprogress | undefined, planid: string, stepid: string, entry: emulationevidence, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome: stepoutcome = { stepid, ok: true, summary: `${entry.reason}: ${entry.applied.length} applied layer${entry.applied.length === 1 ? "" : "s"}${entry.applied.length > 0 ? ` (${entry.applied.join(", ")})` : ""} and ${entry.reverted.length} reverted layer${entry.reverted.length === 1 ? "" : "s"}${entry.reverted.length > 0 ? ` (${entry.reverted.join(", ")})` : ""}.`, details: { emulation: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded emulation evidence of one step, oldest first. */
export function emulationevidences(progress: planprogress | undefined, planid: string, stepid: string): emulationevidence[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.emulation !== undefined).map(outcome => outcome.details?.emulation as emulationevidence);
}

/** One session memory evidence record of a run: the family, the reviewed detail and the counts of the checkpoint, capture, restore, filing, diff, search, export or import. */
export interface sessionevidence {
  family: "persist" | "capture" | "restore" | "name" | "diff" | "search" | "export" | "import" | "crash" | "auto";
  detail: string;
  recordid?: string;
  sections?: number;
  matches?: number;
  restored?: number;
  skipped?: number;
  cursor?: number;
  bytes?: number;
}

/** Records one session memory evidence in the plan progress outcome log with the family, the reviewed detail and the counts of the step. */
export function recordsession(progress: planprogress | undefined, planid: string, stepid: string, entry: sessionevidence, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const counts = `${entry.sections !== undefined ? `${entry.sections} section${entry.sections === 1 ? "" : "s"}, ` : ""}${entry.matches !== undefined ? `${entry.matches} match${entry.matches === 1 ? "" : "es"}, ` : ""}${entry.restored !== undefined ? `${entry.restored} restored tab${entry.restored === 1 ? "" : "s"}, ` : ""}${entry.skipped !== undefined ? `${entry.skipped} skipped origin${entry.skipped === 1 ? "" : "s"}, ` : ""}${entry.cursor !== undefined ? `cursor ${entry.cursor}, ` : ""}${entry.bytes !== undefined ? `${entry.bytes} byte${entry.bytes === 1 ? "" : "s"}, ` : ""}`.replace(/, $/, "");
  const outcome: stepoutcome = { stepid, ok: true, summary: `${entry.detail}${counts.length > 0 ? ` with ${counts}` : ""}.`, details: { session: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded session memory evidence of one step, oldest first. */
export function sessionevidences(progress: planprogress | undefined, planid: string, stepid: string): sessionevidence[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.session !== undefined).map(outcome => outcome.details?.session as sessionevidence);
}

/** One workflow evidence entry of the plan progress outcome log: the family, the reviewed detail, the run id, the executed and refused step counts over the total, and the loop iterations over the user defined denominator of control flow steps. */
export interface workflowevidence {
  family: "compose" | "template" | "run" | "dryrun" | "delay" | "wait" | "compute" | "extract" | "pause" | "resume" | "cancel" | "checkpoint" | "control";
  detail: string;
  runid?: string;
  executed?: number;
  total?: number;
  refused?: number;
  iterations?: number;
  denominator?: number;
}

/** Records one workflow evidence in the plan progress outcome log with the family, the reviewed detail, the executed, refused and total step counts and the loop iterations over the user defined denominator. */
export function recordworkflow(progress: planprogress | undefined, planid: string, stepid: string, entry: workflowevidence, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const counts = `${entry.executed !== undefined ? `${entry.executed} executed step${entry.executed === 1 ? "" : "s"}, ` : ""}${entry.refused !== undefined ? `${entry.refused} refused step${entry.refused === 1 ? "" : "s"}, ` : ""}${entry.total !== undefined ? `${entry.total} total step${entry.total === 1 ? "" : "s"}, ` : ""}${entry.iterations !== undefined ? `${entry.iterations} iteration${entry.iterations === 1 ? "" : "s"}, ` : ""}${entry.denominator !== undefined ? `denominator ${entry.denominator}, ` : ""}`.replace(/, $/, "");
  const outcome: stepoutcome = { stepid, ok: true, summary: `${entry.detail}${counts.length > 0 ? ` with ${counts}` : ""}.`, details: { workflow: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded workflow evidence of one step, oldest first. */
export function workflowevidences(progress: planprogress | undefined, planid: string, stepid: string): workflowevidence[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.workflow !== undefined).map(outcome => outcome.details?.workflow as workflowevidence);
}

/** Tracks workflow completion as executed steps over total steps; an empty workflow completes nothing. */
export function workflowshare(executed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, executed / total));
}

/** Tracks loop completion as executed iterations over the user defined denominator; a zero denominator completes nothing and no code ceiling applies to the denominator. */
export function loopshare(iterations: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.min(1, Math.max(0, iterations / denominator));
}

/** One trigger evidence entry of the plan progress outcome log: the family, the reviewed detail, the rule id, the fire, launch and suppression counts, the queued fire count and the next scheduled fire time. */
export interface triggerevidence {
  family: "arm" | "fire" | "suppress" | "queue" | "drain" | "toggle" | "manual";
  detail: string;
  ruleid?: string;
  fires?: number;
  launches?: number;
  suppressions?: number;
  queued?: number;
  nextfireat?: number;
}

/** Records one trigger evidence in the plan progress outcome log with the family, the reviewed detail, the rule counters, the queued fire count and the next scheduled fire time. */
export function recordtrigger(progress: planprogress | undefined, planid: string, stepid: string, entry: triggerevidence, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const counts = `${entry.fires !== undefined ? `${entry.fires} fire${entry.fires === 1 ? "" : "s"}, ` : ""}${entry.launches !== undefined ? `${entry.launches} launch${entry.launches === 1 ? "" : "es"}, ` : ""}${entry.suppressions !== undefined ? `${entry.suppressions} suppression${entry.suppressions === 1 ? "" : "s"}, ` : ""}${entry.queued !== undefined ? `${entry.queued} queued fire${entry.queued === 1 ? "" : "s"}, ` : ""}`.replace(/, $/, "");
  const outcome: stepoutcome = { stepid, ok: true, summary: `${entry.detail}${counts.length > 0 ? ` with ${counts}` : ""}.`, details: { trigger: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded trigger evidence of one step, oldest first. */
export function triggerevidences(progress: planprogress | undefined, planid: string, stepid: string): triggerevidence[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.trigger !== undefined).map(outcome => outcome.details?.trigger as triggerevidence);
}

/** One agent protocol tool call evidence entry of the plan progress outcome log: the client that called, the namespaced tool, the outcome flag and the refusal code when the consent gates refused. */
export interface toolevidence {
  clientid: string;
  tool: string;
  ok: boolean;
  code?: string;
}

/** Records one agent protocol tool call evidence in the plan progress outcome log with the calling client, the namespaced tool and the outcome. */
export function recordtoolcall(progress: planprogress | undefined, planid: string, stepid: string, entry: toolevidence, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome: stepoutcome = { stepid, ok: entry.ok, summary: `The ${entry.tool} tool call of the client ${entry.clientid} ${entry.ok ? "ran behind the consent gates" : `was refused${entry.code !== undefined ? ` with the ${entry.code} error` : ""}`}.`, details: { tool: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded agent protocol tool call evidence of one step, oldest first. */
export function toolcallevidences(progress: planprogress | undefined, planid: string, stepid: string): toolevidence[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.tool !== undefined).map(outcome => outcome.details?.tool as toolevidence);
}

/** One denied step evidence of the plan progress outcome log: the origin, the action kind and the deny reason in plain language, recorded without navigation. */
export interface deniedstepevidence {
  origin: string;
  kind: string;
  reason: string;
}

/** Records one denied step in the plan progress outcome log: the origin, the kind and the deny reason stay as evidence while no navigation or dispatch happened. */
export function recorddenied(progress: planprogress | undefined, planid: string, stepid: string, entry: deniedstepevidence, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome: stepoutcome = { stepid, ok: false, summary: `The ${entry.kind} step on ${entry.origin} was denied: ${entry.reason}`, details: { denied: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded denied step evidence of one step, oldest first. */
export function deniedevidences(progress: planprogress | undefined, planid: string, stepid: string): deniedstepevidence[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.denied !== undefined).map(outcome => outcome.details?.denied as deniedstepevidence);
}

/** One revocation evidence of the plan progress outcome log: the halted steps, the revoked step the run stopped at and the reason. */
export interface revokedrunevidence {
  haltedstepids: string[];
  revokedstepid?: string;
  reason: string;
}

/** Records one revoked run in the plan progress outcome log: the run halts at the revoked step with the halted queue named as evidence. */
export function recordrevocation(progress: planprogress | undefined, planid: string, stepid: string, entry: revokedrunevidence, now: number): planprogress {
  const base = progress && progress.planid === planid ? progress : emptyprogress(planid, now);
  const outcome: stepoutcome = { stepid, ok: false, summary: `The run halted at the step ${stepid}${entry.haltedstepids.length > 1 ? ` with ${entry.haltedstepids.length - 1} queued step${entry.haltedstepids.length === 2 ? "" : "s"} rolled back` : ""}: ${entry.reason}`, details: { revoked: entry }, at: now };
  return recordoutcome(base, planid, outcome, now);
}

/** Returns every recorded revocation evidence of one step, oldest first. */
export function revocationevidences(progress: planprogress | undefined, planid: string, stepid: string): revokedrunevidence[] {
  if (!progress || progress.planid !== planid) return [];
  return (progress.outcomes ?? []).filter(outcome => outcome.stepid === stepid && outcome.details?.revoked !== undefined).map(outcome => outcome.details?.revoked as revokedrunevidence);
}

/* ── The progress replay path of the 2.0.0 release candidate provenance family: the runreplay walks sealed verified chains while the progress replay derives the ordered step stamps of a recorded run, and every replay record carries the release candidate provenance stamp so the audit trail answers which release produced each entry. ── */

/** One progress replay entry: the ordered step stamp the replay walks with its outcome flag, its summary, its time and its release candidate provenance stamp. */
export interface progressreplayentry {
  index: number;
  stepid: string;
  ok: boolean;
  summary: string;
  at: number;
  /** The release candidate provenance stamp of the outcome this entry replays, so a replayed view answers which release produced the entry. */
  provenance?: { release: string; protocolmajor: number };
}

/** Replays the progress record of one plan for the runreplay family: one ordered replay entry per recorded outcome, read only — a progress replay never re-executes anything, it walks the recorded step stamps with their provenance beside the record level stamp of the run. */
export function replayprogress(progress: planprogress | undefined, planid: string): { planid: string; entries: progressreplayentry[]; provenance?: { release: string; protocolmajor: number } } {
  if (!progress || progress.planid !== planid) return { planid, entries: [] };
  const entries = (progress.outcomes ?? []).map((outcome, index) => ({ index, stepid: outcome.stepid, ok: outcome.ok, summary: outcome.summary, at: outcome.at, ...(outcome.provenance !== undefined ? { provenance: outcome.provenance } : {}) }));
  return { planid, entries, ...(progress.provenance !== undefined ? { provenance: progress.provenance } : {}) };
}
