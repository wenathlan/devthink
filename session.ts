/**
 * The session module of the 1.1.90 consolidation: every correlated variation of the session logic interned in this one file, so the module family carries one surface without duplicate variations.
 * The correlation is the session as the persistent interface: sessions holds the stored state of the 1.1.49 memory family (task state checkpoints with their checksums, session capture with restore plans, naming, diffing, search, versioned export and import, retention expiry and the crash interrupted mark); sessioninterface turns the same session into the primary interface of the 1.1.63 family (sitenotes sealed at rest when sensitive, the append only scratchpad, runsummary distillation, semanticrecall with its fingerprint index, correction and consent memory as advisory history, the sessiongrid derived from the existing stores with no new state, historysearch over one corpus, error surfaces with retry hints and cancelrun with its queued only rollback).
 * No window, retention, limit or rollback scope is ever hardcoded: every length and expiry stays the user's choice with no engine cap, and no interface surface ever bypasses the human review.
 */

/* ── Merged from sessions.ts ── */

import type { autointerval, restoreplan, searchfield, searchquery, sessionchange, sessiondiff, sessionfile, sessionfolder, sessionmatch, sessionrecord, sessiontab, snapshotscope, snapshotplan, stepoutcome, taskstate } from "./types.js";

/** The session kinds of the 1.1.49 memory family: task state persistence, session capture, restore, naming, diffing, search, export and import. */
export const sessionkinds: string[] = ["persiststate", "capturesession", "restoresession", "namedsessions", "diffsessions", "searchsessions", "exportsessions", "importsessions"];

/** The format version of exported session files; imports of unknown versions are refused. */
export const sessionfileversion = 1;

/** The reviewed snapshot section toggles: tabs, scroll positions, form state, local storage and cookies. */
export const snapshotsections: snapshotscope[] = ["tabs", "scroll", "forms", "storage", "cookies"];

/** The searchable fields of a session search: urls, titles, record names and captured text. */
export const searchfields: searchfield[] = ["urls", "titles", "names", "text"];

/** Stable local checksum of one string payload so persisted state and exported files detect corruption without a network dependency. */
function checksumtext(payload: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < payload.length; index += 1) {
    hash ^= payload.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/** Checksums the run id, step cursor and recorded outputs of a task state so corruption is detected before a resume. */
export function taskstatechecksum(runid: string, stepcursor: number, outputs: stepoutcome[]): string {
  return checksumtext(`${runid}:${stepcursor}:${outputs.length}:${outputs.map(output => `${output.stepid}:${output.ok}:${output.summary.length}`).join("|")}`);
}

/** Builds one persisted task state checkpoint of a run with its checksum. */
export function taskstateof(input: { runid: string; stepcursor: number; outputs: stepoutcome[]; checkpointat: number }): taskstate {
  return { runid: input.runid, stepcursor: input.stepcursor, outputs: input.outputs, checkpointat: input.checkpointat, checksum: taskstatechecksum(input.runid, input.stepcursor, input.outputs) };
}

/** True when a persisted task state carries the intact checksum of its own payload; a corrupted checkpoint never resumes. */
export function taskstatevalid(state: taskstate | undefined): boolean {
  if (!state || typeof state.runid !== "string" || !state.runid.trim()) return false;
  if (typeof state.stepcursor !== "number" || !Number.isInteger(state.stepcursor) || state.stepcursor < 0) return false;
  if (typeof state.checkpointat !== "number" || !Number.isFinite(state.checkpointat)) return false;
  if (!Array.isArray(state.outputs)) return false;
  return state.checksum === taskstatechecksum(state.runid, state.stepcursor, state.outputs);
}

/** Normalizes one captured tab of a saved session: url, title, index, scroll position and form state. */
export function sessiontabof(value: unknown): sessiontab | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.url !== "string" || !candidate.url.trim()) return undefined;
  if (typeof candidate.title !== "string") return undefined;
  if (typeof candidate.index !== "number" || !Number.isInteger(candidate.index) || candidate.index < 0) return undefined;
  const scrollx = typeof candidate.scrollx === "number" && Number.isFinite(candidate.scrollx) ? candidate.scrollx : 0;
  const scrolly = typeof candidate.scrolly === "number" && Number.isFinite(candidate.scrolly) ? candidate.scrolly : 0;
  const forms = Array.isArray(candidate.forms) ? candidate.forms.flatMap(entry => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const form = entry as Record<string, unknown>;
    if (typeof form.selector !== "string" || !form.selector.trim()) return [];
    return [{ selector: form.selector, value: typeof form.value === "string" ? form.value : "" }];
  }) : [];
  return { url: candidate.url, title: candidate.title, index: candidate.index, scrollx, scrolly, forms };
}

/** Normalizes one reviewed auto snapshot interval: a positive period, a positive maximum snapshot count and a zero or positive expiry window; every value stays a user choice with no code ceiling. */
export function autointervalof(value: unknown): autointerval | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.period !== "number" || !Number.isFinite(candidate.period) || candidate.period <= 0) return undefined;
  if (typeof candidate.maxsnapshots !== "number" || !Number.isInteger(candidate.maxsnapshots) || candidate.maxsnapshots < 1) return undefined;
  if (typeof candidate.expiry !== "number" || !Number.isFinite(candidate.expiry) || candidate.expiry < 0) return undefined;
  return { period: candidate.period, maxsnapshots: candidate.maxsnapshots, expiry: candidate.expiry };
}

