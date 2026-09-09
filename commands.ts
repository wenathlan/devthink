/** The commands module of the 1.1.90 consolidation: every correlated variation of the background command executors for tabs, files, clipboard, downloads and navigation interned in this one file, so the module family carries one surface without duplicate variations. */

/* ── Merged from tabscommand.ts: the 1.1.90 consolidation interns the correlated tabscommand logic here, so no variation of the same file lives beside another. ── */
import type {
  artifactinventoryentry,
  capturename,
  cleanuprule,
  clipentry,
  closedtabrecord,
  deeplinkpattern,
  downloadrecord,
  downloadstate,
  linkbatch,
  mimefilter,
  navpause,
  navtrailentry,
  netlogrecord,
  planprogress,
  preconnecttarget,
  prefetchplan,
  quarantineentry,
  ratelimitwindow,
  safetyverdict,
  scanverdict,
  tabgrouprecord,
  tablayout,
  tabquery,
  tabwatchevent,
  toolstep,
  urlvisit,
} from "./types.js";
import { parseoptions } from "./policy.js";
import { assigntasktab, tasktabs } from "./progress.js";

/**
 * Tabs and windows command logics for reviewed steps.
 * Every correlated rule for tab queries, clone detection, group membership, layouts, snapshots, watchers, badges, discard candidates, switcher order, zoom steps and the task tab budget lives in this file.
 */

/** One serializable live tab shape resolved against the browser tab set. */
export interface tabshape {
  tabid: number;
  url: string;
  title: string;
  index: number;
  windowid: number;
  active: boolean;
  pinned: boolean;
  audible: boolean;
  muted: boolean;
  discarded: boolean;
}

/** One serializable live window shape with bounds, state and profile kind. */
export interface windowshape {
  windowid: number;
  left: number;
  top: number;
  width: number;
  height: number;
  state: "normal" | "maximized" | "minimized" | "fullscreen";
  incognito: boolean;
  focused: boolean;
}

/** Reads the reviewed tabquery of a tabs and windows command step; null when the step reviews none. */
export function parsetabquery(step: toolstep): tabquery | null {
  let options: Record<string, unknown> = {};
  try {
    options = parseoptions(step);
  } catch {
    options = {};
  }
  const value = options.tabquery;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const query = value as Record<string, unknown>;
  return {
    ...(typeof query.url === "string" && query.url ? { url: query.url } : {}),
    ...(typeof query.title === "string" && query.title ? { title: query.title } : {}),
    ...(typeof query.id === "number" && Number.isInteger(query.id) && query.id >= 0 ? { id: query.id } : {}),
    ...(typeof query.pattern === "string" && query.pattern ? { pattern: query.pattern } : {}),
  };
}

/** Matches one reviewed wildcard pattern against a url; `*` spans one path segment and `**` spans any part. The walk stays linear on adversarial patterns because a token table with one dynamic programming pass replaces the compiled regular expression a star storm would catastrophically backtrack. */
export function tabpatternmatches(pattern: string, url: string): boolean {
  const tokens: Array<{ kind: "literal" | "star" | "doublestar"; text: string }> = [];
  let literal = "";
  const flush = (): void => {
    if (literal !== "") {
      tokens.push({ kind: "literal", text: literal });
      literal = "";
    }
  };
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index] ?? "";
    if (character !== "*") {
      literal += character;
      continue;
    }
    if (pattern[index + 1] === "*") {
      flush();
      tokens.push({ kind: "doublestar", text: "" });
      index += 1;
      continue;
    }
    flush();
    tokens.push({ kind: "star", text: "" });
  }
  flush();
  let tail: boolean[] = new Array<boolean>(url.length + 1).fill(false);
  tail[url.length] = true; /* the empty token tail matches only at the end of the url */
  for (let tokenindex = tokens.length - 1; tokenindex >= 0; tokenindex -= 1) {
    const token = tokens[tokenindex]!;
    const current = new Array<boolean>(url.length + 1).fill(false);
    for (let position = url.length; position >= 0; position -= 1) {
      if (token.kind === "literal") {
        current[position] = url.startsWith(token.text, position) && tail[position + token.text.length] === true;
        continue;
      }
      const crosses = token.kind === "star" && position < url.length && url[position] === "/";
      current[position] =
        !crosses && (tail[position] === true || (position < url.length && current[position + 1] === true));
    }
    tail = current;
  }
  return tail[0] === true;
}

/** Resolves one reviewed tabquery against the live tab set: every matcher that exists must hold. */
export function querymatches(query: tabquery, tabs: tabshape[]): tabshape[] {
  return tabs.filter((tab) => {
    if (query.id !== undefined && tab.tabid !== query.id) return false;
    if (query.url !== undefined && tab.url !== query.url) return false;
    if (query.title !== undefined && !tab.title.toLowerCase().includes(query.title.toLowerCase())) return false;
    if (query.pattern !== undefined && !tabpatternmatches(query.pattern, tab.url)) return false;
    return true;
  });
}

/** Normalizes one url for clone comparison by dropping the fragment and trailing slashes. */
export function normalizedtaburl(url: string): string {
  let normalized = url;
  const hash = normalized.indexOf("#");
  if (hash >= 0) normalized = normalized.slice(0, hash);
  while (normalized.length > 1 && normalized.endsWith("/")) normalized = normalized.slice(0, -1);
  return normalized;
}

/** One clone warning: a normalized url shared by more than one open tab. */
export interface clonewarning {
  url: string;
  tabids: number[];
}

/** Detects duplicate tabs by normalized url comparison and returns every url held by more than one tab. */
export function clonetabs(tabs: tabshape[]): clonewarning[] {
  const groups = new Map<string, number[]>();
  for (const tab of tabs) {
    if (!tab.url) continue;
    const key = normalizedtaburl(tab.url);
    groups.set(key, [...(groups.get(key) ?? []), tab.tabid]);
  }
  return [...groups.entries()].filter(([, tabids]) => tabids.length > 1).map(([url, tabids]) => ({ url, tabids }));
}

