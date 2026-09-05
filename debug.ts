/** The debug module of the 1.1.90 consolidation: every correlated variation of the cdp instrumentation and the profilers interned in this one file, so the module family carries one surface without duplicate variations. */

/* ── Merged from cdpbus.ts: the 1.1.90 consolidation interns the correlated cdpbus logic here, so no variation of the same file lives beside another. ── */
import type { attachtarget, breakpointspec, cdpallowlist, cdpcommand, cdpeventrule, cdpsession, cpuprofile, flowmetric, flowspec, growsample, heaprecord, memorytrend, pausestate, scriptoverride, shiftentry, sourcemapref, stackframe, stepmode, teardownplan, traceannotation, tracerecord, watchexpression } from "./types.js";

/**
 * Devtools protocol bus for the 1.1.46 debugging family.
 * Every correlated rule for the reviewed instrumented devtools session lives in this file: the domain grammar, the attach and detach lifecycle with the honest derivation note, the raw command records with duration and error class, the per session command serialization in send order, the domain event rules with match filters and per domain event counts, the breakpoint input grammar, the pause state capture with call frames, the step mode grammar, the watch expression values per pause, the script override url patterns and the teardown plan that reverts every breakpoint and override and decides the resume policy when the user detaches the debugger.
 * The chrome devtools protocol is unavailable without the debugger permission, which the manifest gate forbids, so every command routes through the page-instrumented harness injected through the scripting api; the derivation is recorded on every session instead of hidden.
 */

/** The debugging kinds of the devtools family, listed among the available capabilities of every proposal request. */
export const cdpkinds: string[] = ["attachcdp", "detachcdp", "cdpcmd", "watchcdp", "setbreakpoint", "stepcode", "watchexpr", "overridescript"];

/** The reviewed devtools domain grammar: runtime evaluation, log capture, debugger state, dom snapshots, network facts and page lifecycle; the enabled subset stays a user choice bounded by this grammar only. */
export const cdpdomains: string[] = ["Runtime", "Log", "Debugger", "DOM", "Network", "Page"];

/** Resolves the domain of one devtools method name of the form Domain.method; malformed methods resolve to undefined. */
export function methoddomain(method: string): string | undefined {
  const match = /^([A-Z][A-Za-z]*)\.([a-zA-Z][A-Za-z0-9]*)$/.exec(method.trim());
  return match?.[1];
}

/** Normalizes one reviewed devtools domain allowlist: the enabled domains bounded by the reviewed domain grammar and the optional method gates inside the enabled domains; a gate list that names no method of the enabled domains is refused. */
export function cdpallowlistof(value: unknown): cdpallowlist | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const domains = Array.isArray(entry.domains) ? entry.domains.filter((domain): domain is string => typeof domain === "string" && cdpdomains.includes(domain)) : [];
  if (domains.length === 0) return undefined;
  if (entry.methods === undefined) return { domains };
  const methods = Array.isArray(entry.methods) ? entry.methods.filter((method): method is string => typeof method === "string" && methoddomain(method) !== undefined && domains.includes(methoddomain(method) as string)) : [];
  if (methods.length === 0) return undefined;
  return { domains, methods };
}

/** True when the allowlist covers one method: the method domain must be enabled and a present method gate list must name the method. */
export function allowlistcovers(allowlist: cdpallowlist, method: string): boolean {
  const domain = methoddomain(method);
  if (domain === undefined) return false;
  if (!allowlist.domains.includes(domain)) return false;
  if (allowlist.methods !== undefined && !allowlist.methods.includes(method)) return false;
  return true;
}

/** Attaches one instrumented devtools session to the run tab with the reviewed enabled domains and the honest debugger derivation note. */
export function attachcdpsession(input: { id: string; runid: string; stepid: string; tabid: number; origin: string; domains: string[]; now: number; debuggerversion: string }): cdpsession {
  return { id: input.id, runid: input.runid, stepid: input.stepid, tabid: input.tabid, origin: input.origin, attachedat: input.now, domains: [...new Set(input.domains)], debuggerversion: input.debuggerversion };
}