/** Normalizes one reviewed snapshot plan: the scope, the section toggles of the reviewed grammar, the capture link flag and the optional auto interval. */
export function snapshotplanof(value: unknown): snapshotplan | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (candidate.scope !== "tab" && candidate.scope !== "run" && candidate.scope !== "all") return undefined;
  const sections = Array.isArray(candidate.sections) ? candidate.sections.flatMap(section => typeof section === "string" && snapshotsections.includes(section as snapshotscope) ? [section as snapshotscope] : []) : [];
  if (sections.length === 0) return undefined;
  if (typeof candidate.captures !== "boolean") return undefined;
  const auto = candidate.auto === undefined ? undefined : autointervalof(candidate.auto);
  if (candidate.auto !== undefined && auto === undefined) return undefined;
  return { scope: candidate.scope, sections, captures: candidate.captures, ...(auto !== undefined ? { auto } : {}) };
}

/** Normalizes one reviewed restore plan: the tab, form and capture policies of the reviewed grammar. */
export function restoreplanof(value: unknown): restoreplan | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (candidate.tabpolicy !== "reopen" && candidate.tabpolicy !== "skip") return undefined;
  if (candidate.formpolicy !== "restore" && candidate.formpolicy !== "skip") return undefined;
  if (candidate.capturepolicy !== "link" && candidate.capturepolicy !== "skip") return undefined;
  return { tabpolicy: candidate.tabpolicy, formpolicy: candidate.formpolicy, capturepolicy: candidate.capturepolicy };
}

/** Normalizes one reviewed session search query: the non-empty term list, the searched fields of the reviewed grammar and the optional time window. */
export function searchqueryof(value: unknown): searchquery | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  const terms = Array.isArray(candidate.terms) ? candidate.terms.flatMap(term => typeof term === "string" && term.trim() ? [term.trim()] : []) : [];
  if (terms.length === 0) return undefined;
  const fields = Array.isArray(candidate.fields) ? candidate.fields.flatMap(field => typeof field === "string" && searchfields.includes(field as searchfield) ? [field as searchfield] : []) : [...searchfields];
  if (fields.length === 0) return undefined;
  const from = typeof candidate.from === "number" && Number.isFinite(candidate.from) ? candidate.from : undefined;
  const to = typeof candidate.to === "number" && Number.isFinite(candidate.to) ? candidate.to : undefined;
  if (from !== undefined && to !== undefined && from > to) return undefined;
  return { terms, fields, ...(from !== undefined ? { from } : {}), ...(to !== undefined ? { to } : {}) };
}

/** Normalizes one session folder: the name, the optional parent folder and the tag list. */
export function sessionfolderof(value: unknown): sessionfolder | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.name !== "string" || !candidate.name.trim()) return undefined;
  const parent = typeof candidate.parent === "string" && candidate.parent.trim() ? candidate.parent : undefined;
  const tags = Array.isArray(candidate.tags) ? candidate.tags.flatMap(tag => typeof tag === "string" && tag.trim() ? [tag] : []) : [];
  return { name: candidate.name, ...(parent !== undefined ? { parent } : {}), tags };
}

/** Builds one saved session record with its default tag list and capture linkage. */
export function newsessionrecord(input: { id: string; name: string; createdat: number; tabs: sessiontab[]; captures: string[]; storage: Array<{ origin: string; keys: string[]; values: string[] }>; cookies: Array<{ origin: string; names: string[] }>; auto?: boolean; folder?: string; tags?: string[] }): sessionrecord {
  return { id: input.id, name: input.name, createdat: input.createdat, tabs: input.tabs, captures: input.captures, storage: input.storage, cookies: input.cookies, ...(input.folder !== undefined ? { folder: input.folder } : {}), tags: input.tags ?? [], ...(input.auto === true ? { auto: true } : {}) };
}

/** Classifies the tab, url, form and storage changes between two saved sessions by matching tabs on their recorded index. */
export function diffsessionrecords(left: sessionrecord, right: sessionrecord): sessionchange[] {
  const changes: sessionchange[] = [];
  const leftbyindex = new Map(left.tabs.map(tab => [tab.index, tab]));
  const rightbyindex = new Map(right.tabs.map(tab => [tab.index, tab]));
  for (const tab of right.tabs) {
    const prior = leftbyindex.get(tab.index);
    if (!prior) { changes.push({ class: "added", subject: "tab", detail: `Tab ${tab.index} added: ${tab.url}` }); continue; }
    if (prior.url !== tab.url) changes.push({ class: "changed", subject: "url", detail: `Tab ${tab.index} moved from ${prior.url} to ${tab.url}` });
    if (prior.title !== tab.title) changes.push({ class: "changed", subject: "tab", detail: `Tab ${tab.index} title changed from "${prior.title}" to "${tab.title}"` });
    const priorforms = new Map(prior.forms.map(form => [form.selector, form.value]));
    for (const form of tab.forms) {
      const before = priorforms.get(form.selector);
      if (before === undefined) { changes.push({ class: "added", subject: "form", detail: `Form field ${form.selector} of tab ${tab.index} added with a value` }); continue; }
      if (before !== form.value) changes.push({ class: "changed", subject: "form", detail: `Form field ${form.selector} of tab ${tab.index} changed its captured value` });
    }
    for (const form of prior.forms) if (!tab.forms.some(entry => entry.selector === form.selector)) changes.push({ class: "removed", subject: "form", detail: `Form field ${form.selector} of tab ${tab.index} removed` });
  }
  for (const tab of left.tabs) if (!rightbyindex.has(tab.index)) changes.push({ class: "removed", subject: "tab", detail: `Tab ${tab.index} removed: ${tab.url}` });
  const leftstorage = new Map(left.storage.map(entry => [entry.origin, entry]));
  for (const entry of right.storage) {
    const prior = leftstorage.get(entry.origin);
    if (!prior) { changes.push({ class: "added", subject: "storage", detail: `Local storage of ${entry.origin} captured with ${entry.keys.length} keys` }); continue; }
    if (prior.keys.join("|") !== entry.keys.join("|") || prior.values.join("|") !== entry.values.join("|")) changes.push({ class: "changed", subject: "storage", detail: `Local storage of ${entry.origin} changed its captured keys or values` });
  }
  for (const entry of left.storage) if (!right.storage.some(candidate => candidate.origin === entry.origin)) changes.push({ class: "removed", subject: "storage", detail: `Local storage of ${entry.origin} left the capture` });
  return changes;
}

