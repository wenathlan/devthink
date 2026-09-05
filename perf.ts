/**
 * The perf module of the 1.1.90 consolidation: every correlated variation of the hot path measurement and bounding logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the hot path family: perfrecords holds the perf record stream every meter writes into (the worker backpressure, the queue depth samples, the snapshot request dedupe, the capture plan schedule and the pruning of the record window); snapshotdelta fingerprints the snapshot regions so unchanged ones skip recomputation; dombatch coalesces the dom bursts into debounced batches with their query plans; stepmeter measures the steps (the durationmeter that writes its samples into the perf records, the selectorprofile with its failure rates, the steptrace spans, the startupmeter of the cold start and the slowmo replay); resourceaware bounds the same hot paths against the device (the tab suspend plan, the artifact compression, the log pruning and the battery aware network backoff); batchscheduling paces the queues with the domain lanes, the polite delay, the adaptive poll and the request coalescing under backpressure; and lazyload keeps the heavy modules out of the first paint path inside the user startup budget.
 * No window, budget, factor or threshold is ever hardcoded: every bound stays the user's choice with no engine cap, and the meters measure and never refuse.
 */

/* ── Merged from perfrecords.ts ── */
import type { perfrecord, queuedepthsample, incrsnapshotdelta, snapshotchange, batchqueryplan, debouncedbatch, debounceprofile, durationsample, selectorstats, slowmosession, startupsample, steptracespan, artifactcompressrecord, batteryawarestate, logprunerule, networkretryrule, tabsuspendstate, adaptivepollwindow, backpressuresignal, cadencecontrol, coalescedrequest, domainlane, lazyloadrecord, lazymoddescriptor, startupbudget } from "./types.js";
import { randomid } from "./memory.js";

/**
 * Perfrecords logic of the 1.1.68 family.
 * Every step records its perf data beside its outcome: the duration, the query count, the cache hits and the delta flag with the provenance attached, the worker queue gains backpressure that defers parse tasks past the user configured depth instead of refusing them, the queue depth records over time for tuning, and the run summary charts the step durations.
 * No budget ever refuses work: the deferral, the priority and the depth stay the user's choices, and the records stay advisory instruments of measurement.
 */

/** Records one perf record of an executed step: the duration, the query count and the cache hits the step cost beside the delta flag and the provenance every record attaches. */
export function perfrecordof(input: { runid: string; stepid: string; duration: number; queries: number; cachehits: number; delta: boolean; now: number; provenance?: { origin?: string; environment?: string; task?: string } }): perfrecord {
  if (input.runid.trim() === "") throw new Error("The perf record needs its run id.");
  if (input.stepid.trim() === "") throw new Error("The perf record needs its step id.");
  return { id: randomid(), runid: input.runid, stepid: input.stepid, duration: Math.max(input.duration, 0), queries: Math.max(input.queries, 0), cachehits: Math.max(input.cachehits, 0), delta: input.delta, at: input.now, provenance: input.provenance ?? {} };
}

/** Reads the backpressure verdict of one worker queue: parse tasks past the user configured depth defer and never refuse, and an absent depth keeps the queue unbounded. */
export function workerbackpressure(input: { depth: number; pending: number; configured?: number }): { deferred: number; admitted: number; unbounded: boolean } {
  if (input.configured === undefined) return { deferred: 0, admitted: input.pending, unbounded: true };
  const admitted = Math.min(input.pending, input.configured);
  return { deferred: Math.max(input.pending - input.configured, 0), admitted, unbounded: false };
}

/** Builds one worker queue depth sample for the tuning record: the pending parse count and the deferred count the backpressure held at one moment. */
export function queuedepthsampleof(input: { depth: number; deferred: number; now: number }): queuedepthsample {
  return { at: input.now, depth: Math.max(input.depth, 0), deferred: Math.max(input.deferred, 0) };
}

/** Reads the tuning view of the recorded queue depth samples: the peak depth, the deferred total and the span the samples cover. */
export function queuedepthview(samples: queuedepthsample[]): { peak: number; deferred: number; samples: number } {
  return { peak: samples.reduce((peak, sample) => Math.max(peak, sample.depth), 0), deferred: samples.reduce((sum, sample) => sum + sample.deferred, 0), samples: samples.length };
}

/** Builds the snapshot request key of one run so the executor deduplicates identical snapshot requests within the run: the same run, base ref and fingerprint answer from the same recomputation. */
export function snapshotrequestkey(input: { runid: string; stepid: string; fingerprint: string }): string {
  return `${input.runid}:${input.stepid}:${input.fingerprint}`;
}

/** Deduplicates identical snapshot requests within one run: the first request computes and the repeats answer from the first result while the executor records the hit count. */
export function dedupesnapshotrequests(input: { runid: string; requests: Array<{ stepid: string; fingerprint: string }> }): { distinct: Array<{ stepid: string; fingerprint: string }>; duplicates: number } {
  const keys = new Set<string>();
  const distinct: Array<{ stepid: string; fingerprint: string }> = [];
  let duplicates = 0;
  for (const request of input.requests) {
    const key = snapshotrequestkey({ runid: input.runid, stepid: request.stepid, fingerprint: request.fingerprint });
    if (keys.has(key)) { duplicates += 1; continue; }
    keys.add(key);
    distinct.push(request);
  }
  return { distinct, duplicates };
}