/** Detaches one session cleanly: the detach time stamps the record and the domains stay auditable after the detach. */
export function detachcdpsession(session: cdpsession, at: number, userdetached = false): cdpsession {
  return { ...session, detachedat: at, ...(userdetached ? { userdetached: true } : {}) };
}

/** Builds one raw protocol command record with its method, params, domain, dotted result path, duration and error class. */
export function sendcdpcommand(input: { id: string; sessionid: string; runid: string; stepid: string; method: string; params?: Record<string, unknown>; resultpath?: string; duration: number; errorclass?: string; at: number }): cdpcommand {
  const domain = methoddomain(input.method);
  if (domain === undefined) return { ...input, method: input.method.trim(), domain: "", duration: input.duration, ...(input.errorclass !== undefined ? { errorclass: input.errorclass } : { errorclass: "malformedmethod" }), at: input.at };
  return { ...input, method: input.method.trim(), domain, duration: input.duration, ...(input.errorclass !== undefined ? { errorclass: input.errorclass } : {}), at: input.at };
}

/** Appends one command to the per session send queue so concurrent commands serialize in send order. */
export function serializecdpcommand(queue: cdpcommand[], command: cdpcommand): cdpcommand[] {
  return [...queue, command];
}

/** Normalizes one reviewed domain event rule: the domain of the reviewed grammar, the event name and the optional payload match filter. */
export function cdpeventruleof(value: unknown): Pick<cdpeventrule, "domain" | "event" | "match"> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const domain = typeof entry.domain === "string" && cdpdomains.includes(entry.domain) ? entry.domain : undefined;
  const event = typeof entry.event === "string" && entry.event.trim() ? entry.event.trim() : undefined;
  if (domain === undefined || event === undefined) return undefined;
  const match = typeof entry.match === "string" && entry.match.trim() ? entry.match.trim() : undefined;
  return { domain, event, ...(match !== undefined ? { match } : {}) };
}

/** Matches observed domain events against the reviewed rules and counts the matched events per domain; the match filter must appear in the payload before an event forwards. */
export function watchcdpevents(rules: cdpeventrule[], events: Array<{ domain: string; event: string; payload?: string }>): { matched: Array<{ ruleid: string; domain: string; event: string; payload?: string }>; counts: Record<string, number> } {
  const matched: Array<{ ruleid: string; domain: string; event: string; payload?: string }> = [];
  const counts: Record<string, number> = {};
  for (const domain of cdpdomains) counts[domain] = 0;
  for (const event of events) {
    for (const rule of rules) {
      if (rule.domain !== event.domain || rule.event !== event.event) continue;
      if (rule.match !== undefined && !(event.payload ?? "").includes(rule.match)) continue;
      matched.push({ ruleid: rule.id, domain: event.domain, event: event.event, ...(event.payload !== undefined ? { payload: event.payload } : {}) });
      counts[event.domain] = (counts[event.domain] ?? 0) + 1;
    }
  }
  return { matched, counts };
}

/** Normalizes one reviewed breakpoint input: the script url, the zero based line, the optional column and the condition of the reviewed expression grammar. */
export function breakpointinputof(value: unknown): Pick<breakpointspec, "url" | "line" | "column" | "condition"> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const url = typeof entry.url === "string" && entry.url.trim() ? entry.url.trim() : undefined;
  const line = typeof entry.line === "number" && Number.isInteger(entry.line) && entry.line >= 0 ? entry.line : undefined;
  if (url === undefined || line === undefined) return undefined;
  const column = typeof entry.column === "number" && Number.isInteger(entry.column) && entry.column >= 0 ? entry.column : undefined;
  const condition = typeof entry.condition === "string" && entry.condition.trim() ? entry.condition.trim() : undefined;
  return { url, line, ...(column !== undefined ? { column } : {}), ...(condition !== undefined ? { condition } : {}) };
}

/** Captures one pause state from the instrumented pause: the reason, the call frames, the hit breakpoint and the dom snapshot reference of the page bridge capture. */
export function capturepause(input: { id: string; runid: string; stepid: string; reason: string; callframes: stackframe[]; hitbreakpoint?: string; domsnapshotid?: string; at: number }): pausestate {
  return { id: input.id, runid: input.runid, stepid: input.stepid, reason: input.reason, callframes: [...input.callframes], ...(input.hitbreakpoint !== undefined ? { hitbreakpoint: input.hitbreakpoint } : {}), ...(input.domsnapshotid !== undefined ? { domsnapshotid: input.domsnapshotid } : {}), at: input.at };
}