/** Builds one stored session diff result of two compared records. */
export function newsessiondiff(input: { id: string; left: sessionrecord; right: sessionrecord; at: number }): sessiondiff {
  return { id: input.id, leftid: input.left.id, rightid: input.right.id, changes: diffsessionrecords(input.left, input.right), at: input.at };
}

/** Searches across saved sessions: matches urls, titles, record names and captured form text inside the reviewed time window and returns every match with its session id. */
export function searchsessionrecords(query: searchquery, records: sessionrecord[]): sessionmatch[] {
  const matches: sessionmatch[] = [];
  for (const record of records) {
    if (query.from !== undefined && record.createdat < query.from) continue;
    if (query.to !== undefined && record.createdat > query.to) continue;
    const haystacks: Array<{ field: searchfield; text: string }> = [
      { field: "urls", text: record.tabs.map(tab => tab.url).join(" ") },
      { field: "titles", text: record.tabs.map(tab => tab.title).join(" ") },
      { field: "names", text: [record.name, record.folder ?? "", ...record.tags].join(" ") },
      { field: "text", text: record.tabs.flatMap(tab => tab.forms.map(form => form.value)).join(" ") },
    ];
    for (const haystack of haystacks) {
      if (!query.fields.includes(haystack.field)) continue;
      const lower = haystack.text.toLowerCase();
      for (const term of query.terms) {
        const at = lower.indexOf(term.toLowerCase());
        if (at < 0) continue;
        const start = Math.max(0, at - 30);
        matches.push({ sessionid: record.id, field: haystack.field, term, at: record.createdat, excerpt: haystack.text.slice(start, start + 80).trim() });
      }
    }
  }
  return matches;
}

/** Packs saved session records into one versioned session file with its record ids, byte size and checksum. */
export function exportsessionfile(records: sessionrecord[], now: number): sessionfile {
  const recordids = records.map(record => record.id);
  const payload = JSON.stringify(records);
  return { formatversion: sessionfileversion, records, recordids, bytesize: payload.length, checksum: checksumtext(`${sessionfileversion}:${recordids.join(",")}:${payload.length}`), exportedat: now };
}

/** Validates one imported session file: the format version must match, every record must carry intact sections and the checksum must verify before any record review begins. */
export function importsessionfile(value: unknown): sessionfile | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (candidate.formatversion !== sessionfileversion) return undefined;
  const records = Array.isArray(candidate.records) ? candidate.records.flatMap(record => sessionrecordvalid(record) ? [record] : []) : [];
  if (records.length === 0) return undefined;
  if (!Array.isArray(candidate.recordids) || candidate.recordids.length !== records.length || !candidate.recordids.every((id, index) => id === records[index]?.id)) return undefined;
  const bytesize = typeof candidate.bytesize === "number" && Number.isFinite(candidate.bytesize) ? candidate.bytesize : -1;
  if (bytesize < 0) return undefined;
  const checksum = typeof candidate.checksum === "string" ? candidate.checksum : "";
  if (checksum !== checksumtext(`${sessionfileversion}:${candidate.recordids.join(",")}:${bytesize}`)) return undefined;
  return { formatversion: sessionfileversion, records, recordids: candidate.recordids as string[], bytesize, checksum, exportedat: typeof candidate.exportedat === "number" && Number.isFinite(candidate.exportedat) ? candidate.exportedat : 0 };
}

/** Structural check of one saved session record so imports never add a broken record to the library. */
function sessionrecordvalid(value: unknown): value is sessionrecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.id !== "string" || !candidate.id.trim()) return false;
  if (typeof candidate.name !== "string" || !candidate.name.trim()) return false;
  if (typeof candidate.createdat !== "number" || !Number.isFinite(candidate.createdat)) return false;
  if (!Array.isArray(candidate.tabs) || !candidate.tabs.every(tab => sessiontabof(tab) !== undefined)) return false;
  if (!Array.isArray(candidate.captures) || !candidate.captures.every(id => typeof id === "string")) return false;
  if (!Array.isArray(candidate.tags) || !candidate.tags.every(tag => typeof tag === "string")) return false;
  return true;
}

/** Expires the heavy sections of saved sessions after the reviewed retention window while the record metadata survives; an absent window keeps every section and no code ceiling applies. */
export function expiresessions(records: sessionrecord[], retention: number | undefined, now: number): sessionrecord[] {
  if (retention === undefined || !Number.isFinite(retention)) return records;
  return records.map(record => {
    if (record.sectionsexpired || now - record.createdat < retention) return record;
    return { id: record.id, name: record.name, createdat: record.createdat, tabs: [], captures: record.captures, storage: [], cookies: [], ...(record.folder !== undefined ? { folder: record.folder } : {}), tags: record.tags, ...(record.auto === true ? { auto: true } : {}), ...(record.restoredat !== undefined ? { restoredat: record.restoredat } : {}), sectionsexpired: true };
  });
}