/** Searches across open tabs by title and url, case insensitive, returning matches in live order. */
export function searchtabmatches(tabs: tabshape[], text: string): tabshape[] {
  const needle = text.trim().toLowerCase();
  if (!needle) return [];
  return tabs.filter((tab) => tab.title.toLowerCase().includes(needle) || tab.url.toLowerCase().includes(needle));
}

/** Lists the tabs that are playing audio: audible or muted but still playing. */
export function audiotabs(tabs: tabshape[]): tabshape[] {
  return tabs.filter((tab) => tab.audible || (tab.muted && tab.audible));
}

/** Returns the inactive, unpinned and not yet discarded tabs a discardtab step may release. */
export function discardcandidates(tabs: tabshape[]): tabshape[] {
  return tabs.filter((tab) => !tab.active && !tab.pinned && !tab.discarded && tab.url.length > 0);
}

/** Restores discarded tabs on demand without losing their urls; every discarded tab keeps its url for reload. */
export function restorediscarded(tabs: tabshape[]): Array<{ tabid: number; url: string }> {
  return tabs.filter((tab) => tab.discarded && tab.url.length > 0).map((tab) => ({ tabid: tab.tabid, url: tab.url }));
}

/** Captures one tab layout with name, tabs, groups, positions and window bounds from the live browser state. */
export function buildlayout(
  name: string,
  tabs: tabshape[],
  windows: windowshape[],
  groups: tabgrouprecord[],
  scratchwindowids: number[],
  at: number,
): tablayout {
  return {
    name,
    tabs: tabs.map((tab) => ({
      url: tab.url,
      title: tab.title,
      pinned: tab.pinned,
      index: tab.index,
      windowid: tab.windowid,
    })),
    groups: groups.map((group) => ({
      name: group.name,
      color: group.color,
      tabids: group.tabids.filter((tabid) => tabs.some((tab) => tab.tabid === tabid)),
      collapsed: group.collapsed,
    })),
    windows: windows.map((item) => ({
      windowid: item.windowid,
      state: {
        bounds: { left: item.left, top: item.top, width: item.width, height: item.height },
        maximized: item.state === "maximized",
        profile: item.incognito ? "incognito" : scratchwindowids.includes(item.windowid) ? "scratch" : "normal",
      },
    })),
    savedat: at,
  };
}

/** Plans the restore of one saved layout: only urls that are not already open come back, in layout order. */
export function layoutrestoreplan(layout: tablayout, openurls: string[]): string[] {
  const open = new Set(openurls.map((url) => normalizedtaburl(url)));
  return layout.tabs.map((tab) => tab.url).filter((url) => url.length > 0 && !open.has(normalizedtaburl(url)));
}

/** Keeps tabgroup membership through moves: member ids survive, their order follows the live tab order and closed members drop out. */
export function regroupaftermoves(groups: tabgrouprecord[], tabs: tabshape[], at: number): tabgrouprecord[] {
  const order = new Map(tabs.map((tab) => [tab.tabid, tab.index]));
  return groups.map((group) => {
    const members = group.tabids.filter((tabid) => order.has(tabid));
    if (members.length === 0) return group;
    const ordered = [...members].sort((left, right) => (order.get(left) ?? 0) - (order.get(right) ?? 0));
    return ordered.length === group.tabids.length && ordered.every((tabid, index) => tabid === group.tabids[index])
      ? group
      : { ...group, tabids: ordered, savedat: at };
  });
}

/** Renames one stored tab group while keeping its color choice, member tabs and collapse state. */
export function renamegroup(groups: tabgrouprecord[], name: string, newname: string, at: number): tabgrouprecord[] {
  return groups.map((group) => (group.name === name ? { ...group, name: newname, savedat: at } : group));
}

/** Counts the task tabs that live inside one window so the close gate can demand review. */
export function tasktabsinwindow(tabs: tabshape[], windowid: number, tasktabids: number[]): number {
  const tasks = new Set(tasktabids);
  return tabs.filter((tab) => tab.windowid === windowid && tasks.has(tab.tabid)).length;
}

/** Selects the tabs a reviewed closepattern may close; the session tab itself is always refused protection. */
export function closeselection(
  query: tabquery,
  tabs: tabshape[],
  sessiontabid: number,
): { targets: tabshape[]; refused: tabshape[] } {
  const matches = querymatches(query, tabs);
  return {
    targets: matches.filter((tab) => tab.tabid !== sessiontabid),
    refused: matches.filter((tab) => tab.tabid === sessiontabid),
  };
}

/** Applies one reviewed zoom step with no code ceiling; a step never crosses zero, so it keeps the current zoom instead. */
export function zoomstep(current: number, direction: "in" | "out", step: number): number {
  const next = direction === "in" ? current + step : current - step;
  return next > 0 ? Number(next.toFixed(4)) : current;
}

/** Resolves the neighbor tab index a switchtab step activates, wrapping at both ends of the window. */
export function switchtarget(
  tabs: tabshape[],
  direction: "next" | "previous",
  currentindex: number,
): number | undefined {
  if (tabs.length === 0) return undefined;
  const offset = direction === "next" ? 1 : -1;
  return (currentindex + offset + tabs.length) % tabs.length;
}

/** Orders the quick switcher list by recency with filter keys; unseen tabs follow in live index order. */
export function switcherlist(
  tabs: tabshape[],
  recency: Array<{ tabid: number; at: number }>,
  filter: string,
): tabshape[] {
  const needle = filter.trim().toLowerCase();
  const matches = needle
    ? tabs.filter((tab) => tab.title.toLowerCase().includes(needle) || tab.url.toLowerCase().includes(needle))
    : [...tabs];
  const lastrun = new Map(recency.map((entry) => [entry.tabid, entry.at]));
  return [...matches].sort((left, right) => {
    const leftat = lastrun.get(left.tabid) ?? -1;
    const rightat = lastrun.get(right.tabid) ?? -1;
    if (leftat !== rightat) return rightat - leftat;
    return left.index - right.index;
  });
}