/** Normalizes one reviewed step mode of the instrumented debugger: stepover, stepinto, stepout or resume. */
export function stepmodeof(value: unknown): stepmode | undefined {
  const modes: stepmode[] = ["stepover", "stepinto", "stepout", "resume"];
  return typeof value === "string" && modes.includes(value as stepmode) ? value as stepmode : undefined;
}

/** Normalizes one reviewed watch expression input: the expression text and the pause scope it evaluates in. */
export function watchexpressionof(value: unknown): Pick<watchexpression, "expression" | "scope"> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const expression = typeof entry.expression === "string" && entry.expression.trim() ? entry.expression.trim() : undefined;
  if (expression === undefined) return undefined;
  const scope = typeof entry.scope === "string" && entry.scope.trim() ? entry.scope.trim() : "topframe";
  return { expression, scope };
}

/** Records one watch value captured at a pause with the pause scope correlation. */
export function recordwatchvalue(expression: watchexpression, pauseid: string, value: string, at: number): watchexpression {
  return { ...expression, values: [...expression.values, { pauseid, value, at }] };
}

/** Normalizes one reviewed script override input: the url pattern that names its origin explicitly and the full fixture source. */
export function overrideinputof(value: unknown): Pick<scriptoverride, "urlpattern" | "source"> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const urlpattern = typeof entry.urlpattern === "string" && entry.urlpattern.trim() ? entry.urlpattern.trim() : undefined;
  const source = typeof entry.source === "string" ? entry.source : undefined;
  if (urlpattern === undefined || source === undefined || source.trim().length === 0) return undefined;
  return { urlpattern, source };
}

/** Matches one script url against a reviewed override pattern of an explicit https origin with single star segments and double star subtrees. */
export function overridematches(urlpattern: string, url: string): boolean {
  const patternmatch = /^(https:\/\/[^/]+)(\/.*)?$/.exec(urlpattern);
  const urlmatch = /^(https:\/\/[^/]+)(\/.*)?$/.exec(url);
  if (!patternmatch || !urlmatch) return false;
  if (patternmatch[1] !== urlmatch[1]) return false;
  const patternpath = (patternmatch[2] ?? "/").split("/").filter(segment => segment.length > 0);
  const urlpath = (urlmatch[2] ?? "/").split("/").filter(segment => segment.length > 0);
  const walk = (patternindex: number, urlindex: number): boolean => {
    if (patternindex >= patternpath.length) return urlindex >= urlpath.length;
    const segment = patternpath[patternindex];
    if (segment === "**") return walk(patternindex + 1, urlindex) || (urlindex < urlpath.length && walk(patternindex, urlindex + 1));
    if (urlindex >= urlpath.length) return false;
    if (segment !== "*" && segment !== urlpath[urlindex]) return false;
    return walk(patternindex + 1, urlindex + 1);
  };
  return walk(0, 0);
}

/** Normalizes one reviewed teardown plan: the revert steps and the resume policy of resume, pause or ask. */
export function teardownplanof(value: unknown): teardownplan | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const revertsteps = Array.isArray(entry.revertsteps) ? entry.revertsteps.filter((step): step is string => typeof step === "string" && step.trim().length > 0) : [];
  const policy = entry.resumepolicy;
  if (revertsteps.length === 0) return undefined;
  if (policy !== undefined && policy !== "resume" && policy !== "pause" && policy !== "ask") return undefined;
  return { revertsteps, resumepolicy: policy ?? "ask" };
}

/** The teardown outcome of one session: every breakpoint and override reverts, the resume policy decides the continuation and a user detach keeps the session record alive for review while the run pauses. */
export interface teardowndecision {
  session: cdpsession;
  revertedbreakpoints: string[];
  revertedoverrides: string[];
  resumepolicy: teardownplan["resumepolicy"];
  paused: boolean;
  keepsalive: boolean;
}