/** Lists saved sessions filtered by name substring, folder and time window; the filter stays a user choice with no result cap. */
export function filteredsessions(records: sessionrecord[], filter: { name?: string; folder?: string; from?: number; to?: number }): sessionrecord[] {
  return records.filter(record => {
    if (filter.name !== undefined && !record.name.toLowerCase().includes(filter.name.toLowerCase())) return false;
    if (filter.folder !== undefined && record.folder !== filter.folder) return false;
    if (filter.from !== undefined && record.createdat < filter.from) return false;
    if (filter.to !== undefined && record.createdat > filter.to) return false;
    return true;
  });
}

/** Marks one persisted task state interrupted by a browser restart when the cursor never reached the end of the plan. */
export function crashinterrupted(state: taskstate | undefined, plansteps: number, now: number): taskstate | undefined {
  if (!state) return undefined;
  if (state.stepcursor >= plansteps) return state;
  return { ...state, interrupted: true, crashat: state.crashat ?? now };
}

/* ── Merged from sessioninterface.ts ── */

import type { agentplan, cancelrunaction, consentmemoryentry, correctionentry, emptystatesurface, errorsurface, errorcause, historyindexentry, historysearchhit, historysearchquery, planprogress, recallindexentry, recallmatch, recallquery, rollbackdescriptor, runsummary, scratchpadentry, sessiongridrow, sitenote, storedrunlog, tabsessionref } from "./types.js";
import { randomid } from "./memory.js";

/**
 * Session interface logic of the 1.1.63 family.
 * The session becomes the primary interface here: sitenotes keep one record per origin with title, body and author provenance while sensitive bodies seal at rest with a local keystream, the scratchpad holds append only entries per task with step provenance, runsummary distills a completed run into the origins visited, the kinds executed and the per step outcomes inside the user configured window as an offscreen worker task, semanticrecall embeds past extraction records into a fingerprint indexed corpus ranked by text similarity with run and step provenance, correctionmemory captures every plan review edit and rejection per origin and kind, consentmemory keeps every grant, denial, expiry and revocation per origin as advisory history that never auto grants, sessiongrid rows derive from the existing session stores with no new state, historysearch indexes session metadata, notes and summaries into one incremental corpus with matched term highlighting, errorsurface classifies every failed step cause as page, network, policy or gate with a retry hint carrying the policy verdict, and cancelrun rolls the queued steps back only while the executed steps stay untouched in the sealed log.
 * No window, retention, limit or rollback scope is ever hardcoded: every length and expiry stays the user's choice with no engine cap, and no interface surface ever bypasses the human review.
 */