/** Reads the capture schedule behind the user priority choice: speed defers the heavy capture work to the run end while evidence keeps every capture beside its step; the choice optimizes the order and never drops a capture. */
export function captureplanschedule(input: { priority?: "speed" | "evidence"; heavy: string[] }): { beside: string[]; deferred: string[]; note: string } {
  if (input.priority === "speed") return { beside: [], deferred: [...input.heavy], note: `The user speed priority defers ${input.heavy.length} heavy capture task${input.heavy.length === 1 ? "" : "s"} to the run end; every capture still runs inside the reviewed plan.` };
  return { beside: [...input.heavy], deferred: [], note: `The user evidence priority keeps ${input.heavy.length} heavy capture task${input.heavy.length === 1 ? "" : "s"} beside their steps.` };
}

/** Reads the abandoned parse task ids of one halted run so the executor cancels them: a task belongs to the halted run and never started inside the worker pool. */
export function abandonedparsetasks(input: { halted: boolean; runid: string; pending: Array<{ id: string; runid: string; started: boolean }> }): { cancelled: string[]; kept: string[] } {
  if (!input.halted) return { cancelled: [], kept: input.pending.map(task => task.id) };
  const cancelled = input.pending.filter(task => task.runid === input.runid && !task.started).map(task => task.id);
  const kept = input.pending.filter(task => !cancelled.includes(task.id)).map(task => task.id);
  return { cancelled, kept };
}

/** Builds the perf summary of one recent run the dashboardpage renders: the step count, the total and average duration, the query count and the cache hit ratio beside the delta share. */
export function perfsummary(records: perfrecord[]): { steps: number; duration: number; average: number; queries: number; cachehits: number; hitratio: number; deltashare: number } {
  if (records.length === 0) return { steps: 0, duration: 0, average: 0, queries: 0, cachehits: 0, hitratio: 0, deltashare: 0 };
  const duration = records.reduce((sum, record) => sum + record.duration, 0);
  const queries = records.reduce((sum, record) => sum + record.queries, 0);
  const cachehits = records.reduce((sum, record) => sum + record.cachehits, 0);
  const deltas = records.filter(record => record.delta).length;
  return { steps: records.length, duration, average: Math.round(duration / records.length), queries, cachehits, hitratio: queries === 0 ? 0 : cachehits / queries, deltashare: deltas / records.length };
}

/** Charts the step durations of one run over its steps: one point per step in execution order with the step id, the duration and the environment provenance. */
export function stepdurationchart(records: perfrecord[]): Array<{ stepid: string; duration: number; delta: boolean }> {
  return [...records].sort((left, right) => left.at - right.at).map(record => ({ stepid: record.stepid, duration: record.duration, delta: record.delta }));
}

/** Builds the perf audit bundle of one run: every record with its provenance beside the summary, exported as one bundle the user reads. */
export function perfbundle(input: { runid: string; records: perfrecord[] }): { runid: string; summary: ReturnType<typeof perfsummary>; records: perfrecord[] } {
  return { runid: input.runid, summary: perfsummary(input.records), records: [...input.records] };
}

/** Prunes the perf records past the user configured retention window; an absent window keeps every record while the audit bundle always rebuilds from the survivors. */
export function pruneperfrecords(records: perfrecord[], retention: number | undefined, now: number): { kept: perfrecord[]; pruned: number } {
  if (retention === undefined) return { kept: records, pruned: 0 };
  const kept = records.filter(record => now - record.at < retention);
  return { kept, pruned: records.length - kept.length };
}


/* ── Merged from snapshotdelta.ts ── */

/**
 * Snapshotdelta logic of the 1.1.68 family.
 * The snapshot builder computes deltas against the previous snapshot of the same run: every region keeps a stable fingerprint, the delta emits only the changed regions with their fingerprints, and the full snapshot returns on the user configured cadence while an empty delta lets the executor skip the recomputation in full.
 * The base snapshot ref must come from the same run: a delta against another run or against no base at all refuses, and the cadence stays the user's choice with no engine default.
 */

/** One region of a snapshot the delta engine compares: the region name and its content. */
export type snapshotregion = { region: string; content: string };