/** Tears one session down safely: the revert steps of the reviewed teardown plan revert every active breakpoint and override in order, the session detaches, and a user detach keeps the session record alive while the run pauses for review before continuing. */
export function teardowncdpsession(input: { session: cdpsession; breakpoints: breakpointspec[]; overrides: scriptoverride[]; plan: teardownplan | undefined; userdetached: boolean; at: number }): teardowndecision {
  const revertedbreakpoints = input.breakpoints.filter(spec => spec.revertedat === undefined).map(spec => spec.id);
  const revertedoverrides = input.overrides.filter(spec => spec.revertedat === undefined).map(spec => spec.id);
  const resumepolicy = input.userdetached ? "pause" : input.plan?.resumepolicy ?? "ask";
  return {
    session: detachcdpsession(input.session, input.at, input.userdetached),
    revertedbreakpoints,
    revertedoverrides,
    resumepolicy,
    paused: input.userdetached || resumepolicy === "pause",
    keepsalive: input.userdetached,
  };
}

/* ── Merged from profilers.ts: the 1.1.90 consolidation interns the correlated profilers logic here, so no variation of the same file lives beside another. ── */
/**
 * Profilers for the 1.1.47 debugging part three family.
 * Every correlated rule for the reviewed flow, heap, cpu, trace and source map instruments lives in this file: the flow metric grammar with per step mark windows and blocking sums, the on demand heap snapshot records with the user chosen interval, the growth trend slopes with the flagged steps, the cpu profile records with hot functions, the layout shift entries with impacted selectors, the trace records with the reviewed category list and step annotations, the offline replay of a captured trace file, and the source map references with stack rewriting.
 * The chrome devtools protocol needs the debugger permission, which the manifest gate forbids, so every measurement derives from the performance timeline buffers, the injected instrumentation probes of the page harness and the existing page seams; the derivation stays recorded on every record instead of hidden.
 */

/** The profiling kinds of the debugging part three family, listed among the available capabilities of every proposal request. */
export const profilerkinds: string[] = ["measureflow", "heapshot", "trackmemory", "profilecpu", "watchshifts", "traceload", "annotatetrace", "replaytrace", "capturesourcemaps"];

/** The reviewed flow metric set: navigation, paint and largest contentful paint timings, first input delay and interaction timings, and the blocking time sums per step window. */
export const flowmetricnames: string[] = ["navigation", "paint", "lcp", "fid", "interaction", "blocking"];

/** The reviewed trace category list applied to every recorded trace; the enabled subset stays a user choice bounded by this grammar only. */
export const tracecategories: string[] = ["navigation", "scripting", "rendering", "painting", "loading", "network"];

/** Normalizes one reviewed profiling attach target: the target kind of page, iframe, worker or service worker with an explicit https url. */
export function attachtargetof(value: unknown): attachtarget | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const kinds: attachtarget["kind"][] = ["page", "iframe", "worker", "serviceworker"];
  const kind = typeof entry.kind === "string" && kinds.includes(entry.kind as attachtarget["kind"]) ? entry.kind as attachtarget["kind"] : undefined;
  const url = typeof entry.url === "string" && entry.url.trim() ? entry.url.trim() : undefined;
  if (kind === undefined || url === undefined) return undefined;
  if (kind !== "page" && !/^https:\/\//.test(url)) return undefined;
  return { kind, url };
}

/** Normalizes one reviewed flow spec: a non-empty mark prefix, a non-empty step window and a metric list of the reviewed metric set. */
export function flowspecof(value: unknown): flowspec | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const prefix = typeof entry.prefix === "string" && entry.prefix.trim() ? entry.prefix.trim() : undefined;
  const steps = Array.isArray(entry.steps) ? entry.steps.filter((step): step is string => typeof step === "string" && step.trim().length > 0) : [];
  const metrics = Array.isArray(entry.metrics) ? entry.metrics.filter((metric): metric is string => typeof metric === "string" && flowmetricnames.includes(metric)) : [];
  if (prefix === undefined || steps.length === 0 || metrics.length === 0) return undefined;
  return { prefix, steps, metrics };
}

/** One flattened performance entry of the page buffers: the name, the entry type, the start time and the duration. */
export interface perfentry {
  name: string;
  type: string;
  start: number;
  duration: number;
}