/** Dispatches the tab events of one watchtab registration into the step result, honoring the reviewed event filters. */
export function watchtabdispatch(events: tabwatchevent[], watchid: string, filters: string[]): tabwatchevent[] {
  const allowed = filters.length > 0 ? new Set(filters) : undefined;
  return events.filter((event) => event.watchid === watchid && (allowed === undefined || allowed.has(event.event)));
}

/** Computes the per task badge from the live progress state of the task. */
export function badgefromprogress(completed: number, total: number): { label: string; done: boolean } {
  if (total <= 0) return { label: "idle", done: false };
  if (completed >= total) return { label: "done", done: true };
  return { label: `${completed}/${total}`, done: false };
}

/** Grades the concurrent task tab budget: a user configured ceiling refuses, an absent ceiling never refuses. */
export function tasktabgauge(
  used: number,
  ceiling: number | undefined,
): { used: number; ceiling: number | undefined; over: boolean } {
  return { used, ceiling, over: ceiling !== undefined && used > ceiling };
}

/** True when a window profile inherits the session origin grants; incognito windows stay separated. */
export function windowprofilegrants(profile: "normal" | "incognito" | "scratch"): boolean {
  return profile !== "incognito";
}

/** Assigns every task tab of the plan progress, used when tabmeta routing records a tab for the plan steps. */
export function assigntasktabs(
  progress: planprogress | undefined,
  planid: string,
  tabids: number[],
  now: number,
): planprogress {
  let next = progress;
  for (const tabid of tabids) next = assigntasktab(next, planid, tabid, now);
  return next ?? { planid, completedsteps: [], tasktabs: [], updatedat: now };
}

/** Returns the task tabs tracked by one plan progress, used for window close review and badge refresh. */
export function trackedtasktabs(progress: planprogress | undefined, planid: string): number[] {
  return tasktabs(progress, planid);
}

/* ── Merged from filescommand.ts: the 1.1.90 consolidation interns the correlated filescommand logic here, so no variation of the same file lives beside another. ── */
import { checksum } from "./data.js";

/**
 * Files, clipboard and downloads command logics for the background executors.
 * Every correlated rule for batch queue state transitions, filename conflicts, verification matching, mime interception with the deny default, netlog correlation and header redaction, clipboard entry hashing, quarantine paths and scan verdicts, capture naming counters and cleanup sweeps lives in this file.
 */

/** Legal batch queue transitions between the download states. */
const downloadtransitions: Record<downloadstate, downloadstate[]> = {
  queued: ["running", "complete", "failed"],
  running: ["paused", "complete", "failed"],
  paused: ["running", "failed"],
  complete: [],
  failed: [],
};

/** True when the batch queue allows the transition between two download states. */
export function transitionallowed(from: downloadstate, to: downloadstate): boolean {
  return downloadtransitions[from].includes(to);
}

/** Applies one batch queue state transition with its path, bytes, checksum and browser download id evidence; impossible transitions leave the record untouched. */
export function advancedownload(
  record: downloadrecord,
  state: downloadstate,
  at: number,
  evidence?: { path?: string; bytes?: number; checksum?: string; downloadid?: number },
): downloadrecord {
  if (!transitionallowed(record.state, state)) return record;
  return {
    ...record,
    state,
    ...(evidence?.path !== undefined
      ? { path: evidence.path }
      : record.path !== undefined
        ? { path: record.path }
        : {}),
    ...(evidence?.bytes !== undefined
      ? { bytes: evidence.bytes }
      : record.bytes !== undefined
        ? { bytes: record.bytes }
        : {}),
    ...(evidence?.checksum !== undefined
      ? { checksum: evidence.checksum }
      : record.checksum !== undefined
        ? { checksum: record.checksum }
        : {}),
    ...(evidence?.downloadid !== undefined
      ? { downloadid: evidence.downloadid }
      : record.downloadid !== undefined
        ? { downloadid: record.downloadid }
        : {}),
    updatedat: at,
  };
}

/** True when the batch queue may start another download under the user configured concurrent choice; an absent window never blocks. */
export function concurrentwindow(running: number, ceiling: number | undefined): boolean {
  return ceiling === undefined || running < ceiling;
}

/** Resolves a filename conflict with a sequence suffix while keeping the extension intact. */
export function conflictfree(filename: string, taken: string[]): string {
  if (!taken.includes(filename)) return filename;
  const dot = filename.lastIndexOf(".");
  const base = dot > 0 ? filename.slice(0, dot) : filename;
  const extension = dot > 0 ? filename.slice(dot) : "";
  let sequence = 2;
  while (taken.includes(`${base}-${sequence}${extension}`)) sequence += 1;
  return `${base}-${sequence}${extension}`;
}

/** Derives the download filename of one reviewed url from the spec filename rule or the url basename. */
export function downloadfilename(url: string, rule: string | undefined): string {
  if (rule && rule.trim()) return rule.trim();
  let name = "";
  try {
    const parsed = new URL(url);
    name = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() ?? parsed.hostname);
  } catch {
    name = url;
  }
  return name || "download";
}

/** Verifies one completed download against the reviewed size and checksum expectations. */
export function verifybytes(
  record: downloadrecord,
  expected: { bytes?: number; checksum?: string },
): { ok: boolean; summary: string; matches: { state: boolean; size: boolean; checksum: boolean } } {
  const statematch = record.state === "complete";
  const sizematch = expected.bytes === undefined ? true : record.bytes === expected.bytes;
  const checksummatch = expected.checksum === undefined ? true : record.checksum === expected.checksum;
  const ok = statematch && sizematch && checksummatch;
  const parts = [`state ${record.state}${statematch ? " matches" : " does not match the completed expectation"}`];
  if (expected.bytes !== undefined)
    parts.push(`size ${record.bytes ?? "unknown"} of ${expected.bytes} bytes ${sizematch ? "matches" : "differs"}`);
  if (expected.checksum !== undefined)
    parts.push(
      `checksum ${record.checksum ?? "unknown"} ${checksummatch ? "matches" : "differs from"} the reviewed ${expected.checksum}`,
    );
  return {
    ok,
    summary: `${ok ? "Verified" : "Failed to verify"} the download of ${record.filename}: ${parts.join("; ")}.`,
    matches: { state: statematch, size: sizematch, checksum: checksummatch },
  };
}