/** Stable local fingerprint of one region content so the delta engine recognizes unchanged regions without recomputation; the hash stays deterministic without a network dependency. */
export function regionfingerprint(region: string, content: string): string {
  let hash = 0x811c9dc5;
  const source = `${region}:${content}`;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/** Computes one incrsnapshot delta against the base snapshot of the same run: only the added, changed and removed regions enter the change set, and the full snapshot returns once the user configured cadence of deltas elapsed. */
export function snapshotdeltaof(input: { baseref: string; runid: string; base: snapshotregion[]; current: snapshotregion[]; deltasince?: number; cadence?: number; now: number }): incrsnapshotdelta {
  if (input.baseref.trim() === "") throw new Error("The incrsnapshot delta needs its base snapshot ref; a baseless delta recomputes nothing.");
  const basemap = new Map(input.base.map(region => [region.region, regionfingerprint(region.region, region.content)]));
  const changes: snapshotchange[] = [];
  for (const region of input.current) {
    const fingerprint = regionfingerprint(region.region, region.content);
    const basefingerprint = basemap.get(region.region);
    if (basefingerprint === undefined) changes.push({ region: region.region, fingerprint, kind: "added" });
    else if (basefingerprint !== fingerprint) changes.push({ region: region.region, fingerprint, kind: "changed" });
  }
  for (const [region, fingerprint] of basemap) {
    if (!input.current.some(candidate => candidate.region === region)) changes.push({ region, fingerprint, kind: "removed" });
  }
  const full = input.cadence !== undefined && (input.deltasince ?? 0) >= input.cadence;
  const fingerprint = changes.length === 0 ? "empty" : changes.map(change => `${change.region}:${change.fingerprint}`).join("|");
  return { baseref: input.baseref, runid: input.runid, changes: full ? [] : changes, fingerprint: full ? `full:${input.baseref}` : fingerprint, full };
}

/** Reads whether one incrsnapshot delta is empty: an empty delta with no full snapshot lets the executor skip the whole recomputation because nothing changed. */
export function isemptydelta(delta: incrsnapshotdelta): boolean {
  return !delta.full && delta.changes.length === 0;
}

/** Reads whether the executor skips the recomputation of one step: an empty delta against the same run base means the snapshot builder emits nothing and the step reuses the base observation. */
export function skipsrecomputation(delta: incrsnapshotdelta): boolean {
  return isemptydelta(delta);
}

/** Reads the fingerprint of the change set one delta carries beside its base ref, so the executor deduplicates identical snapshot requests within a run. */
export function deltarequestkey(delta: incrsnapshotdelta): string {
  return `${delta.runid}:${delta.baseref}:${delta.fingerprint}`;
}

/** Builds the base snapshot ref record of one run the memory keeps for its deltas: the ref, the run it belongs to and the time the run set it. */
export function snapshotbaserecord(input: { runid: string; ref: string; now: number }): { id: string; runid: string; ref: string; at: number } {
  if (input.runid.trim() === "") throw new Error("The snapshot base needs its run id; a base without its run never serves a delta.");
  if (input.ref.trim() === "") throw new Error("The snapshot base needs its ref; a baseless delta never computes.");
  return { id: randomid(), runid: input.runid, ref: input.ref, at: input.now };
}

/** Reads the regions one delta touched, in the incrsnapshot change format the progress records reuse beside the step outcomes. */
export function deltachangesof(delta: incrsnapshotdelta): snapshotchange[] {
  return [...delta.changes];
}


/* ── Merged from dombatch.ts ── */

/**
 * Dombatch logic of the 1.1.68 family.
 * The dom observer debounces rapid mutation bursts into one batch, debouncedom coalesces scroll, input and resize storms per window, and the snapshot builder batches every dom query into one pass: the batchquery plan folds repeated selectors so one snapshot costs one query pass, and the grouped selectors execute together inside one offscreen worker task.
 * Every window stays the user's choice: an absent window passes events through uncoalesced, and no engine default ever caps a storm.
 */

/** Builds the debounce profiles of the user configured windows: only the event kinds with a window coalesce while the kinds without one pass every event through. */
export function debounceprofilesof(windows: Partial<Record<debounceprofile["kind"], number>>): debounceprofile[] {
  const kinds: debounceprofile["kind"][] = ["scroll", "input", "resize", "mutation"];
  return kinds.filter(kind => windows[kind] !== undefined).map(kind => ({ kind, window: windows[kind] as number }));
}

/** Coalesces one dom event storm into per kind batches: every event inside the window of its kind folds into the open batch, and a batch closes once the window since its first event elapsed. */
export function coalescedombursts(input: { events: Array<{ kind: debounceprofile["kind"]; at: number }>; profiles: debounceprofile[]; now: number }): debouncedbatch[] {
  const batches: debouncedbatch[] = [];
  for (const profile of input.profiles) {
    const events = input.events.filter(event => event.kind === profile.kind).sort((left, right) => left.at - right.at);
    if (events.length === 0) continue;
    const first = events[0]?.at ?? 0;
    let open: debouncedbatch = { kind: profile.kind, count: 0, firstat: first, lastat: first, closed: false };
    for (const event of events) {
      if (event.at - open.firstat >= profile.window) {
        batches.push({ ...open, closed: true });
        open = { kind: profile.kind, count: 1, firstat: event.at, lastat: event.at, closed: false };
        continue;
      }
      open = { ...open, count: open.count + 1, lastat: event.at };
    }
    batches.push({ ...open, closed: input.now - open.firstat >= profile.window });
  }
  return batches;
}

/** Debounces one rapid mutation burst of the dom observer into a single batch: every mutation inside the user window folds into one batch the observer delivers once. */
export function mutationbatchof(input: { mutations: Array<{ at: number; fingerprint?: string }>; window?: number; now: number }): debouncedbatch {
  const sorted = [...input.mutations].sort((left, right) => left.at - right.at);
  const firstat = sorted[0]?.at ?? input.now;
  const lastat = sorted[sorted.length - 1]?.at ?? input.now;
  const inside = sorted.filter(mutation => input.window === undefined || mutation.at - firstat < input.window);
  return { kind: "mutation", count: inside.length, firstat, lastat, closed: input.window === undefined || input.now - firstat >= input.window };
}

/** Builds one batchquery plan from the selector list a snapshot needs: repeated selectors fold away so the plan carries every distinct selector exactly once and the snapshot costs one query pass. */
export function batchqueryplanof(selectors: string[]): batchqueryplan {
  const distinct = [...new Set(selectors.map(selector => selector.trim()).filter(selector => selector !== ""))];
  return { selectors: distinct, folded: selectors.length - distinct.length, onepass: true };
}

/** Executes one batchquery plan in a single pass: the resolver runs once per distinct selector and every repeated selector shares the resolution of its first occurrence. */
export function runbatchquery(input: { plan: batchqueryplan; resolver: (selector: string) => string }): { resolutions: Record<string, string>; queries: number } {
  const resolutions: Record<string, string> = {};
  for (const selector of input.plan.selectors) resolutions[selector] = input.resolver(selector);
  return { resolutions, queries: input.plan.selectors.length };
}

/** Shapes one batchquery plan into the offscreen worker task payload the worker pool executes: the grouped selectors travel together so one worker task answers the whole pass. */
export function batchquerytaskof(input: { plan: batchqueryplan; runid: string; stepid: string }): { task: "batchquery"; runid: string; stepid: string; selectors: string[]; folded: number } {
  return { task: "batchquery", runid: input.runid, stepid: input.stepid, selectors: [...input.plan.selectors], folded: input.plan.folded };
}

/** Reads the query savings of one batchquery pass: the folded duplicate count beside the distinct queries the pass ran. */
export function batchquerysavings(plan: batchqueryplan): { distinct: number; folded: number; saved: number } {
  return { distinct: plan.selectors.length, folded: plan.folded, saved: plan.folded };
}


/* ── Merged from stepmeter.ts ── */

/**
 * Stepmeter logic of the 1.1.69 family.
 * The durationmeter measures every step with monotonic clocks and writes its samples into the perf records of the 1.1.68 family, the selectorprofile counts the resolution time and the failure rate per selector and flags the selectors above the user latency threshold, the steptrace spans nest per step and per worker task and export one trace file for the timeline view, the startupmeter measures the cold start from the startup event to ready with the lazymods budget it spent, the coldstart keeps the ready path under the user target with the heavy modules out of the first paint path, and the slowmo replays a recorded run at the user chosen speed factor with its pauses linked to their steptrace spans.
 * Every threshold, target and factor stays a user choice: the meters measure and never refuse.
 */

/** Builds one durationmeter sample from a monotonic clock pair: the step start and end clocks with the duration it measured. */
export function durationsampleof(input: { stepid: string; start: number; end: number; monotonic?: boolean }): durationsample {
  if (input.stepid.trim() === "") throw new Error("The durationmeter sample needs its step id.");
  return { stepid: input.stepid, start: input.start, end: input.end, duration: Math.max(input.end - input.start, 0), monotonic: input.monotonic ?? true };
}

/** Writes one durationmeter sample into the perf records of the 1.1.68 family: the sample becomes one perf record with its provenance attached. */
export function durationsampletoperf(input: { runid: string; sample: durationsample; queries: number; cachehits: number; delta: boolean; now: number; provenance?: { origin?: string; environment?: string; task?: string } }): perfrecord {
  return perfrecordof({ runid: input.runid, stepid: input.sample.stepid, duration: input.sample.duration, queries: input.queries, cachehits: input.cachehits, delta: input.delta, now: input.now, ...(input.provenance !== undefined ? { provenance: input.provenance } : {}) });
}

/** Reads the selectorprofile stats of one selector: the resolution count, the total and average resolution time and the failure rate, with the flag the selectors above the user latency threshold carry. */
export function selectorprofileof(input: { selector: string; samples: Array<{ duration: number; ok: boolean }>; threshold?: number }): selectorstats {
  if (input.selector.trim() === "") throw new Error("The selectorprofile needs its selector.");
  const count = input.samples.length;
  if (count === 0) return { selector: input.selector, count: 0, totalduration: 0, average: 0, failures: 0, failurerate: 0, flagged: false };
  const totalduration = input.samples.reduce((sum, sample) => sum + Math.max(sample.duration, 0), 0);
  const failures = input.samples.filter(sample => !sample.ok).length;
  const average = Math.round(totalduration / count);
  return { selector: input.selector, count, totalduration, average, failures, failurerate: failures / count, flagged: input.threshold !== undefined && input.threshold > 0 && average > input.threshold };
}

/** Updates one selectorprofile stat with a fresh resolution sample beside its prior stats: the count, the total duration and the failure rate grow while the flag follows the user latency threshold. */
export function selectorstatsupdate(prior: selectorstats | undefined, input: { selector: string; duration: number; ok: boolean; threshold?: number }): selectorstats {
  const count = (prior?.count ?? 0) + 1;
  const totalduration = (prior?.totalduration ?? 0) + Math.max(input.duration, 0);
  const failures = (prior?.failures ?? 0) + (input.ok ? 0 : 1);
  const average = Math.round(totalduration / count);
  return { selector: input.selector, count, totalduration, average, failures, failurerate: failures / count, flagged: input.threshold !== undefined && input.threshold > 0 && average > input.threshold };
}

/** Builds one steptrace span: the step or the worker task it covers with its start and end clocks, its cause and its optional parent span. */
export function steptracespanof(input: { runid: string; stepid?: string; task?: string; start: number; end: number; cause: string; parent?: string }): steptracespan {
  if (input.runid.trim() === "") throw new Error("The steptrace span needs its run id.");
  return { id: randomid(), runid: input.runid, ...(input.stepid !== undefined ? { stepid: input.stepid } : {}), ...(input.task !== undefined ? { task: input.task } : {}), start: input.start, end: input.end, cause: input.cause, ...(input.parent !== undefined ? { parent: input.parent } : {}) };
}

/** Reads the child spans of one steptrace span so the trace nests per step and per worker task. */
export function spanchildren(spans: steptracespan[], parentid: string): steptracespan[] {
  return spans.filter(span => span.parent === parentid);
}

/** Exports one trace file of a run for the timeline view: every span in start order with its event count. */
export function steptracefile(input: { runid: string; spans: steptracespan[] }): { runid: string; format: "devthink-steptrace"; events: number; spans: steptracespan[] } {
  if (input.runid.trim() === "") throw new Error("The trace file needs its run id.");
  const spans = [...input.spans].sort((left, right) => left.start - right.start);
  return { runid: input.runid, format: "devthink-steptrace" as const, events: spans.length, spans };
}

/** Builds one startupmeter sample: the cold start duration from the startup event to ready with the lazymods budget it spent, reported against the user target without ever refusing a load. */
export function startupsampleof(input: { startedat: number; readyat: number; spent: number; target?: number }): startupsample {
  return { startedat: input.startedat, readyat: input.readyat, duration: Math.max(input.readyat - input.startedat, 0), spent: Math.max(input.spent, 0), ...(input.target !== undefined ? { target: input.target } : {}) };
}

/** Reads the coldstart verdict of one startup sample: the ready path stays under the user target while the heavy modules stay out of the first paint path; an absent target keeps the verdict informational only. */
export function coldstartverdict(input: { sample: startupsample; heavy: string[]; firstpaint: string[] }): { withintarget: boolean; heavyinfirstpaint: string[]; reason: string } {
  const heavyinfirstpaint = input.firstpaint.filter(module => input.heavy.includes(module));
  const withintarget = input.sample.target === undefined ? true : input.sample.duration <= input.sample.target;
  return { withintarget, heavyinfirstpaint, reason: `${input.sample.target === undefined ? "The user set no cold start target and the engine sets none" : `The ready path of ${input.sample.duration} milliseconds stays ${withintarget ? "inside" : "past"} the user target of ${input.sample.target} milliseconds`}; ${heavyinfirstpaint.length} heavy module${heavyinfirstpaint.length === 1 ? "" : "s"} sit${heavyinfirstpaint.length === 1 ? "s" : ""} in the first paint path.` };
}

/** Opens one slowmo replay session of a recorded run at the user chosen speed factor; an absent factor keeps the replay at its recorded speed. */
export function slomosessionof(input: { runid: string; factor?: number; now: number }): slowmosession {
  if (input.runid.trim() === "") throw new Error("The slowmo session needs its run id.");
  const factor = input.factor !== undefined && input.factor > 0 ? input.factor : 1;
  return { runid: input.runid, factor, paused: false, at: input.now };
}

/** Reads the pause window between two slowmo steps: the recorded duration divided by the user factor, so a factor of one half doubles every pause. */
export function slomostepdelay(input: { factor: number; duration: number }): number {
  const factor = input.factor > 0 ? input.factor : 1;
  return Math.max(input.duration / factor, 0);
}

/** Pauses one slowmo replay between steps for inspection and links the pause to its steptrace span. */
export function slomopause(input: { session: slowmosession; stepid: string; spanid: string }): slowmosession {
  return { ...input.session, paused: true, stepid: input.stepid, spanid: input.spanid };
}

/** Resumes one slowmo replay from its inspection pause; the replay keeps its factor and its run. */
export function slomoresume(session: slowmosession): slowmosession {
  return { ...session, paused: false };
}


/* ── Merged from resourceaware.ts ── */

/**
 * Resourceaware logic of the 1.1.69 family.
 * The tabsuspend discards idle tabs only during the waits longer than the user window, restores a tab before the next step that needs it and preserves the run state across the suspend and restore, the artifactcompress compresses captures and logs at rest and decompresses them lazily on read, the logprune removes the sealed logs past the user retention window while it prunes whole sealed runs only so the chain stays verifiable, the batteryaware scheduler defers non urgent scheduled runs on low battery and surfaces the deferrals in the attentionfeed, and the networkaware retry policies adapt their backoff to the failure kind while they honor the server signals when present.
 * Every window, rule and floor stays a user choice: the deferrals, the codecs and the backoffs optimize the resource use and never refuse the work.
 */

/** Reads the tabsuspend plan of one wait: the tab suspends only during a wait longer than the user window while an absent window or a shorter wait never suspends the tab. */
export function suspendplan(input: { waitduration: number; window?: number }): { suspend: boolean; reason: string } {
  if (input.window === undefined) return { suspend: false, reason: "The user set no suspend window and the engine sets none; the tab never suspends during a wait." };
  if (input.waitduration <= input.window) return { suspend: false, reason: `The wait of ${input.waitduration} milliseconds stays inside the user suspend window of ${input.window} milliseconds; the tab never suspends.` };
  return { suspend: true, reason: `The wait of ${input.waitduration} milliseconds runs past the user suspend window of ${input.window} milliseconds; the idle tab suspends while the run state stays preserved.` };
}

/** Builds one tabsuspend state: the suspended tab with its run, its restore url and the discard flag, so the run state survives the suspend and the restore. */
export function tabsuspendstateof(input: { tabid: number; runid: string; restoreurl: string; discarded: boolean; now: number }): tabsuspendstate {
  if (input.runid.trim() === "") throw new Error("The tabsuspend state needs its run id.");
  return { tabid: input.tabid, runid: input.runid, suspendedat: input.now, restoreurl: input.restoreurl, discarded: input.discarded };
}

/** Reads the restore plan of one suspended tab: the tab restores before the next step that needs it while a discarded tab reloads its restore url and an undiscarded tab keeps its page state. */
export function tabsuspendrestoreplan(input: { state: tabsuspendstate; nextneedsurl: string }): { restore: boolean; reload: boolean; reason: string } {
  if (!input.nextneedsurl.startsWith("http")) return { restore: true, reload: input.state.discarded, reason: `The next step needs the suspended tab ${input.state.tabid}${input.state.discarded ? "; the discarded tab reloads its restore url" : "; the tab keeps its page state"}.` };
  if (input.nextneedsurl === input.state.restoreurl) return { restore: true, reload: input.state.discarded, reason: `The next step needs ${input.nextneedsurl} which the suspended tab ${input.state.tabid} restores${input.state.discarded ? " through a reload" : " with its page state intact"}.` };
  return { restore: false, reload: false, reason: `The next step needs ${input.nextneedsurl} while the suspended tab ${input.state.tabid} held ${input.state.restoreurl}; the navigation runs as reviewed.` };
}

/** Builds one artifactcompress record: the stored artifact with its codec and its lazy read flag, so the capture and log bytes compress at rest and decompress on read. */
export function artifactcompressof(input: { artifactid: string; codec?: "deflate" | "store"; lazy?: boolean; now: number }): artifactcompressrecord {
  if (input.artifactid.trim() === "") throw new Error("The artifactcompress record needs its artifact id.");
  return { artifactid: input.artifactid, codec: input.codec ?? "store", compressedat: input.now, lazy: input.lazy ?? true };
}

/** Reads the read plan of one stored artifact: a deflate artifact decompresses lazily on read while a stored artifact reads its plain bytes directly. */
export function artifactreadplan(record: artifactcompressrecord): { decode: "immediate" | "lazy"; reason: string } {
  if (record.codec === "store") return { decode: "immediate", reason: `The artifact ${record.artifactid} stores its bytes plain; the read needs no decompression.` };
  return { decode: record.lazy ? "lazy" : "immediate", reason: `The artifact ${record.artifactid} compresses at rest through ${record.codec} and decompresses ${record.lazy ? "lazily on read" : "at restore time"}.` };
}

/** Reads the logprune plan of one sealed log chain: the prune removes whole sealed runs past the user retention or size window while an unsealed run never prunes so the chain stays verifiable. */
export function logpruneplan(input: { sealed: Array<{ runid: string; sealedat: number; bytes: number; sealed: boolean }>; rule: logprunerule; now: number }): { prune: string[]; keep: string[]; refused: string[] } {
  const prune: string[] = [];
  const keep: string[] = [];
  const refused: string[] = [];
  for (const run of input.sealed) {
    if (!run.sealed) { refused.push(run.runid); continue; }
    const aged = input.rule.retention !== undefined && input.now - run.sealedat >= input.rule.retention;
    const oversized = input.rule.sizewindow !== undefined && run.bytes > input.rule.sizewindow;
    if (aged || oversized) { prune.push(run.runid); continue; }
    keep.push(run.runid);
  }
  return { prune, keep, refused };
}

/** Reads the batteryaware scheduling state: the non urgent scheduled runs defer while the battery stays under the user floor and never charges; the deferral never cancels a run. */
export function batteryawarestateof(input: { level: number; charging: boolean; floor?: number; scheduled: string[]; now: number }): batteryawarestate {
  const low = input.floor !== undefined && input.floor > 0 && input.level < input.floor && !input.charging;
  return { level: Math.min(Math.max(input.level, 0), 1), charging: input.charging, deferred: low ? [...input.scheduled] : [], at: input.now };
}

/** Reads the networkaware backoff of one retry: the policy of the failure kind sets the backoff window while a present server signal overrides it. */
export function networkbackoff(input: { failurekind: string; rules: networkretryrule[]; serversignal?: number }): number {
  const rule = input.rules.find(candidate => candidate.failurekind === input.failurekind);
  if (input.serversignal !== undefined && input.serversignal > 0) return input.serversignal;
  return rule !== undefined ? Math.max(rule.backoff, 0) : 0;
}


/* ── Merged from batchscheduling.ts ── */

/**
 * Batchscheduling logic of the 1.1.69 family.
 * Batch run queues pace themselves against the sites they address: the queue pauses its enqueueing when the downstream steps fall behind past the user window and never drops a queued step, every domain runs inside its user chosen concurrency slots with the overflow queued per lane, batch requests space themselves through the politedelay profile with its jitter and its per domain floors, the adaptivepoll window widens while observations stay unchanged and narrows the moment changes resume, identical pending queries merge into one dispatch whose single result fans out to every waiter, and the snapshot cadence widens under memory pressure and restores when the pressure clears.
 * Every window, limit and factor stays a user choice: the scheduler optimizes the pacing and never caps the work, and no budget ever bypasses the review.
 */

/** Reads the backpressure signal of one batch run queue: the queue pauses its enqueueing when the completed outcomes fall behind the enqueued steps past the user window, and the pause never drops a queued step. */
export function batchbackpressuresignal(input: { runid: string; enqueued: number; completed: number; window?: number; now: number }): backpressuresignal {
  if (input.runid.trim() === "") throw new Error("The backpressure signal needs its run id.");
  const behind = Math.max(input.enqueued - input.completed, 0);
  const paused = input.window !== undefined && behind > input.window;
  return { runid: input.runid, enqueued: input.enqueued, completed: input.completed, behind, paused, ...(input.window !== undefined ? { window: input.window } : {}), at: input.now };
}

/** Plans the domain lanes of one batch run: every domain runs at most its user chosen slots concurrently while the overflow steps queue per lane; a domain without a user limit stays unbounded. */
export function domainlanesfor(input: { steps: Array<{ id: string; domain: string }>; limits: Record<string, number> }): domainlane[] {
  const domains = [...new Set(input.steps.map(step => step.domain))];
  return domains.map(domain => {
    const ids = input.steps.filter(step => step.domain === domain).map(step => step.id);
    const limit = input.limits[domain];
    if (limit === undefined) return { domain, slots: ids.length, running: [...ids], queued: [] };
    const slots = Math.max(Math.floor(limit), 0);
    return { domain, slots, running: ids.slice(0, slots), queued: ids.slice(slots) };
  });
}

/** Moves the queued overflow of one domain lane into its running set as its slots free; the lane never runs more steps than the user chosen slots. */
export function advancelane(lane: domainlane, freed: number): domainlane {
  const room = Math.max(lane.slots - lane.running.length, 0);
  const admit = lane.queued.slice(0, Math.min(Math.max(freed, 0), room));
  return { ...lane, running: [...lane.running, ...admit], queued: lane.queued.slice(admit.length) };
}

/** Reads the politedelay of one domain: the base delay with the jitter window folded over it through the roll, never below the per domain floor the siteprofiles carry. */
export function politedelayfor(input: { domain: string; base: number; floor?: number; jitter?: number; roll: number }): number {
  if (input.domain.trim() === "") throw new Error("The politedelay needs its domain.");
  const jitter = input.jitter ?? 0;
  const delay = Math.max(input.base, 0) + Math.min(Math.max(input.roll, 0), 1) * Math.max(jitter, 0);
  return Math.max(delay, input.floor ?? 0);
}

/** Reads the next adaptivepoll interval: the window widens by the growth factor while observations stay unchanged and narrows the moment changes resume, always inside the floor and the ceiling the user chose. */
export function adaptivepollnext(input: { interval: number; window: adaptivepollwindow; changed: boolean }): number {
  if (input.window.growth <= 1) return Math.min(Math.max(input.interval, input.window.floor), input.window.ceiling);
  const next = input.changed ? input.interval / input.window.growth : input.interval * input.window.growth;
  return Math.min(Math.max(next, input.window.floor), input.window.ceiling);
}

/** Merges identical pending queries into one dispatch: every request with the same key folds into one coalesced entry whose waiters list carries every waiter the single result fans out to. */
export function coalescequeries(input: { requests: Array<{ key: string; waiter: string }> }): coalescedrequest[] {
  const merged = new Map<string, coalescedrequest>();
  for (const request of input.requests) {
    const entry = merged.get(request.key);
    if (entry === undefined) { merged.set(request.key, { key: request.key, waiters: [request.waiter], dispatched: true }); continue; }
    if (!entry.waiters.includes(request.waiter)) entry.waiters.push(request.waiter);
  }
  return [...merged.values()];
}

/** Fans the single result of one coalesced dispatch out to every waiter that merged into it. */
export function coalescefanout<T>(entry: coalescedrequest, result: T): Array<{ waiter: string; result: T }> {
  return entry.waiters.map(waiter => ({ waiter, result }));
}

/** Reads the snapshot cadence under memory pressure: the interval widens by the user chosen widening factor while the pressure stays high and restores to the base interval the moment the pressure clears. */
export function cadenceunderpressure(input: { control: cadencecontrol; pressure: boolean; widening?: number }): cadencecontrol {
  if (!input.pressure) return { base: input.control.base, current: input.control.base, pressure: false };
  const widening = input.widening !== undefined && input.widening > 1 ? input.widening : 1;
  const widened = input.control.pressure ? input.control.current : input.control.base * widening;
  return { base: input.control.base, current: Math.max(widened, input.control.base), pressure: true };
}


/* ── Merged from lazyload.ts ── */

/**
 * Lazyload logic of the 1.1.68 family.
 * The heavy modules stay out of the startup path: every lazy module declares its id, its load reason and its capability requirements ahead of load, the loader resolves a module on first use while the capability checks stay exactly the checks the eager path runs, the prewarm hook warms the user chosen set on startup, and every resolution records load telemetry for startup analysis.
 * Lazy loading never hides a capability: a module whose declared capability stays ungranted never resolves, and no budget ever refuses a load because every budget stays the user's choice.
 */

/** The catalog of lazy modules: the heavy parsers and the capture, compare and export families load lazily behind their first command while the startup path stays free of them. */
export function lazymodcatalog(): lazymoddescriptor[] {
  return [
    { id: "capture", reason: "the capture family loads behind its first reviewed capture command", capabilities: ["capture"] },
    { id: "compare", reason: "the outputcompare family loads behind its first comparison command", capabilities: ["compare"] },
    { id: "export", reason: "the exporttools family loads behind its first export command", capabilities: ["export"] },
    { id: "htmlsnapshot", reason: "the heavy html parser loads behind its first parse task", capabilities: ["parse"] },
    { id: "readertree", reason: "the heavy reader parser loads behind its first parse task", capabilities: ["parse"] },
    { id: "tablerows", reason: "the heavy table parser loads behind its first parse task", capabilities: ["parse"] },
    { id: "a11ytree", reason: "the heavy a11y parser loads behind its first parse task", capabilities: ["parse"] },
    { id: "diffpreview", reason: "the heavy diff parser loads behind its first diff command", capabilities: ["parse"] },
  ];
}

/** Reads one lazy module descriptor by id; an unknown id returns undefined so the caller keeps its eager fallback. */
export function lazymodof(id: string): lazymoddescriptor | undefined {
  return lazymodcatalog().find(descriptor => descriptor.id === id);
}

/** Resolves one lazy module on first use: the declared capabilities must all stay granted or the resolution records its refusal, and the load telemetry records the duration and the provenance of the first use. */
export function resolvelazymod(input: { id: string; granted: string[]; firstuse: boolean; duration: number; now: number; provenance?: { runid?: string; stepid?: string; surface?: string } }): lazyloadrecord {
  const descriptor = lazymodof(input.id);
  if (descriptor === undefined) return { id: randomid(), moduleid: input.id, reason: "the module id names no lazy module", resolved: false, duration: input.duration, at: input.now, ...(input.provenance !== undefined ? { provenance: input.provenance } : {}) };
  const missing = descriptor.capabilities.filter(capability => !input.granted.includes(capability));
  return { id: randomid(), moduleid: descriptor.id, reason: descriptor.reason, resolved: missing.length === 0, duration: input.duration, at: input.now, ...(input.provenance !== undefined ? { provenance: input.provenance } : {}) };
}

/** Prewarms the user chosen lazy module set on startup: every prewarmed module resolves immediately with its telemetry recorded while the modules outside the set stay out of the startup path. */
export function prewarmmodules(input: { prewarmset: string[]; granted: string[]; now: number; duration?: number }): lazyloadrecord[] {
  return input.prewarmset.map(id => resolvelazymod({ id, granted: input.granted, firstuse: false, duration: input.duration ?? 0, now: input.now, provenance: { surface: "startup" } }));
}

/** Builds the startup module budget view: the prewarmed modules lead the startup path, the lazy rest stays out of it, and the user configured budget reports over or under without ever refusing a load. */
export function startupbudgetof(input: { prewarmset: string[]; budget?: number }): startupbudget {
  const catalog = lazymodcatalog();
  const prewarmed = catalog.filter(descriptor => input.prewarmset.includes(descriptor.id)).map(descriptor => descriptor.id);
  const lazy = catalog.filter(descriptor => !input.prewarmset.includes(descriptor.id)).map(descriptor => descriptor.id);
  return { prewarmed, lazy, total: catalog.length, ...(input.budget !== undefined ? { budget: input.budget } : {}), over: input.budget !== undefined && prewarmed.length > input.budget };
}

/** Reads the startup cost the prewarm set adds: the module count the startup path carries beside the lazy rest, reported to the user with no engine ceiling. */
export function startupcostof(budget: startupbudget): { startupmodules: number; lazy: number; note: string } {
  return { startupmodules: budget.prewarmed.length, lazy: budget.lazy.length, note: budget.budget !== undefined && budget.over ? `The prewarm set exceeds the user startup budget of ${budget.budget}; the view reports the overrun while every load stays allowed.` : `The startup path carries ${budget.prewarmed.length} prewarmed module${budget.prewarmed.length === 1 ? "" : "s"} while ${budget.lazy.length} lazy module${budget.lazy.length === 1 ? "" : "s"} wait for their first use.` };
}