/** Resolves the reviewed step windows of a flow spec from the performance marks of the prefix: every step id of the window gains its start and end from the marks of the measured page. */
export function stepwindows(spec: flowspec, marks: perfentry[]): Array<{ stepid: string; start: number; end: number }> {
  const windows: Array<{ stepid: string; start: number; end: number }> = [];
  for (const stepid of spec.steps) {
    const start = marks.find(mark => mark.type === "mark" && mark.name === `${spec.prefix}:${stepid}:start`);
    const end = marks.find(mark => mark.type === "mark" && mark.name === `${spec.prefix}:${stepid}:end`);
    if (start === undefined || end === undefined) continue;
    windows.push({ stepid, start: start.start, end: Math.max(end.start, start.start) });
  }
  return windows;
}

/** Measures one reviewed flow from the performance buffers of the page: every metric of the reviewed set carries its window start and end, its duration and the step ids it spans, navigation, paint and largest contentful paint timings come from the navigation and paint buffers, first input delay and interaction timings from the event buffers and the blocking time is summed per step window from the long task entries over the fifty millisecond threshold. */
export function measure(input: { runid: string; stepid: string; spec: flowspec; entries: perfentry[]; now: number }): flowmetric[] {
  const metrics: flowmetric[] = [];
  const windows = stepwindows(input.spec, input.entries.filter(entry => entry.type === "mark"));
  const stepsof = (start: number, end: number): string[] => windows.filter(window => window.end >= start && window.start <= end).map(window => window.stepid);
  const push = (name: string, start: number, end: number, steps: string[]): void => {
    if (!input.spec.metrics.includes(name)) return;
    metrics.push({ id: `${input.runid}-${input.stepid}-${name}-${metrics.length}`, runid: input.runid, stepid: input.stepid, name, start, end, duration: Math.max(0, end - start), steps, at: input.now });
  };
  const navigation = input.entries.find(entry => entry.type === "navigation");
  if (navigation !== undefined) push("navigation", navigation.start, navigation.start + navigation.duration, stepsof(navigation.start, navigation.start + navigation.duration));
  for (const paint of input.entries.filter(entry => entry.type === "paint")) {
    if (!input.spec.metrics.includes("paint")) break;
    push("paint", paint.start, paint.start + paint.duration, stepsof(paint.start, paint.start + paint.duration));
  }
  const lcps = input.entries.filter(entry => entry.type === "largest-contentful-paint");
  const lcp = lcps.length > 0 ? lcps.reduce((largest, entry) => entry.start > largest.start ? entry : largest) : undefined;
  if (lcp !== undefined) push("lcp", lcp.start, lcp.start + lcp.duration, stepsof(lcp.start, lcp.start + lcp.duration));
  const firstinput = input.entries.find(entry => entry.type === "first-input");
  if (firstinput !== undefined) push("fid", firstinput.start, firstinput.start + firstinput.duration, stepsof(firstinput.start, firstinput.start + firstinput.duration));
  const interactions = input.entries.filter(entry => entry.type === "event");
  if (interactions.length > 0) {
    const start = interactions.reduce((earliest, entry) => entry.start < earliest.start ? entry : earliest).start;
    const end = interactions.reduce((latest, entry) => entry.start + entry.duration > latest ? entry.start + entry.duration : latest, start);
    push("interaction", start, end, stepsof(start, end));
  }
  for (const window of windows) {
    if (!input.spec.metrics.includes("blocking")) break;
    const blocking = input.entries.filter(entry => entry.type === "longtask" && entry.start >= window.start && entry.start <= window.end).reduce((total, entry) => total + Math.max(0, entry.duration - 50), 0);
    metrics.push({ id: `${input.runid}-${input.stepid}-blocking-${window.stepid}`, runid: input.runid, stepid: input.stepid, name: "blocking", start: window.start, end: window.end, duration: blocking, steps: [window.stepid], at: input.now });
  }
  return metrics;
}

/** True when the user chosen heap interval allows a new on demand snapshot: the frequency bound stays a user choice only and an absent interval always allows the capture. */
export function heapintervalallowed(lastcapturedat: number | undefined, interval: number | undefined, now: number): boolean {
  if (interval === undefined || lastcapturedat === undefined) return true;
  return now - lastcapturedat >= interval;
}