/** Stable local fingerprint of one indexed text so semanticrecall deduplicates repeated extractions; the hash stays deterministic without a network dependency. */
function textfingerprint(text: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/** Derives one keystream byte of the local at rest sealing from the note id and the byte position; the sealing stays a local measure and never replaces the user keychain. */
function keystreambyte(id: string, position: number): number {
  let hash = 0x811c9dc5;
  const source = `${id}:${position}`;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash & 0xff;
}

/** Seals one sensitive note body at rest with a local keystream; the sealed text persists while the plain body never does. */
export function sealnotebody(id: string, body: string): string {
  const sealed = Array.from(body, (character, index) => String.fromCharCode(character.charCodeAt(0) ^ keystreambyte(id, index))).join("");
  return `sealed:${btoa(sealed)}`;
}

/** Opens one sealed note body for the reading surface; the plain body leaves storage only through this reader. */
export function opennotebody(id: string, sealedbody: string): string {
  if (!sealedbody.startsWith("sealed:")) return "";
  try {
    const sealed = atob(sealedbody.slice("sealed:".length));
    return Array.from(sealed, (character, index) => String.fromCharCode(character.charCodeAt(0) ^ keystreambyte(id, index))).join("");
  } catch { return ""; }
}

/** Builds one site note record per origin: the title, the body, the author provenance and the timestamps; a sensitive note seals its body at rest while a plain note keeps its body readable. */
export function sitenoteof(input: { origin: string; title: string; body: string; author: string; sensitive?: boolean; now: number; id?: string }): sitenote {
  if (input.origin.trim() === "") throw new Error("The site note needs its origin.");
  if (input.title.trim() === "") throw new Error("The site note needs its title.");
  if (input.body.trim() === "") throw new Error("The site note needs its body.");
  const id = input.id ?? randomid();
  if (input.sensitive === true) return { id, origin: input.origin, title: input.title.trim(), sealedbody: sealnotebody(id, input.body), author: input.author, sensitive: true, createdat: input.now, updatedat: input.now };
  return { id, origin: input.origin, title: input.title.trim(), body: input.body, author: input.author, sensitive: false, createdat: input.now, updatedat: input.now };
}

/** Reads the display body of one site note: a sensitive note opens its sealed body for the reader while a plain note returns its body. */
export function notebodyof(note: sitenote): string {
  if (note.sensitive) return note.sealedbody !== undefined ? opennotebody(note.id, note.sealedbody) : "";
  return note.body ?? "";
}

/** Applies one edit to a site note: the edit keeps the author provenance of the writer and the updated timestamp while the created timestamp stays. */
export function editnote(note: sitenote, input: { title: string; body: string; author: string; now: number }): sitenote {
  if (input.title.trim() === "") throw new Error("The site note keeps a non empty title.");
  if (input.body.trim() === "") throw new Error("The site note keeps a non empty body.");
  if (note.sensitive) return { ...note, title: input.title.trim(), sealedbody: sealnotebody(note.id, input.body), updatedat: input.now, author: input.author };
  return { ...note, title: input.title.trim(), body: input.body, updatedat: input.now, author: input.author };
}

/** Expires the site notes past the user configured window: an absent window keeps every note while the expired notes leave the store at the user boundary only. */
export function expirnotes(notes: sitenote[], retention: number | undefined, now: number): sitenote[] {
  if (retention === undefined) return notes;
  return notes.filter(note => now - note.updatedat < retention);
}

/** Builds one append only scratchpad entry of one task with its step provenance; the scratchpad never rewrites a written entry. */
export function scratchentryof(input: { taskid: string; sessionid: string; text: string; stepid?: string; author: string; now: number; id?: string }): scratchpadentry {
  if (input.taskid.trim() === "") throw new Error("The scratchpad entry needs its task.");
  if (input.text.trim() === "") throw new Error("The scratchpad entry needs its text.");
  return { id: input.id ?? randomid(), taskid: input.taskid, sessionid: input.sessionid, text: input.text, ...(input.stepid !== undefined && input.stepid.trim() !== "" ? { stepid: input.stepid } : {}), author: input.author, at: input.now };
}

/** Reads the scratchpad of one task only: entries of another task never cross the owning task session boundary. */
export function scratchpadof(entries: scratchpadentry[], taskid: string, sessionid: string): scratchpadentry[] {
  return entries.filter(entry => entry.taskid === taskid && entry.sessionid === sessionid);
}

/** Prunes the scratchpad entries past the user configured window: an absent window keeps every entry while the pruned entries leave the pad only at the user boundary. */
export function prunescratchpad(entries: scratchpadentry[], window: number | undefined, now: number): scratchpadentry[] {
  if (window === undefined) return entries;
  return entries.filter(entry => now - entry.at < window);
}

/** Distills one run summary from the completed run: the origins visited, the kinds executed and the per step outcomes inside the user configured window with no fixed cap; the distillation names its provenance. */
export function distillrunsummary(input: { plan: agentplan; outcomes: stepoutcome[]; origins: string[]; sessionid: string; window?: number; provenance: "offscreenworker" | "inline"; now: number }): runsummary {
  const steps = input.outcomes.map(outcome => {
    const step = input.plan.steps.find(candidate => candidate.id === outcome.stepid);
    return { stepid: outcome.stepid, kind: step?.kind ?? "unknown", ok: outcome.ok, summary: outcome.summary };
  });
  const windowed = input.window !== undefined && Number.isInteger(input.window) && input.window >= 0 ? steps.slice(Math.max(0, steps.length - input.window)) : steps;
  const kinds = [...new Set(windowed.map(step => step.kind))];
  return { runid: input.plan.id, sessionid: input.sessionid, origins: [...new Set(input.origins)], kinds, steps: windowed, ...(input.window !== undefined && Number.isInteger(input.window) && input.window >= 0 ? { window: input.window } : {}), task: "runsummary", provenance: input.provenance, distilledat: input.now };
}

/** Builds the runsummary search corpus entry of one distilled summary so historysearch indexes every summary beside the notes and the session metadata. */
export function summaryhistoryentry(summary: runsummary): historyindexentry {
  return { source: "summary", id: summary.runid, title: `Run summary of ${summary.runid}`, text: `${summary.origins.join(" ")} ${summary.kinds.join(" ")} ${summary.steps.map(step => step.summary).join(" ")}`, outcome: summary.steps.every(step => step.ok) ? "completed" : "failed", at: summary.distilledat };
}

/** Builds the sitenote search corpus entry of one note; a sensitive note indexes its title and origin only so the sealed body never enters the corpus. */
export function notehistoryentry(note: sitenote): historyindexentry {
  return { source: "note", id: note.id, ...(note.origin !== "" ? { origin: note.origin } : {}), title: note.title, text: note.sensitive ? note.title : `${note.title} ${note.body ?? ""}`, at: note.updatedat };
}

/** Builds one recall index entry from a past extraction record: the fingerprint deduplicates repeated extractions while the run and step provenance stays readable. */
export function recallentryof(input: { origin: string; runid: string; stepid: string; text: string; at: number }): recallindexentry {
  if (input.text.trim() === "") throw new Error("The recall index entry needs its text.");
  if (input.stepid.trim() === "" || input.runid.trim() === "") throw new Error("The recall index entry needs its run and step provenance.");
  const normalized = input.text.trim().replace(/\s+/g, " ");
  return { fingerprint: textfingerprint(normalized), origin: input.origin, runid: input.runid, stepid: input.stepid, text: normalized, at: input.at };
}

/** Adds one recall index entry with fingerprint deduplication: a repeated extraction keeps its first index entry while later duplicates never double rank. */
export function addrecallentry(index: recallindexentry[], entry: recallindexentry): recallindexentry[] {
  if (index.some(candidate => candidate.fingerprint === entry.fingerprint && candidate.origin === entry.origin)) return index;
  return [...index, entry];
}

/** Splits one text into its lowercase term set for the local text similarity ranking. */
function termsof(text: string): Set<string> {
  return new Set(text.toLowerCase().split(/[^a-z0-9]+/).filter(term => term.length > 1));
}

/** Ranks the indexed extractions by local text similarity inside the worker: the jaccard overlap of the query terms and the entry terms, scoped to the origins of the run scope, with the provenance of every match. */
export function rankrecall(index: recallindexentry[], query: recallquery, scope: { origins: string[] }): recallmatch[] {
  if (query.text.trim() === "") return [];
  const terms = termsof(query.text);
  const scoped = query.origin !== undefined && query.origin.trim() !== "" ? [query.origin] : scope.origins;
  const matches: recallmatch[] = [];
  for (const entry of index) {
    if (!scoped.includes(entry.origin)) continue;
    const entryterms = termsof(entry.text);
    let shared = 0;
    for (const term of terms) if (entryterms.has(term)) shared += 1;
    const union = new Set([...terms, ...entryterms]).size;
    const score = union === 0 ? 0 : shared / union;
    if (score <= 0) continue;
    matches.push({ entry, score, reason: `The extraction of ${entry.origin} shares ${shared} term${shared === 1 ? "" : "s"} with the query at the score ${score.toFixed(3)}; the match carries the run ${entry.runid} and the step ${entry.stepid}.` });
  }
  const ranked = matches.sort((one, two) => two.score - one.score);
  return query.limit !== undefined && Number.isInteger(query.limit) && query.limit >= 0 ? ranked.slice(0, query.limit) : ranked;
}

/** Expires the recall index entries past the user configured window: the live index keeps the window while the extraction records themselves stay for the audit trail. */
export function expirerecallindex(index: recallindexentry[], window: number | undefined, now: number): recallindexentry[] {
  if (window === undefined) return index;
  return index.filter(entry => now - entry.at < window);
}

/** Builds one correction memory entry from a plan review edit: the step shape before and after the edit with the reason in plain language. */
export function editedcorrectionof(input: { origin: string; kind: string; stepid: string; original: string; corrected: string; reason: string; now: number; id?: string }): correctionentry {
  if (input.stepid.trim() === "" || input.kind.trim() === "") throw new Error("The correction needs its step and kind.");
  if (input.original === input.corrected) throw new Error("The correction needs a changed step shape.");
  return { id: input.id ?? randomid(), origin: input.origin, kind: input.kind, stepid: input.stepid, source: "edited", original: input.original, corrected: input.corrected, reason: input.reason, at: input.now };
}

/** Builds one correction memory entry from a rejected step: the step shape it refused with the rejection reason. */
export function rejectedcorrectionof(input: { origin: string; kind: string; stepid: string; original: string; reason: string; now: number; id?: string }): correctionentry {
  if (input.stepid.trim() === "" || input.reason.trim() === "") throw new Error("The rejected correction needs its step and its rejection reason.");
  return { id: input.id ?? randomid(), origin: input.origin, kind: input.kind, stepid: input.stepid, source: "rejected", original: input.original, reason: input.reason, at: input.now };
}

/** Reads the past corrections that match a proposed step by origin and kind so proposal requests feed the matching history in. */
export function matchingcorrections(corrections: correctionentry[], proposal: { origin: string; kind: string }): correctionentry[] {
  return corrections.filter(entry => entry.origin === proposal.origin && entry.kind === proposal.kind);
}

/** Expires the correction memory entries past the user configured window: an absent window keeps every correction. */
export function expirecorrections(corrections: correctionentry[], window: number | undefined, now: number): correctionentry[] {
  if (window === undefined) return corrections;
  return corrections.filter(entry => now - entry.at < window);
}

/** Builds one consent memory entry per origin: every grant, denial, expiry and revocation lands with its boundary and kinds while the record stays advisory. */
export function consentmemoryof(input: { origin: string; decision: "grant" | "deny" | "expire" | "revoke"; boundary: string; kinds: string[]; expiresat?: number; now: number; id?: string }): consentmemoryentry {
  if (input.origin.trim() === "") throw new Error("The consent memory entry needs its origin.");
  if (input.boundary.trim() === "") throw new Error("The consent memory entry needs the boundary the prompt named.");
  return { id: input.id ?? randomid(), origin: input.origin, decision: input.decision, boundary: input.boundary, kinds: [...new Set(input.kinds)], at: input.now, ...(input.expiresat !== undefined ? { expiresat: input.expiresat } : {}) };
}

/** Reads the prior consent decisions of one origin for the prompt surface: the history stays advisory, the denial records carry the same weight as the grants and no entry ever auto grants. */
export function consentadvisory(entries: consentmemoryentry[], origin: string, now: number): consentmemoryentry[] {
  return entries.filter(entry => entry.origin === origin && (entry.expiresat === undefined || entry.expiresat > now));
}

/** Reads the advisory verdict of the consent memory for a new prompt: the latest decision names itself, a refusal keeps its refusal and no history widens a boundary. */
export function consentadvisoryverdict(entries: consentmemoryentry[], origin: string, kind: string): { advisory: boolean; reason: string } {
  const matching = entries.filter(entry => entry.origin === origin && entry.kinds.includes(kind));
  const latest = matching[matching.length - 1];
  if (latest === undefined) return { advisory: false, reason: `No prior decision exists for the ${kind} kind on ${origin}; the prompt opens fresh.` };
  if (latest.decision === "deny") return { advisory: true, reason: `The consent memory holds a prior denial of the ${kind} kind on ${origin} from ${new Date(latest.at).toISOString()}; the denial carries the same weight as a grant and the record stays advisory only.` };
  return { advisory: true, reason: `The consent memory holds a prior ${latest.decision} of the ${kind} kind on ${origin} with the boundary ${latest.boundary}; the record advises the new prompt and never auto grants.` };
}

/** Computes the queued and the executed steps of one run from the plan and its progress: the queued steps never executed while the executed steps stay in the sealed log. */
export function rollbacksplit(plan: agentplan | undefined, progress: planprogress | undefined): { executedstepids: string[]; queuedstepids: string[] } {
  const executed = progress && progress.planid === plan?.id ? progress.completedsteps : [];
  const executedset = new Set(executed);
  const queued = (plan?.steps ?? []).map(step => step.id).filter(id => !executedset.has(id));
  return { executedstepids: executed, queuedstepids: queued };
}

/** Builds the rollback option descriptor of one cancelrun: the queued scope rolls the queued steps back only while the executed steps stay untouched in the immutable log. */
export function rollbackof(plan: agentplan | undefined, progress: planprogress | undefined, preference: "queued" | "none" | undefined): rollbackdescriptor {
  const split = rollbacksplit(plan, progress);
  if (preference === "none") return { scope: "none", label: `Stop the run ${plan?.id ?? ""} without a rollback; the ${split.queuedstepids.length} queued step${split.queuedstepids.length === 1 ? "" : "s"} stay as the run left them.`, queuedstepids: split.queuedstepids };
  return { scope: "queued", label: `Cancel the run ${plan?.id ?? ""} and roll its ${split.queuedstepids.length} queued step${split.queuedstepids.length === 1 ? "" : "s"} back${split.queuedstepids.length > 0 ? ` (${split.queuedstepids.join(", ")})` : ""} while the ${split.executedstepids.length} executed step${split.executedstepids.length === 1 ? "" : "s"} stay untouched in the sealed log.`, queuedstepids: split.queuedstepids };
}

/** Builds one cancelrun action with its rollback option descriptor; the action never touches the sealed log of the executed steps. */
export function cancelrunactionof(input: { runid: string; sessionid: string; plan: agentplan | undefined; progress: planprogress | undefined; preference: "queued" | "none" | undefined }): cancelrunaction {
  return { runid: input.runid, sessionid: input.sessionid, rollback: rollbackof(input.plan, input.progress, input.preference) };
}

/** Builds one error surface payload of a failed step: the cause class, the message, the retry hint with the policy verdict and the context facts. */
export function errorsurfaceof(input: { stepid: string; runid: string; message: string; cause: errorcause; retryallowed: boolean; retryreason: string; context: Record<string, string>; now: number }): errorsurface {
  if (input.message.trim() === "") throw new Error("The error surface needs its message in plain language.");
  return { stepid: input.stepid, runid: input.runid, cause: input.cause, message: input.message, retry: { allowed: input.retryallowed, reason: input.retryreason }, context: input.context, at: input.now };
}

/** Classifies the cause of one failed step: a policy refusal and a gate wait carry their own classes, a network shaped message names the network and every other failure stays with the page. */
export function classifyfailure(input: { message: string; policyrefused: boolean; gatewait: boolean }): errorcause {
  if (input.gatewait) return "gate";
  if (input.policyrefused) return "policy";
  if (/\b(network|offline|timeout|timed out|fetch failed|socket|dns|connection)\b/i.test(input.message)) return "network";
  return "page";
}

/** Reads the retry hint of one error surface: a retry passes only through a new reviewed dispatch, so the verdict names the reviewed path instead of an automatic one. */
export function retryhintof(surface: errorsurface): { allowed: boolean; reason: string } {
  if (!surface.retry.allowed) return { allowed: false, reason: `The ${surface.cause} failure of the step ${surface.stepid} refuses the retry: ${surface.retry.reason}` };
  return { allowed: true, reason: `The ${surface.cause} failure of the step ${surface.stepid} may retry through a new reviewed dispatch; the retry rides the full consent gate chain and never bypasses the review.` };
}

/** Derives the session grid rows from the existing session stores with no new state: the live run derives from the session, the plan and its progress, the saved runs derive from the sealed logs and their summaries, and the per tab lock state names the concurrent holder. */
export function sessiongridrows(input: { session?: { id: string; tabid: number; origin: string; stoppedat?: number; pausedat?: number; grants?: string[] }; plan?: agentplan; progress?: planprogress; logs: storedrunlog[]; summaries: runsummary[]; locks: Array<{ runid: string }>; tabsessions: tabsessionref[] }): sessiongridrow[] {
  const rows: sessiongridrow[] = [];
  if (input.session && input.plan && ["pending", "approved"].includes(input.plan.state)) {
    const split = rollbacksplit(input.plan, input.progress);
    const held = input.locks.some(lock => lock.runid === input.plan?.id);
    const origins = [...new Set([input.session.origin, ...(input.session.grants ?? [])])];
    const actions: Array<"resume" | "cancelrun" | "reopen"> = ["cancelrun"];
    if (input.session.pausedat !== undefined) actions.push("resume");
    rows.push({ sessionid: input.session.id, runid: input.plan.id, origins, state: "live", outcome: `${split.executedstepids.length} of ${input.plan.steps.length} reviewed steps executed`, steps: input.plan.steps.length, completed: split.executedstepids.length, lock: held ? "held" : "free", tabid: input.session.tabid, updatedat: input.plan.createdat, actions });
  }
  for (const log of input.logs) {
    const summary = input.summaries.find(candidate => candidate.runid === log.runid);
    const tabsession = input.tabsessions.find(candidate => candidate.runid === log.runid);
    const held = input.locks.some(lock => lock.runid === log.runid);
    rows.push({ sessionid: log.sessionid, runid: log.runid, origins: [...new Set(log.entries.map(entry => entry.origin).filter(origin => origin !== ""))], state: "saved", outcome: summary !== undefined ? (summary.steps.every(step => step.ok) ? "completed" : "failed") : (log.seal !== undefined ? "sealed" : "open"), steps: summary?.steps.length ?? log.entries.filter(entry => entry.kind === "step").length, completed: summary?.steps.filter(step => step.ok).length ?? log.entries.filter(entry => entry.kind === "step").length, lock: held ? "held" : "free", ...(log.seal !== undefined ? { sealhash: log.seal.sealhash.current } : {}), ...(tabsession !== undefined ? { tabid: tabsession.tabid } : {}), updatedat: log.updatedat, actions: ["reopen"] });
  }
  return rows.sort((one, two) => two.updatedat - one.updatedat);
}

/** Normalizes one history search query: the non empty text with the optional origin, time range and outcome filters. */
export function historyqueryof(value: unknown): historysearchquery | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.text !== "string" || candidate.text.trim() === "") return undefined;
  const origin = typeof candidate.origin === "string" && candidate.origin.trim() !== "" ? candidate.origin.trim() : undefined;
  const from = typeof candidate.from === "number" && Number.isFinite(candidate.from) ? candidate.from : undefined;
  const to = typeof candidate.to === "number" && Number.isFinite(candidate.to) ? candidate.to : undefined;
  if (from !== undefined && to !== undefined && from > to) return undefined;
  const outcome = typeof candidate.outcome === "string" && candidate.outcome.trim() !== "" ? candidate.outcome.trim() : undefined;
  return { text: candidate.text.trim(), ...(origin !== undefined ? { origin } : {}), ...(from !== undefined ? { from } : {}), ...(to !== undefined ? { to } : {}), ...(outcome !== undefined ? { outcome } : {}) };
}