/** Matches one reviewed mime pattern with a trailing * wildcard against a mime type. */
function mimepatternmatches(pattern: string, mime: string): boolean {
  if (!pattern.endsWith("*")) return pattern === mime;
  return mime.startsWith(pattern.slice(0, -1));
}

/** True when the mime type passes the reviewed filter: exclude wins, then include, then the default for unlisted mime types. */
export function mimeallowed(filter: mimefilter, mime: string): boolean {
  if (filter.exclude.some((pattern) => mimepatternmatches(pattern, mime))) return false;
  if (filter.include.some((pattern) => mimepatternmatches(pattern, mime))) return true;
  return filter.default === "allow";
}

/** Redacts every header value of a captured request so exported netlogs never leak them. */
export function redactheaders(headers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(headers).map(([name]) => [name, "[redacted]"]));
}

/** Builds one netlog record correlated with its step through the request id. */
export function netlogentry(input: {
  url: string;
  method: string;
  status: number;
  timing: number;
  requestid: string;
  stepid: string;
  at: number;
}): netlogrecord {
  return {
    url: input.url,
    method: input.method,
    status: input.status,
    timing: input.timing,
    requestid: input.requestid,
    stepid: input.stepid,
    at: input.at,
  };
}

/** Returns the netlog records of one step, oldest first, correlated through the request ids. */
export function netlogforstep(records: netlogrecord[], stepid: string): netlogrecord[] {
  return records.filter((record) => record.stepid === stepid);
}

/** Builds one clipboard entry from the payload hash and length; the payload text itself never persists. */
export function clipentryof(
  kind: clipentry["kind"],
  payload: { hash: string; length: number },
  origin: string,
  stepid: string,
  at: number,
): clipentry {
  return { kind, hash: payload.hash, length: payload.length, origin, stepid, at };
}

/** Hashes one clipboard payload so audits and memory carry the hash only. */
export function cliphash(payload: string): string {
  return checksum(payload);
}

/** Routes a quarantined path outside the downloads folder until release; traversal segments and backslashes never enter the routed path so the quarantine folder never opens onto another folder. */
export function quarantinedpath(filename: string): string {
  const routed = filename
    .replace(/\\/g, "/")
    .split("/")
    .filter((part) => part !== "" && part !== "." && part !== ".." && part.trim() !== "")
    .join("/");
  return `devthink-quarantine/${routed}`;
}

/** Builds one quarantine entry outside the downloads folder with a pending scan verdict. */
export function newquarantine(id: string, filename: string, reason: string, at: number): quarantineentry {
  const path = quarantinedpath(filename);
  return { id, path, reason, scan: "pending", at, updatedat: at };
}

/** Applies one scan verdict to a quarantined entry; hook failures stay pending instead of releasing. */
export function scanresult(entry: quarantineentry, verdict: scanverdict, at: number): quarantineentry {
  return { ...entry, scan: verdict, updatedat: at };
}

/** Maps one scanning hook response to its verdict; absent or malformed responses stay pending as hook failures. */
export function scanverdictof(response: unknown): scanverdict {
  if (!response || typeof response !== "object") return "pending";
  const verdict = (response as Record<string, unknown>).verdict;
  if (verdict === "clean" || verdict === "flagged" || verdict === "error") return verdict;
  return "pending";
}

/** Stamps the release ref of one quarantined entry after the policy gate approved it. */
export function released(entry: quarantineentry, ref: string, at: number): quarantineentry {
  return { ...entry, release: ref, updatedat: at };
}

/** Trims the leading and trailing dashes of one slug part with a single linear scan, because a polynomial dash expression over library input answers attacker paced backtracking. */
function trimdashes(value: string): string {
  let start = 0;
  let end = value.length;
  while (start < end && value.charCodeAt(start) === 45) start += 1;
  while (end > start && value.charCodeAt(end - 1) === 45) end -= 1;
  return value.slice(start, end);
}

/** Normalizes one capture name part into a filename safe lowercase slug. */
function capturepart(value: string): string {
  return trimdashes(value.replace(/[^a-z0-9-]+/gi, "-")).toLowerCase() || "capture";
}

/** Builds one consistent capture filename from its task, step and sequence parts. */
export function capturefilename(name: capturename, extension: string): string {
  const safeextension = extension.replace(/^\.+/, "").toLowerCase() || "png";
  return `${capturepart(name.task)}-${capturepart(name.step)}-${name.sequence}.${safeextension}`;
}

/** Advances the capture naming counter of one step base and returns the stamped sequence. */
export function advancecounter(
  counters: Record<string, number>,
  base: string,
): { sequence: number; counters: Record<string, number> } {
  const sequence = (counters[base] ?? 0) + 1;
  return { sequence, counters: { ...counters, [base]: sequence } };
}

/** Stamps consistent capture names for the steps of one task with per task counters. */
export function capturenames(
  counters: Record<string, number>,
  task: string,
  steps: string[],
  extension: string,
): { names: string[]; counters: Record<string, number> } {
  let current = { ...counters };
  const names = steps.map((step) => {
    const advanced = advancecounter(current, step);
    current = advanced.counters;
    return capturefilename({ task, step, sequence: advanced.sequence }, extension);
  });
  return { names, counters: current };
}

/** Collects the artifact references of open review cards so the cleanup sweeper keeps them. */
export function referencedartifacts(
  plan: { steps: Array<{ id: string; kind: string; value?: string }> } | undefined,
  completed: string[],
): string[] {
  if (!plan) return [];
  return plan.steps
    .filter((step) => step.kind === "attachfile" && !completed.includes(step.id))
    .map((step) => step.value ?? "")
    .filter((value) => value.trim().length > 0);
}