/** Captures one on demand heap snapshot record with its byte size, node count and capture time; the counts derive from the page performance memory buffer and the dom node count because no heap profiler exists without the debugger permission. */
export function heapsnap(input: { id: string; runid: string; stepid: string; origin: string; usedbytes: number; limitbytes: number; nodecount: number; now: number }): heaprecord {
  return { id: input.id, runid: input.runid, stepid: input.stepid, origin: input.origin, bytesize: input.usedbytes, nodecount: input.nodecount, capturedat: input.now };
}

/** Records one heap growth sample taken beside a step with the used and limit bytes of the page memory buffer. */
export function growsampleof(input: { id: string; runid: string; stepid: string; usedbytes: number; limitbytes: number; now: number }): growsample {
  return { id: input.id, runid: input.runid, stepid: input.stepid, usedbytes: input.usedbytes, limitbytes: input.limitbytes, at: input.now };
}

/** Computes the growth trend of the heap samples: the slope in bytes per millisecond from the first to the last sample, the sample count and the flagged steps whose per step growth exceeds the reviewed slope. */
export function growthtrend(input: { runid: string; samples: growsample[]; slope: number; now: number }): memorytrend {
  const ordered = [...input.samples].sort((left, right) => left.at - right.at);
  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  const computed = first !== undefined && last !== undefined && last.at > first.at ? (last.usedbytes - first.usedbytes) / (last.at - first.at) : 0;
  const flaggedsteps: string[] = [];
  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const current = ordered[index];
    if (previous === undefined || current === undefined) continue;
    const growth = current.at > previous.at ? (current.usedbytes - previous.usedbytes) / (current.at - previous.at) : 0;
    if (growth > input.slope && !flaggedsteps.includes(current.stepid)) flaggedsteps.push(current.stepid);
  }
  return { runid: input.runid, slope: computed, samples: ordered.length, flaggedsteps, at: input.now };
}

/** One cpu sample of the profiled window: the observed function name and the sampled time in milliseconds. */
export interface cpusample {
  name: string;
  time: number;
}

/** Captures one cpu profile record around the step window: the profiled duration, the sample count and the hot functions ranked by their accumulated sampled time; the samples derive from the long task attribution and event timing buffers because no sampling profiler exists without the debugger permission. */
export function cpusnap(input: { id: string; runid: string; stepid: string; origin: string; duration: number; samples: cpusample[]; now: number }): cpuprofile {
  const ranked = new Map<string, number>();
  for (const sample of input.samples) ranked.set(sample.name, (ranked.get(sample.name) ?? 0) + sample.time);
  const hotfunctions = [...ranked.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).map(entry => entry[0]);
  return { id: input.id, runid: input.runid, stepid: input.stepid, origin: input.origin, duration: input.duration, samplecount: input.samples.length, hotfunctions, at: input.now };
}

/** Normalizes one observed layout shift entry: the shift score, the start time and the impacted element selectors derived from the shift sources of the page observer. */
export function shiftentryof(value: unknown): shiftentry | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const score = typeof entry.score === "number" && Number.isFinite(entry.score) && entry.score >= 0 ? entry.score : undefined;
  const starttime = typeof entry.starttime === "number" && Number.isFinite(entry.starttime) ? entry.starttime : undefined;
  if (score === undefined || starttime === undefined) return undefined;
  const selectors = Array.isArray(entry.selectors) ? entry.selectors.filter((selector): selector is string => typeof selector === "string" && selector.trim().length > 0) : [];
  return { id: typeof entry.id === "string" ? entry.id : "", runid: typeof entry.runid === "string" ? entry.runid : "", stepid: typeof entry.stepid === "string" ? entry.stepid : "", score, starttime, selectors, at: typeof entry.at === "number" ? entry.at : starttime };
}

/** Starts one trace record of the flow with the reviewed category list; the record stops at the reviewed window end and the exported file derives from the performance timeline buffers. */
export function tracestart(input: { id: string; runid: string; stepid: string; origin: string; categories: string[]; now: number }): tracerecord {
  return { id: input.id, runid: input.runid, stepid: input.stepid, origin: input.origin, categories: [...new Set(input.categories)], bytesize: 0, events: 0, annotations: [], startedat: input.now, endedat: input.now };
}