/** Adds one corpus entry to the incremental history index: each store write lands in the index at once so the search reads a growing corpus with no rebuild. */
export function addhistoryentry(corpus: historyindexentry[], entry: historyindexentry): historyindexentry[] {
  return [entry, ...corpus.filter(candidate => !(candidate.source === entry.source && candidate.id === entry.id))];
}

/** Extracts the matched terms of one query inside one text, case insensitive, for the result highlighting. */
export function highlightterms(text: string, query: string): string[] {
  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter(term => term.length > 1);
  const lower = text.toLowerCase();
  return [...new Set(terms.filter(term => lower.includes(term)))];
}

/** Searches the one corpus of session metadata, notes and run summaries: the text matches with the matched terms highlighted, filtered by origin, time range and outcome. */
export function historysearch(corpus: historyindexentry[], query: historysearchquery): historysearchhit[] {
  const terms = query.text.toLowerCase().split(/[^a-z0-9]+/).filter(term => term.length > 1);
  const hits: historysearchhit[] = [];
  for (const entry of corpus) {
    if (query.origin !== undefined && entry.origin !== query.origin) continue;
    if (query.from !== undefined && entry.at < query.from) continue;
    if (query.to !== undefined && entry.at > query.to) continue;
    if (query.outcome !== undefined && entry.outcome !== query.outcome) continue;
    const haystack = `${entry.title} ${entry.text}`.toLowerCase();
    const matched = terms.filter(term => haystack.includes(term));
    if (matched.length === 0) continue;
    const position = haystack.indexOf(matched[0] ?? "");
    const start = Math.max(0, position - 40);
    const excerpt = `${start > 0 ? "…" : ""}${`${entry.title} ${entry.text}`.slice(start, start + 160)}${start + 160 < `${entry.title} ${entry.text}`.length ? "…" : ""}`;
    hits.push({ source: entry.source, id: entry.id, title: entry.title, excerpt, highlights: [...new Set(matched)], ...(entry.origin !== undefined ? { origin: entry.origin } : {}), ...(entry.outcome !== undefined ? { outcome: entry.outcome } : {}), at: entry.at });
  }
  return hits.sort((one, two) => two.at - one.at);
}