/** Plans one cleanup sweep by age and kind while keeping referenced artifacts and honoring the keep policies. */
export function sweepplan(
  entries: artifactinventoryentry[],
  rules: cleanuprule[],
  now: number,
  keeprefs: string[],
): { remove: string[]; keep: string[] } {
  const remove = new Set<string>();
  for (const rule of rules) {
    const matching = entries.filter((entry) => rule.kind === "any" || entry.kind === rule.kind);
    const aged = matching.filter((entry) => now - entry.at >= rule.age);
    const kept: artifactinventoryentry[] = [];
    if (rule.keep === "all") kept.push(...aged);
    else if (rule.keep === "latest") {
      const newest = [...aged].sort((left, right) => right.at - left.at)[0];
      if (newest) kept.push(newest);
    }
    for (const entry of aged) {
      if (kept.some((item) => item.id === entry.id)) continue;
      if (keeprefs.includes(entry.id) || keeprefs.includes(entry.name)) continue;
      remove.add(entry.id);
    }
  }
  return { remove: [...remove], keep: entries.filter((entry) => !remove.has(entry.id)).map((entry) => entry.id) };
}

/** Reads the step ids a namecaptures step should stamp from its options or the plan steps. */
export function capturesteps(options: Record<string, unknown>, plan: { steps: toolstep[] }): string[] {
  const listed = Array.isArray(options.steps)
    ? options.steps.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  return listed.length > 0 ? listed : plan.steps.map((step) => step.id);
}

/* ── Merged from navigation.ts: the 1.1.90 consolidation interns the correlated navigation logic here, so no variation of the same file lives beside another. ── */
/**
 * Navigation intelligence logic of the 1.1.74 family.
 * Every correlated rule for the predicted prefetching of the next pages, the read only preconnection of expected origins, the deep link patterns of the common web apps, the closed tab reopening under a grant recheck, the navigation trail restoration from the urlhistory, the consent aware navigation pause with its pending queue, the per domain navigation rate windows, the clipboard url opening behind a user gesture, the url safety verification with lookalike heuristics and the curated batch opening with one tab per link lives in this file.
 * The navigation layer never bypasses a review: navintent and prefetchpage stay read only observations that issue no request on their own, prefetchpage never fires a mutating request while warming and drops its predictions the moment the plan they came from changes, preconnectorigin opens sockets that stay read only and revocable and honor the host grants of the session, deeplinkapp builds its urls only from reviewed parameters against the target origin grant, reopentab refuses a tab whose origin lost its grant, pausenavconsent freezes every navigation kind while a consent prompt is open and queues the pending navigation until the answer, navratelimit delays a full window instead of dropping the navigation silently with the window size and the ceiling staying user choices, openclipboardurl requires the origin grant before opening, checksafeurl refuses the hosts that imitate the granted origins, and batchopenlinks verifies every url before one tab opens while the batch size bound stays the user's choice with no hardcoded ceiling.
 */