/** One derived trace event of the recorded window: the name, the reviewed category and the time offset from the trace start. */
export interface traceevent {
  name: string;
  category: string;
  offset: number;
}

/** Serializes the recorded trace into its exportable file content: the honest derived format of the performance timeline events with the reviewed categories and the step annotations, never the devtools trace binary format. */
export function tracetofile(trace: tracerecord, events: traceevent[]): { content: string; bytesize: number; events: number } {
  const payload = { devthinktrace: "1.1.47", runid: trace.runid, origin: trace.origin, categories: trace.categories, startedat: trace.startedat, endedat: trace.endedat, annotations: trace.annotations, traceevents: events.map(event => ({ name: event.name, cat: event.category, offset: event.offset })) };
  const content = JSON.stringify(payload);
  return { content, bytesize: content.length, events: events.length };
}

/** Normalizes one reviewed trace annotation input: the step id, the label and the time offset from the trace start. */
export function annotationof(value: unknown): traceannotation | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const entry = value as Record<string, unknown>;
  const stepid = typeof entry.stepid === "string" && entry.stepid.trim() ? entry.stepid.trim() : undefined;
  const label = typeof entry.label === "string" && entry.label.trim() ? entry.label.trim() : undefined;
  if (stepid === undefined || label === undefined) return undefined;
  const offset = typeof entry.offset === "number" && Number.isFinite(entry.offset) && entry.offset >= 0 ? entry.offset : 0;
  return { stepid, label, offset };
}

/** Writes the reviewed step ids and labels into the trace metadata: every annotation aligns with the run timeline entry of its step so the replay view shows the trace beside the reviewed steps; exported traces without step annotations are refused upstream. */
export function annotatetrace(input: { trace: tracerecord; annotations: traceannotation[]; timeline: Array<{ stepid: string; time: number }>; now: number }): tracerecord {
  const aligned = input.annotations.map(annotation => {
    const entry = input.timeline.find(item => item.stepid === annotation.stepid);
    if (entry === undefined) return annotation;
    return { ...annotation, offset: Math.max(0, entry.time - input.trace.startedat) };
  });
  return { ...input.trace, annotations: aligned, endedat: Math.max(input.trace.endedat, input.now) };
}