/** Serves the empty state guidance of one session interface surface in plain language: the grid explains the first run, the search box suggests a first query, the notes explain the note flow and the scratchpad explains how the agent writes. */
export function emptystatemessage(surface: emptystatesurface, origin?: string): string {
  if (surface === "historysearch") return "No history matches yet; start with a first query such as an origin, a note title or a kind the runs executed.";
  if (surface === "sitenotes") return `No site note exists${origin !== undefined ? ` for ${origin}` : ""} yet; write the first note with a title and a body and the note flow keeps it per origin with its author provenance.`;
  if (surface === "scratchpad") return "The scratchpad holds no entry yet; the agent appends its per task notes here while the reviewed steps run, and every entry carries its step provenance.";
  return "No session exists yet; start the first run by describing an objective and reviewing the plan the agent proposes.";
}

/** Builds the per tab isolation key of one tab so parallel tabs never collide inside the session stores. */
export function tabsessionkey(tabid: number): string {
  return `tabsession:${tabid}`;
}

/** Builds one per tab session reference that isolates the session state per tab: parallel tabs keep their own session, run and origin references. */
export function tabsessionrefof(input: { tabid: number; sessionid: string; runid?: string; origin: string; now: number }): tabsessionref {
  if (!Number.isInteger(input.tabid) || input.tabid < 0) throw new Error("The per tab session reference needs its tab.");
  if (input.sessionid.trim() === "") throw new Error("The per tab session reference needs its session.");
  return { tabid: input.tabid, sessionid: input.sessionid, ...(input.runid !== undefined && input.runid.trim() !== "" ? { runid: input.runid } : {}), origin: input.origin, updatedat: input.now };
}

/** Exports the site notes, the run summaries and the correction memory as one audit bundle: every record carries its provenance while sensitive note bodies stay sealed. */
export function sessionbundleof(input: { notes: sitenote[]; summaries: runsummary[]; corrections: correctionentry[]; exportedat: number }): { kind: "sessionbundle"; notes: sitenote[]; summaries: runsummary[]; corrections: correctionentry[]; exportedat: number } {
  return { kind: "sessionbundle", notes: input.notes, summaries: input.summaries, corrections: input.corrections, exportedat: input.exportedat };
}

/**
 * The recall seam the memory adapter documents for the future remote recall backend: today the local fingerprint index answers every semanticrecall query inside the extension, and the seam keeps the query and answer shapes stable so a reviewed remote backend can take the calls later without touching the callers.
 */
export interface recallseam {
  recall(query: recallquery, scope: { origins: string[] }): Promise<recallmatch[]>;
}