/** Reads the hostname of one url for the per domain navigation accounting; an unparsable url carries none. */
function hostof(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

/** Reads the origin of one url for the grant checks; an unparsable url carries none. */
function originof(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

/** Predicts the next urls of an approved plan: the navigation values of the steps are read in step order, the urlhistory of the run weighs every candidate by how often the run already visited it, and the predictions rank by the combined step order and history confidence so the reviewer reads exactly which pages the plan is about to need. */
export function navintent(input: { id: string; steps: toolstep[]; visits?: urlvisit[]; now: number }): prefetchplan {
  if (input.id.trim() === "")
    throw new Error("The navintent prediction needs its id; every prefetch plan carries its identity.");
  const candidates: string[] = [];
  for (const step of input.steps) {
    const value = (step.value ?? "").trim();
    if (value === "" || !value.startsWith("https://")) continue;
    if (!candidates.includes(value)) candidates.push(value);
  }
  const visits = input.visits ?? [];
  const scored = candidates.map((url, index) => {
    const frequency = visits.filter((visit) => visit.url === url).length;
    const stepcomponent = candidates.length > 0 ? (candidates.length - index) / candidates.length : 0;
    const historycomponent = frequency / (frequency + 1);
    return { url, confidence: Math.round(((stepcomponent + historycomponent) / 2) * 1000) / 1000, order: index };
  });
  const predictedurls = scored
    .sort((one, two) => two.confidence - one.confidence || one.order - two.order)
    .map((entry) => ({ url: entry.url, confidence: entry.confidence }));
  return { id: input.id.trim(), predictedurls, createdat: input.now };
}

/** Warms the predicted next pages through speculative dns: the warming set keeps only the urls the session grants cover, a stored plan whose planid differs from the live plan drops every prediction it carried because stale predictions never warm a page the new plan no longer visits, and the module itself issues no request at all — the page world resolves the dns hints read only while no mutating request ever fires during the warming. */
export function prefetchpage(input: {
  id: string;
  planid: string;
  urls: string[];
  grants: string[];
  stored?: prefetchplan;
  now: number;
}): { plan: prefetchplan; allowed: string[]; refused: string[]; dropped: string[] } {
  if (input.id.trim() === "")
    throw new Error("The prefetch warming needs its id; every prefetch plan carries its identity.");
  if (input.planid.trim() === "")
    throw new Error("The prefetch warming names the plan it warms for; predictions without their plan drop.");
  const dropped: string[] =
    input.stored !== undefined && input.stored.planid !== undefined && input.stored.planid !== input.planid.trim()
      ? input.stored.predictedurls.map((entry) => entry.url)
      : [];
  const allowed: string[] = [];
  const refused: string[] = [];
  for (const url of input.urls) {
    const origin = originof(url);
    if (origin !== "" && input.grants.includes(origin)) {
      if (!allowed.includes(url)) allowed.push(url);
      continue; /* a granted duplicate warms once; a duplicate stays allowed and never lands in the refused list */
    }
    if (!refused.includes(url)) refused.push(url);
  }
  const plan: prefetchplan = {
    id: input.id.trim(),
    planid: input.planid.trim(),
    predictedurls: allowed.map((url) => ({
      url,
      confidence: input.stored?.predictedurls.find((entry) => entry.url === url)?.confidence ?? 0.5,
    })),
    createdat: input.now,
  };
  return { plan, allowed, refused, dropped };
}

/** Opens the read only sockets of the expected origins ahead of the steps that need them: only the origins the session grants cover may preconnect, every target carries the time its connection is expected, and every socket stays read only and revocable because a preconnect warms the transport and never carries a request of its own. */
export function preconnectorigin(input: { origins: string[]; grants: string[]; now: number }): {
  targets: preconnecttarget[];
  refused: string[];
} {
  const targets: preconnecttarget[] = [];
  const refused: string[] = [];
  for (const origin of input.origins) {
    const candidate = origin.trim();
    if (candidate === "") continue;
    if (!input.grants.includes(candidate)) {
      if (!refused.includes(candidate)) refused.push(candidate);
      continue;
    }
    if (targets.some((target) => target.origin === candidate)) continue;
    targets.push({ origin: candidate, expectedat: input.now, connected: true });
  }
  return { targets, refused };
}

/** The built in deep link patterns of the common web apps: every entry names its app, the origin its route builds into, the route template with its named parameters and the parameter names a reviewed step must supply. */
const deeplinkcatalog: deeplinkpattern[] = [
  { app: "github", origin: "https://github.com", route: "/{owner}/{repo}", params: ["owner", "repo"] },
  { app: "github", origin: "https://github.com", route: "/{owner}", params: ["owner"] },
  { app: "youtube", origin: "https://www.youtube.com", route: "/watch?v={id}", params: ["id"] },
  { app: "youtube", origin: "https://www.youtube.com", route: "/results?search_query={search}", params: ["search"] },
  { app: "maps", origin: "https://www.google.com", route: "/maps/search/{query}", params: ["query"] },
  { app: "wikipedia", origin: "https://en.wikipedia.org", route: "/wiki/{title}", params: ["title"] },
  { app: "amazon", origin: "https://www.amazon.com", route: "/s?k={search}", params: ["search"] },
  { app: "x", origin: "https://x.com", route: "/{user}", params: ["user"] },
];

/** Builds one deep link url of a common web app from its route pattern and the reviewed parameters: the app name resolves into its deeplinkpattern, the first pattern whose named parameters the reviewed step supplies wins, a missing parameter refuses loudly instead of building a half url, and every substituted value encodes so the route stays exactly what the pattern names. */
export function deeplinkapp(input: { app: string; params: Record<string, string>; patterns?: deeplinkpattern[] }): {
  url: string;
  pattern: deeplinkpattern;
} {
  const app = input.app.trim().toLowerCase();
  if (app === "")
    throw new Error("The deep link names its web app; the pattern grammar builds nothing without the app.");
  const patterns = [...(input.patterns ?? []), ...deeplinkcatalog].filter(
    (pattern) => pattern.app.trim().toLowerCase() === app,
  );
  if (patterns.length === 0)
    throw new Error(
      `The deep link pattern of ${input.app.trim()} is not a known web app; the reviewed step names an app the catalog carries.`,
    );
  for (const pattern of patterns) {
    const supplied = pattern.params.map((name) => input.params[name]);
    if (supplied.some((value) => value === undefined || value.trim() === "")) continue;
    let url = `${pattern.origin}${pattern.route}`;
    for (const [index, name] of pattern.params.entries())
      url = url.replaceAll(`{${name}}`, encodeURIComponent((supplied[index] as string).trim()));
    return { url, pattern };
  }
  throw new Error(
    `The deep link pattern of ${app} needs its reviewed parameters ${[...new Set(patterns.flatMap((pattern) => pattern.params))].join(", ")}; the pattern builds no half url.`,
  );
}

/** Restores one recently closed tab from its closedtabrecord: the most recent record the user closed comes back first, an explicit url restores its own record, a record whose origin lost its grant refuses loudly instead of silently reopening, and a reopened record never reopens twice while the retention window keeps it for the audit trail. */
export function reopentab(input: {
  records: closedtabrecord[];
  grants: string[];
  url?: string;
  now: number;
}): closedtabrecord {
  const ordered = [...input.records].sort((one, two) => two.closedat - one.closedat);
  if (input.url !== undefined && input.url.trim() !== "") {
    const wanted = input.url.trim();
    const record = ordered.find((entry) => entry.url === wanted);
    if (!record)
      throw new Error(
        `No closed tab record carries the url ${wanted}; the reopening restores a tab the retention window still remembers.`,
      );
    if (record.reopenedat !== undefined)
      throw new Error(
        `The closed tab record of ${wanted} was already reopened at ${new Date(record.reopenedat).toISOString()}; a reopened record never reopens twice.`,
      );
    if (!input.grants.includes(originof(record.url)))
      throw new Error(
        `The origin ${originof(record.url)} of the closed tab ${wanted} lost its grant; the reopening rechecks the consent and refuses.`,
      );
    return { ...record, reopenedat: input.now };
  }
  const fresh = ordered.filter((entry) => entry.reopenedat === undefined);
  if (fresh.length === 0) {
    if (ordered.length > 0)
      throw new Error("No unopened closed tab record is available to reopen; every remembered tab already came back.");
    throw new Error("No closed tab record is available to reopen; the retention window remembers none.");
  }
  const granted = fresh.find((entry) => input.grants.includes(originof(entry.url)));
  if (!granted)
    throw new Error(
      `The origin ${originof(fresh[0]?.url ?? "")} of the most recently closed tab lost its grant; the reopening rechecks the consent and refuses.`,
    );
  return { ...granted, reopenedat: input.now };
}

/** Rebuilds the navigation trail of one run from its urlhistory for the audit: the visits of the run order by their time, consecutive duplicates fold so the trail reads as the path the run walked, and repeated restores of the same history return the same entries so a replayed trail never doubles itself; the fresh tab replay stays an on demand operation of the executor because the trail itself stays a read only record. */
export function restoretrail(input: { visits: urlvisit[]; runid?: string }): navtrailentry[] {
  const visits =
    input.runid !== undefined && input.runid.trim() !== ""
      ? input.visits.filter((visit) => visit.runid === input.runid)
      : input.visits;
  const ordered = [...visits].sort((one, two) => one.at - two.at || (one.url < two.url ? -1 : 1));
  const entries: navtrailentry[] = [];
  for (const visit of ordered) {
    if (entries.length > 0 && entries[entries.length - 1]?.url === visit.url) continue;
    entries.push({
      url: visit.url,
      at: visit.at,
      ...(input.runid !== undefined && input.runid.trim() !== "" ? { runid: input.runid } : {}),
    });
  }
  return entries;
}

/** Freezes navigation while a consent prompt is open: the pause carries its reason in plain language, a navigation that arrives while the freeze holds queues its url as the pending navigation of the record, and the queued navigation waits for the answer of the prompt instead of dropping silently. */
export function pausenavconsent(input: {
  reason?: string;
  url?: string;
  stepid?: string;
  stored?: navpause;
  now: number;
}): navpause {
  const pausedat = input.stored?.pausedat ?? input.now;
  const reason = input.stored?.reason ?? input.reason ?? "a consent prompt is open";
  const incomingurl = input.url === undefined ? "" : input.url;
  const incoming = incomingurl.trim() !== "";
  const pendingurl = incoming ? incomingurl.trim() : input.stored?.pendingurl;
  const pendingstepid = incoming
    ? input.stepid !== undefined && input.stepid.trim() !== ""
      ? input.stepid.trim()
      : undefined
    : input.stored?.pendingstepid;
  return {
    pausedat,
    reason,
    ...(pendingurl !== undefined ? { pendingurl } : {}),
    ...(pendingstepid !== undefined ? { pendingstepid } : {}),
    updatedat: input.now,
  };
}

/** Resumes the frozen navigation and hands the queued navigation back: the resume returns the pending url the pause held so the executor continues exactly where the consent prompt stopped it, and a resume without a stored pause changes nothing. */
export function resumenavconsent(input: { stored?: navpause; now: number }): { resumed: boolean; queued?: navpause } {
  if (input.stored === undefined || input.stored.pausedat === undefined) return { resumed: false };
  return { resumed: true, queued: input.stored };
}

/** Tracks the navigation count of one domain inside the sliding window: every navigation stamps its hit into the window, the hits older than the user configured window size age out as the window slides forward, a full window delays the navigation for the milliseconds the oldest hit needs to age out and never drops it silently, and an absent window size or ceiling leaves the counting manual because both stay user choices with no code default. */
export function navratelimit(input: {
  stored?: ratelimitwindow;
  url: string;
  now: number;
  window?: number;
  ceiling?: number;
}): { window: ratelimitwindow; allowed: boolean; waitms: number; reason: string } {
  const domain = hostof(input.url);
  if (domain === "")
    throw new Error("The navigation rate window needs its url so the count lands on the right domain.");
  const size =
    input.window !== undefined && Number.isFinite(input.window) && input.window > 0
      ? input.window
      : input.stored?.window;
  const ceiling =
    input.ceiling !== undefined && Number.isInteger(input.ceiling) && input.ceiling >= 1
      ? input.ceiling
      : input.stored?.ceiling;
  const hits = (input.stored?.hits ?? [])
    .filter((hit) => (size === undefined ? hit <= input.now : input.now - hit < size))
    .sort((one, two) => one - two);
  const oldest = hits[0];
  const resetat = size !== undefined ? (oldest !== undefined ? oldest + size : input.now + size) : 0;
  if (size === undefined || ceiling === undefined) {
    const window: ratelimitwindow = {
      domain,
      count: hits.length + 1,
      resetat,
      ...(size !== undefined ? { hits: [...hits, input.now], window: size } : {}),
      ...(ceiling !== undefined ? { ceiling } : {}),
    };
    return {
      window,
      allowed: true,
      waitms: 0,
      reason: `The navigation of ${domain} counts at ${window.count}${ceiling !== undefined ? ` under the user ceiling of ${ceiling}` : " with no user ceiling"}; the sliding window stays a user choice with no code default.`,
    };
  }
  if (hits.length >= ceiling) {
    const waitms = Math.max(1, (oldest ?? input.now) + size - input.now);
    const window: ratelimitwindow = { domain, count: hits.length, resetat, hits, window: size, ceiling };
    return {
      window,
      allowed: false,
      waitms,
      reason: `The sliding window of ${domain} holds ${hits.length} of the ${ceiling} navigation${ceiling === 1 ? "" : "s"} the user allows per ${size} milliseconds; the navigation waits ${waitms} milliseconds for the oldest hit to age out and never drops silently.`,
    };
  }
  const window: ratelimitwindow = {
    domain,
    count: hits.length + 1,
    resetat,
    hits: [...hits, input.now],
    window: size,
    ceiling,
  };
  return {
    window,
    allowed: true,
    waitms: 0,
    reason: `The navigation of ${domain} counts against the sliding window: ${window.count} of ${ceiling} inside ${size} milliseconds.`,
  };
}

/** Reads one url from the clipboard text of an explicit user action: the text must parse into an HTTPS url, the origin of the url must sit inside the session grants before anything opens, and a clipboard that holds anything else refuses loudly instead of guessing. */
export function openclipboardurl(input: { text: string; grants: string[] }): { url: string } {
  const text = input.text.trim();
  let parsed: URL;
  try {
    parsed = new URL(text);
  } catch {
    throw new Error("The clipboard holds no valid url; the opening refuses instead of guessing.");
  }
  if (parsed.protocol !== "https:")
    throw new Error("The clipboard url must use HTTPS; the opening refuses the weaker scheme.");
  const url = parsed.toString();
  if (!input.grants.includes(parsed.origin))
    throw new Error(
      `The origin ${parsed.origin} of the clipboard url sits outside the session grants; the opening requires the origin grant.`,
    );
  return { url };
}

/** Verifies one url for safety: the scheme must stay HTTPS, the url carries no embedded credentials, the host is no private network or raw address, and a host that imitates a granted origin — the granted host embedded in a longer host, joined through hyphens or squatting through punycode — refuses with the reason the ui shows before anything opens. */
export function checksafeurl(input: { url: string; granted?: string[]; now: number }): safetyverdict {
  const reasons: string[] = [];
  let safe = true;
  let parsed: URL;
  try {
    parsed = new URL(input.url);
  } catch {
    return { url: input.url, safe: false, reasons: ["the url does not parse"], at: input.now };
  }
  if (parsed.protocol !== "https:") {
    safe = false;
    reasons.push("the url must use HTTPS");
  }
  if (parsed.username || parsed.password) {
    safe = false;
    reasons.push("the url carries embedded credentials");
  }
  const host = parsed.hostname.toLowerCase();
  const privatelist = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"];
  if (
    privatelist.includes(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^169\.254\./.test(host)
  ) {
    safe = false;
    reasons.push(`the host ${host} is a private network target`);
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || /^\[?[0-9a-f:]+\]?$/i.test(host)) {
    safe = false;
    reasons.push(`the host ${host} is a raw address without a domain`);
  }
  if (host.split(".").some((label) => label.startsWith("xn--"))) {
    safe = false;
    reasons.push(`the host ${host} carries punycode labels a granted origin never uses`);
  }
  for (const granted of input.granted ?? []) {
    let grantedhost = "";
    try {
      grantedhost = new URL(granted).hostname.toLowerCase();
    } catch {
      continue;
    }
    if (grantedhost === "" || host === grantedhost) continue;
    if (host.endsWith(`.${grantedhost}`)) continue;
    const grantedflat = grantedhost.split(".").join("").replaceAll("-", "");
    const imitates =
      host.includes(grantedhost) || (grantedflat !== "" && host.replaceAll("-", "").includes(grantedflat));
    if (imitates) {
      safe = false;
      reasons.push(`the host ${host} imitates the granted origin ${grantedhost}`);
    }
  }
  return { url: input.url, safe, reasons, at: input.now };
}

/** Opens one curated list of links with one tab per link: every url verifies through checksafeurl before anything opens and one unsafe url refuses the whole batch as a curated record that waits for review, the batch size never passes the user configured ceiling because the bound stays a user choice only, and the per domain sliding windows account every open across the whole batch while a full window moves its url into the waits the caller delays on and never drops silently. */
export function batchopenlinks(input: {
  id: string;
  urls: string[];
  grants: string[];
  windows: ratelimitwindow[];
  now: number;
  window?: number;
  sizelimit?: number;
}): {
  batch: linkbatch;
  open: Array<{ url: string; verdict: safetyverdict }>;
  refused: Array<{ url: string; reasons: string[] }>;
  ordered: string[];
  waits: Array<{ url: string; waitms: number }>;
  windows: ratelimitwindow[];
  reason: string;
} {
  if (input.id.trim() === "") throw new Error("The link batch needs its id; every curated batch carries its identity.");
  if (
    input.sizelimit !== undefined &&
    Number.isInteger(input.sizelimit) &&
    input.sizelimit >= 1 &&
    input.urls.length > input.sizelimit
  )
    throw new Error(
      `The batch of ${input.urls.length} url${input.urls.length === 1 ? "" : "s"} passes the user configured ceiling of ${input.sizelimit}; the user raises the ceiling or trims the batch because the bound stays a user choice only.`,
    );
  const batch: linkbatch = { id: input.id.trim(), urls: [...input.urls], grants: [...input.grants], at: input.now };
  const verdicts = input.urls.map((url) => ({
    url,
    verdict: checksafeurl({ url, granted: input.grants, now: input.now }),
  }));
  const refused = verdicts
    .filter((entry) => !entry.verdict.safe)
    .map((entry) => ({ url: entry.url, reasons: entry.verdict.reasons }));
  if (refused.length > 0) {
    return {
      batch,
      open: [],
      refused,
      ordered: [],
      waits: [],
      windows: input.windows,
      reason: `The batch refuses as a whole because ${refused.length} of ${input.urls.length} url${refused.length === 1 ? " is" : "s are"} unsafe; the curated list waits for review before one tab opens.`,
    };
  }
  const open: Array<{ url: string; verdict: safetyverdict }> = [];
  const waits: Array<{ url: string; waitms: number }> = [];
  const windows = [...input.windows];
  for (const entry of verdicts) {
    const domain = hostof(entry.url);
    const storedwindow = windows.find((window) => window.domain === domain);
    const decision = navratelimit({
      ...(storedwindow !== undefined ? { stored: storedwindow } : {}),
      url: entry.url,
      now: input.now,
      ...(input.window !== undefined ? { window: input.window } : {}),
    });
    if (!decision.allowed) {
      waits.push({ url: entry.url, waitms: decision.waitms });
      continue;
    }
    const index = windows.findIndex((window) => window.domain === domain);
    if (index === -1) windows.push(decision.window);
    else windows[index] = decision.window;
    open.push(entry);
  }
  return {
    batch: { ...batch, reviewedat: input.now },
    open,
    refused: [],
    ordered: open.map((entry) => entry.url),
    waits,
    windows,
    reason:
      waits.length > 0
        ? `The batch opens ${open.length} curated url${open.length === 1 ? "" : "s"} with one tab per link while ${waits.length} url${waits.length === 1 ? " waits" : "s wait"} on a full rate window and never drops silently.`
        : `The batch opens ${open.length} curated url${open.length === 1 ? "" : "s"} with one tab per link after every url passed its safety check.`,
  };
}