/** The offline replay of one captured trace file: the events, the category counts and the step annotations of the file render without a live browser. */
export function replaytrace(content: string): { traceid: string; runid: string; categories: Record<string, number>; events: Array<{ name: string; category: string; offset: number; stepid?: string }>; annotations: traceannotation[] } {
  let parsed: unknown;
  try { parsed = JSON.parse(content); } catch { throw new Error("The trace file is not valid json."); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("The trace file is not a json object.");
  const record = parsed as Record<string, unknown>;
  const runid = typeof record.runid === "string" ? record.runid : "";
  const annotations = Array.isArray(record.annotations) ? record.annotations.flatMap(item => { const annotation = annotationof(item); return annotation !== undefined ? [annotation] : []; }) : [];
  const rawevents = Array.isArray(record.traceevents) ? record.traceevents : [];
  const categories: Record<string, number> = {};
  const events = rawevents.flatMap(item => {
    if (!item || typeof item !== "object") return [];
    const entry = item as Record<string, unknown>;
    if (typeof entry.name !== "string" || typeof entry.cat !== "string" || typeof entry.offset !== "number") return [];
    const offset = entry.offset as number;
    categories[entry.cat] = (categories[entry.cat] ?? 0) + 1;
    const annotation = annotations.find(candidate => Math.abs(candidate.offset - offset) < 1);
    return [{ name: entry.name, category: entry.cat, offset, ...(annotation !== undefined ? { stepid: annotation.stepid } : {}) }];
  });
  return { traceid: typeof record.id === "string" ? record.id : "", runid, categories, events, annotations };
}

/** Resolves the sourceMappingURL declaration of one script source: the map url resolves against the script url and scripts without a declaration have no map to capture. */
export function mapurlof(scripturl: string, source: string): string | undefined {
  const match = /[#@]\s*sourceMappingURL=(\S+)/.exec(source);
  if (match === null || match[1] === undefined) return undefined;
  try { return new URL(match[1], scripturl).toString(); } catch { return undefined; }
}

/** Builds the source map reference drafts of the loaded scripts: every script with a sourceMappingURL declaration gains its map url while the parsed state is decided by the capture. */
export function capturesourcemaps(input: { runid: string; stepid: string; origin: string; scripts: Array<{ url: string; source: string }>; now: number }): sourcemapref[] {
  return input.scripts.flatMap(script => {
    const mapurl = mapurlof(script.url, script.source);
    if (mapurl === undefined) return [];
    return [{ id: `${input.runid}-${script.url}`, runid: input.runid, stepid: input.stepid, origin: input.origin, scripturl: script.url, mapurl, parsed: false, at: input.now }];
  });
}

/** Decodes one base64 vlq segment of a source map mappings field into its integer values. */
function decodevlq(segment: string): number[] | undefined {
  const values: number[] = [];
  let shift = 0;
  let value = 0;
  for (const character of segment) {
    const digit = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(character);
    if (digit < 0) return undefined;
    value += (digit & 31) << shift;
    shift += 5;
    if ((digit & 32) === 0) {
      const negative = (value & 1) === 1;
      values.push(negative ? -(value >>> 1) : value >>> 1);
      value = 0;
      shift = 0;
    }
  }
  return values.length > 0 ? values : undefined;
}

/** Rewrites one stack location through a parsed source map: the minimal mapping lookup decodes the mappings field, walks the generated lines and resolves the original source file and line of the generated position; unparsed maps leave the location untouched. */
export function rewritesourcelocation(input: { url: string; line: number; column?: number }, map: { sources?: string[]; mappings?: string }): { url: string; line: number } | undefined {
  const sources = Array.isArray(map.sources) ? map.sources.filter((source): source is string => typeof source === "string") : [];
  if (sources.length === 0 || typeof map.mappings !== "string" || map.mappings.length === 0) return undefined;
  const lines = map.mappings.split(";");
  if (input.line >= lines.length) return undefined;
  let sourceindex = 0;
  let sourceline = 0;
  for (let line = 0; line <= input.line; line += 1) {
    const linemappings = lines[line];
    if (linemappings === undefined) continue;
    const first = linemappings.split(",")[0] ?? "";
    if (first.length === 0) continue;
    const values = decodevlq(first);
    if (values === undefined || values.length < 4) continue;
    sourceindex = Math.max(0, sourceindex + (values[1] ?? 0));
    sourceline = Math.max(0, sourceline + (values[2] ?? 0));
  }
  const targetmappings = lines[input.line];
  const target = targetmappings !== undefined ? targetmappings.split(",")[0] ?? "" : "";
  if (target.length === 0) return undefined;
  const source = sources[Math.min(sources.length - 1, sourceindex)];
  if (source === undefined) return undefined;
  return { url: source, line: sourceline };
}

/** Expires the heavy profile bytes after the user configured retention window: the snapshot bytes, sample payloads and trace file bytes drop while the byte and node counts, the sample counts, hot functions, category lists and step annotations survive. */
export function expireprofilerecords(input: { heaps: heaprecord[]; profiles: cpuprofile[]; traces: tracerecord[]; retention: number | undefined; now: number }): { heaps: heaprecord[]; profiles: cpuprofile[]; traces: tracerecord[] } {
  const retention = input.retention;
  if (retention === undefined) return { heaps: input.heaps, profiles: input.profiles, traces: input.traces };
  const expired = (at: number): boolean => input.now - at > retention;
  return {
    heaps: input.heaps.map(heap => expired(heap.capturedat) && heap.bytesexpired !== true ? { ...heap, bytesexpired: true } : heap),
    profiles: input.profiles.map(profile => expired(profile.at) && profile.samplesexpired !== true ? { ...profile, samplesexpired: true } : profile),
    traces: input.traces.map(trace => expired(trace.endedat) && trace.bytesexpired !== true ? { ...trace, bytesexpired: true } : trace),
  };
}
