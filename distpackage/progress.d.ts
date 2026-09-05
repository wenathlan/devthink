import type { agentplan, clockadapter, environmentkind, gatewaitevidence, perfrecord, planprogress, shotpair, shotrecord, snapshotchange, stepoutcome, wizardstate } from "./types.js";
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
export declare function provenancestampof(): provenancestamp;
/** Reads the current timestamp through the clock adapter the runtime injected: the progress module owns no clock, so the running bundle decides what now means. Example: `progressnow(clock)` answers the adapter timestamp. */
export declare function progressnow(clock: clockadapter): number;
/** Records one step outcome through the clock adapter: the completion stamp and the outcome append in one pass, so a caller drives the progress model with the injected clock alone. Example: `recordoutcomewithclock(progress, planid, outcome, clock)` stamps the adapter timestamp. */
export declare function recordoutcomewithclock(progress: planprogress | undefined, planid: string, outcome: stepoutcome, clock: clockadapter): planprogress;
/** Returns a fresh progress record for a plan that has not executed any step yet; the record carries the release candidate provenance stamp of the build that created it. */
export declare function emptyprogress(planid: string, now: number): planprogress;
/** Records one successfully executed step; repeated executions of the same step stay deduplicated, and a fresh record carries the release candidate provenance stamp of the build that wrote it. */
export declare function recordstep(progress: planprogress | undefined, planid: string, stepid: string, now: number): planprogress;
/** Records one structured step outcome beside the completion log; outcomes are never truncated and every outcome gains the release candidate provenance stamp of the build that recorded it. */
export declare function recordoutcome(progress: planprogress | undefined, planid: string, outcome: stepoutcome, now: number): planprogress;
/** Records the execution environment of one completed step so the evidence trail reads where every step ran; repeated records of one step keep the latest environment. */
export declare function recordenvironment(progress: planprogress | undefined, planid: string, stepid: string, environment: environmentkind, now: number): planprogress;
/** Reads the recorded execution environment of one step of the tracked plan. */
export declare function environmentof(progress: planprogress | undefined, planid: string, stepid: string): environmentkind | undefined;
/** Records the worker turnaround of one offloaded step in milliseconds for later profiling; repeated records of one step keep the latest turnaround. */
export declare function recordturnaround(progress: planprogress | undefined, planid: string, stepid: string, milliseconds: number, now: number): planprogress;
/** Reads the recorded worker turnaround of one step of the tracked plan, in milliseconds. */
export declare function turnaroundof(progress: planprogress | undefined, planid: string, stepid: string): number | undefined;
/** Records the gate wait of one gated step beside its step durations: the confirm gate the step waited at with its waited milliseconds; repeated records of one step keep the latest wait. */
export declare function recordgatewait(progress: planprogress | undefined, planid: string, stepid: string, entry: gatewaitevidence, now: number): planprogress;
/** Reads the recorded gate wait of one step of the tracked plan. */
export declare function gatewaitof(progress: planprogress | undefined, planid: string, stepid: string): gatewaitevidence | undefined;
/** Records the perf data of one executed step beside its outcome: the duration, the query count, the cache hits and the delta flag the step cost; repeated records of one step keep the latest measurement. */
export declare function recordperf(progress: planprogress | undefined, planid: string, stepid: string, record: perfrecord, now: number): planprogress;
/** Reads the recorded perf record of one step of the tracked plan: the duration, the query count and the cache hits beside the delta flag. */
export declare function perfof(progress: planprogress | undefined, planid: string, stepid: string): perfrecord | undefined;
/** Records the snapshot change set of one executed step in the incrsnapshot change format, so progress deltas reuse the exact change format the snapshot builder emits; repeated records of one step keep the latest change set. */
export declare function recorddeltas(progress: planprogress | undefined, planid: string, stepid: string, changes: snapshotchange[], now: number): planprogress;
/** Reads the recorded snapshot change set of one step of the tracked plan, in the incrsnapshot change format. */
export declare function deltasof(progress: planprogress | undefined, planid: string, stepid: string): snapshotchange[];
/** True only when every step of the plan has a recorded, successful execution. */
export declare function iscomplete(progress: planprogress | undefined, plan: agentplan): boolean;
/** Clears progress whenever a different plan replaces the tracked one while preserving prior history snapshots; the fresh record carries the release candidate provenance stamp of the build that reset it. */
export declare function resetforplan(progress: planprogress | undefined, plan: agentplan, now: number): planprogress;
/** True when a reviewed watch lifetime window has closed at the given time. */
export declare function watchclosed(startedat: number, lifetime: number, now: number): boolean;
/** Records one watch step as completed only once its reviewed lifetime window has closed. */
export declare function recordwatchcompletion(progress: planprogress | undefined, planid: string, stepid: string, startedat: number, lifetime: number, now: number): planprogress;
/** One navlist entry completion record with its index, url and outcome. */
export interface naventry {
    index: number;
    url: string;
    ok: boolean;
}
/** Records one navlist entry as it completes, beside the step outcome log, so the trail shows current url and remaining count. */
export declare function recordnaventry(progress: planprogress | undefined, planid: string, stepid: string, entry: naventry, now: number): planprogress;
/** Returns every recorded navlist entry completion of one step, oldest first. */
export declare function naventries(progress: planprogress | undefined, planid: string, stepid: string): naventry[];
/** Assigns one tab to the running task so progress tracks work across its tabs. */
export declare function assigntasktab(progress: planprogress | undefined, planid: string, tabid: number, now: number): planprogress;
/** Releases one task tab when its work inside the running task ends. */
export declare function releasetasktab(progress: planprogress | undefined, planid: string, tabid: number, now: number): planprogress;
/** Returns the tabs assigned to the running task, in assignment order. */
export declare function tasktabs(progress: planprogress | undefined, planid: string): number[];
/** Returns the wizard completion share as executed steps over the total steps. */
export declare function wizardcompletion(state: wizardstate): number;
/** Returns the extraction progress share as rows collected over the user estimated total; an absent estimate stays at zero. */
export declare function extractionshare(rowscollected: number, estimatedtotal: number): number;
/** One extraction page completion record with its page number, row count and cursor. */
export interface extractionentry {
    page: number;
    rows: number;
    cursor: number;
}
/** Records one extracted page in the plan progress outcome log with its page count, row count and resume cursor. */
export declare function recordextraction(progress: planprogress | undefined, planid: string, stepid: string, entry: extractionentry, now: number): planprogress;
/** Returns every recorded extraction page completion of one step, oldest first. */
export declare function extractionentries(progress: planprogress | undefined, planid: string, stepid: string): extractionentry[];
/** Records one wizard step completion into the plan progress outcome log, beside the step log, with the step index and total steps. */
export declare function recordwizardstep(progress: planprogress | undefined, planid: string, stepid: string, state: wizardstate, now: number): planprogress;
/** Returns the batch download progress share as files completed over the total files of the batch. */
export declare function downloadshare(completed: number, total: number): number;
/** One batch download file completion record with its index, url and resulting state. */
export interface downloadentry {
    index: number;
    url: string;
    state: string;
}
/** Records one batch download file completion in the plan progress outcome log so the queue shows live per file states. */
export declare function recorddownload(progress: planprogress | undefined, planid: string, stepid: string, entry: downloadentry, now: number): planprogress;
/** Returns every recorded batch download file completion of one step, oldest first. */
export declare function downloadentries(progress: planprogress | undefined, planid: string, stepid: string): downloadentry[];
/** Records one capture completion in the plan progress outcome log with the record id, format and byte size as reviewable evidence. */
export declare function recordcapture(progress: planprogress | undefined, planid: string, stepid: string, capture: shotrecord, now: number): planprogress;
/** Records one before and after shotpair of a wrapped action in the plan progress outcome log with both shot ids and the dom snapshot id. */
export declare function recordpair(progress: planprogress | undefined, planid: string, stepid: string, pair: shotpair, now: number): planprogress;
/** Returns every recorded capture completion of one step, oldest first. */
export declare function captureentries(progress: planprogress | undefined, planid: string, stepid: string): Array<{
    id: string;
    kind: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
}>;
/** Returns every recorded shotpair of one step, oldest first. */
export declare function pairentries(progress: planprogress | undefined, planid: string, stepid: string): Array<{
    id: string;
    beforeid: string;
    afterid: string;
    actionkind: string;
}>;
/** Records one media capture completion in the plan progress outcome log with the record id, kind, scope and byte size as reviewable evidence. */
export declare function recordmedia(progress: planprogress | undefined, planid: string, stepid: string, media: {
    id: string;
    kind: string;
    scope: string;
    bytes: number;
}, now: number): planprogress;
/** Returns every recorded media capture completion of one step, oldest first. */
export declare function mediaentries(progress: planprogress | undefined, planid: string, stepid: string): Array<{
    id: string;
    kind: string;
    scope: string;
    bytes: number;
}>;
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
export declare function recordcall(progress: planprogress | undefined, planid: string, stepid: string, entry: callentry, now: number): planprogress;
/** Returns every recorded outbound call completion of one step, oldest first. */
export declare function callentries(progress: planprogress | undefined, planid: string, stepid: string): callentry[];
/** One fetch retry progress record with its attempt number, url and backoff wait. */
export interface fetchretryentry {
    attempt: number;
    url: string;
    wait: number;
    reason: string;
}
/** Records one fetch retry in the plan progress outcome log so the sidepanel reports fetch progress on each retry. */
export declare function recordfetchretry(progress: planprogress | undefined, planid: string, stepid: string, retry: fetchretryentry, now: number): planprogress;
/** Returns every recorded fetch retry of one step, oldest first. */
export declare function fetchretryentries(progress: planprogress | undefined, planid: string, stepid: string): fetchretryentry[];
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
export declare function recordchannel(progress: planprogress | undefined, planid: string, stepid: string, entry: channelentry, now: number): planprogress;
/** Returns every recorded channel lifecycle transition of one step, oldest first. */
export declare function channelentries(progress: planprogress | undefined, planid: string, stepid: string): channelentry[];
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
export declare function recordexchange(progress: planprogress | undefined, planid: string, stepid: string, entry: exchangeevidence, now: number): planprogress;
/** Returns every recorded exchange evidence of one step, oldest first. */
export declare function exchangeentries(progress: planprogress | undefined, planid: string, stepid: string): exchangeevidence[];
/** One event stream evidence record with its url, event name, observed count and last event id. */
export interface evententry {
    url: string;
    name: string;
    events: number;
    lasteventid?: string;
}
/** Records one server sent events observation in the plan progress outcome log with the event name, the observed count and the resume point. */
export declare function recordevent(progress: planprogress | undefined, planid: string, stepid: string, entry: evententry, now: number): planprogress;
/** Returns every recorded event stream observation of one step, oldest first. */
export declare function evententries(progress: planprogress | undefined, planid: string, stepid: string): evententry[];
/** One long poll iteration evidence record with its poll number, cursor value and stop state. */
export interface pollentry {
    poll: number;
    cursor?: string;
    status: number;
    stopped: boolean;
    reason: string;
}
/** Records one long poll iteration in the plan progress outcome log with its cursor value, status and stop reason. */
export declare function recordpoll(progress: planprogress | undefined, planid: string, stepid: string, entry: pollentry, now: number): planprogress;
/** Returns every recorded long poll iteration of one step, oldest first. */
export declare function pollentries(progress: planprogress | undefined, planid: string, stepid: string): pollentry[];
/** One traffic control evidence record of the run: the rule counts applied, blocked and mocked with the hits of the active rules. */
export interface controlevidence {
    applied: number;
    blocked: number;
    mocked: number;
    reverts: number;
    reason: string;
}
/** Records one traffic control state change in the plan progress outcome log with the applied, blocked and mocked rule counts. */
export declare function recordcontrol(progress: planprogress | undefined, planid: string, stepid: string, entry: controlevidence, now: number): planprogress;
/** Returns every recorded traffic control evidence of one step, oldest first. */
export declare function controlentries(progress: planprogress | undefined, planid: string, stepid: string): controlevidence[];
/** One multipart upload progress record with its chunk count, uploaded bytes and total byte size. */
export interface uploadentry {
    chunk: number;
    chunks: number;
    uploaded: number;
    bytes: number;
}
/** Records one multipart upload progress note in the plan progress outcome log with the uploaded chunk and byte counts. */
export declare function recordupload(progress: planprogress | undefined, planid: string, stepid: string, entry: uploadentry, now: number): planprogress;
/** Returns every recorded multipart upload progress note of one step, oldest first. */
export declare function uploadentries(progress: planprogress | undefined, planid: string, stepid: string): uploadentry[];
/** One run timeline evidence record of a debugging step: the entry, error, rejection and long task counts with the spam collapse count. */
export interface timelineevidence {
    entries: number;
    collapsed: number;
    errors: number;
    rejections: number;
    longtasks: number;
}
/** Records one run timeline capture in the plan progress outcome log with the entry, error, rejection and long task counts of the watched window. */
export declare function recordtimeline(progress: planprogress | undefined, planid: string, stepid: string, entry: timelineevidence, now: number): planprogress;
/** Returns every recorded run timeline capture of one step, oldest first. */
export declare function timelineevidences(progress: planprogress | undefined, planid: string, stepid: string): timelineevidence[];
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
export declare function recordcdp(progress: planprogress | undefined, planid: string, stepid: string, entry: cdpevidence, now: number): planprogress;
/** Returns every recorded devtools protocol evidence of one step, oldest first. */
export declare function cdpevidences(progress: planprogress | undefined, planid: string, stepid: string): cdpevidence[];
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
export declare function recordprofile(progress: planprogress | undefined, planid: string, stepid: string, entry: profileevidence, now: number): planprogress;
/** Returns every recorded profiling evidence of one step, oldest first. */
export declare function profileevidences(progress: planprogress | undefined, planid: string, stepid: string): profileevidence[];
/** One emulation evidence record of a run: the applied and reverted layer names of the step with the reason the state changed. */
export interface emulationevidence {
    applied: string[];
    reverted: string[];
    reason: string;
}
/** Records one emulation state change in the plan progress outcome log with the applied and reverted layer names of the step. */
export declare function recordemulation(progress: planprogress | undefined, planid: string, stepid: string, entry: emulationevidence, now: number): planprogress;
/** Returns every recorded emulation evidence of one step, oldest first. */
export declare function emulationevidences(progress: planprogress | undefined, planid: string, stepid: string): emulationevidence[];
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
export declare function recordsession(progress: planprogress | undefined, planid: string, stepid: string, entry: sessionevidence, now: number): planprogress;
/** Returns every recorded session memory evidence of one step, oldest first. */
export declare function sessionevidences(progress: planprogress | undefined, planid: string, stepid: string): sessionevidence[];
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
export declare function recordworkflow(progress: planprogress | undefined, planid: string, stepid: string, entry: workflowevidence, now: number): planprogress;
/** Returns every recorded workflow evidence of one step, oldest first. */
export declare function workflowevidences(progress: planprogress | undefined, planid: string, stepid: string): workflowevidence[];
/** Tracks workflow completion as executed steps over total steps; an empty workflow completes nothing. */
export declare function workflowshare(executed: number, total: number): number;
/** Tracks loop completion as executed iterations over the user defined denominator; a zero denominator completes nothing and no code ceiling applies to the denominator. */
export declare function loopshare(iterations: number, denominator: number): number;
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
export declare function recordtrigger(progress: planprogress | undefined, planid: string, stepid: string, entry: triggerevidence, now: number): planprogress;
/** Returns every recorded trigger evidence of one step, oldest first. */
export declare function triggerevidences(progress: planprogress | undefined, planid: string, stepid: string): triggerevidence[];
/** One agent protocol tool call evidence entry of the plan progress outcome log: the client that called, the namespaced tool, the outcome flag and the refusal code when the consent gates refused. */
export interface toolevidence {
    clientid: string;
    tool: string;
    ok: boolean;
    code?: string;
}
/** Records one agent protocol tool call evidence in the plan progress outcome log with the calling client, the namespaced tool and the outcome. */
export declare function recordtoolcall(progress: planprogress | undefined, planid: string, stepid: string, entry: toolevidence, now: number): planprogress;
/** Returns every recorded agent protocol tool call evidence of one step, oldest first. */
export declare function toolcallevidences(progress: planprogress | undefined, planid: string, stepid: string): toolevidence[];
/** One denied step evidence of the plan progress outcome log: the origin, the action kind and the deny reason in plain language, recorded without navigation. */
export interface deniedstepevidence {
    origin: string;
    kind: string;
    reason: string;
}
/** Records one denied step in the plan progress outcome log: the origin, the kind and the deny reason stay as evidence while no navigation or dispatch happened. */
export declare function recorddenied(progress: planprogress | undefined, planid: string, stepid: string, entry: deniedstepevidence, now: number): planprogress;
/** Returns every recorded denied step evidence of one step, oldest first. */
export declare function deniedevidences(progress: planprogress | undefined, planid: string, stepid: string): deniedstepevidence[];
/** One revocation evidence of the plan progress outcome log: the halted steps, the revoked step the run stopped at and the reason. */
export interface revokedrunevidence {
    haltedstepids: string[];
    revokedstepid?: string;
    reason: string;
}
/** Records one revoked run in the plan progress outcome log: the run halts at the revoked step with the halted queue named as evidence. */
export declare function recordrevocation(progress: planprogress | undefined, planid: string, stepid: string, entry: revokedrunevidence, now: number): planprogress;
/** Returns every recorded revocation evidence of one step, oldest first. */
export declare function revocationevidences(progress: planprogress | undefined, planid: string, stepid: string): revokedrunevidence[];
/** One progress replay entry: the ordered step stamp the replay walks with its outcome flag, its summary, its time and its release candidate provenance stamp. */
export interface progressreplayentry {
    index: number;
    stepid: string;
    ok: boolean;
    summary: string;
    at: number;
    /** The release candidate provenance stamp of the outcome this entry replays, so a replayed view answers which release produced the entry. */
    provenance?: {
        release: string;
        protocolmajor: number;
    };
}
/** Replays the progress record of one plan for the runreplay family: one ordered replay entry per recorded outcome, read only — a progress replay never re-executes anything, it walks the recorded step stamps with their provenance beside the record level stamp of the run. */
export declare function replayprogress(progress: planprogress | undefined, planid: string): {
    planid: string;
    entries: progressreplayentry[];
    provenance?: {
        release: string;
        protocolmajor: number;
    };
};
//# sourceMappingURL=progress.d.ts.map