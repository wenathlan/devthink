/** The export module of the 1.1.90 consolidation: every correlated variation of the data egress, the minimization and the portability logic interned in this one file, so the module family carries one surface without duplicate variations. */

/* ── Merged from exporttools.ts: the 1.1.90 consolidation interns the correlated exporttools logic here, so no variation of the same file lives beside another. ── */
import type { cookiejarrecord, datainventory, dropimportsession, exportallbundle, exportdescriptor, exportresult, immutablelogentry, importexportpayload, localrule, purgepolicy, quarantineentry, scanverdict, sitenote, storedrunlog, syncsettings, syncrecord, telemetrypolicy } from "./types.js";
import { defaultmaskshapes, maskexport, maskmarker } from "./security.js";
import { exportchaingate, exportmaskgate, importexportgate } from "./policy.js";
import { verifylogchain } from "./security.js";

/**
 * Exporttools logic of the 1.1.67 family.
 * Runs, extractions and notes move to disk here: every export carries its descriptor with the format and the scope, the log chain verifies before any byte leaves the store, the maskinputs verdicts apply in every format, and an unmasked value refuses the export in full.
 * The tools never widen an export: a refused export writes nothing, and no format ships a value the mask verdicts held back.
 */

/** The export formats the tools render: csv for tables, json for structured consumers, log for the chain lines, jsonl for the json lines streams and markdown for the table documents. */
export const exportformats: readonly string[] = ["csv", "json", "log", "jsonl", "markdown"];

/** The export scopes the tools serve: the runs of a chain, the extractions of a run, the notes of a profile, beside the session, audit and extraction scopes the 1.1.80 exportdata command exports. */
export const exportscopes: readonly string[] = ["runs", "extractions", "notes", "session", "audit", "extraction"];

/** Builds and validates one export descriptor: the format and the scope stay the reviewed pair the command declared. */
export function exportdescriptorof(format: string, scope: string): exportdescriptor {
  if (!exportformats.includes(format)) throw new Error(`The export format ${format} stays outside csv, json, log, jsonl and markdown.`);
  if (!exportscopes.includes(scope)) throw new Error(`The export scope ${scope} stays outside runs, extractions, notes, session, audit and extraction.`);
  return { format: format as exportdescriptor["format"], scope: scope as exportdescriptor["scope"] };
}

/** Escapes one csv field: the field quotes when it carries a comma, a quote or a newline, and a quote doubles inside. */
export function csvfield(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Renders rows as csv: the header carries the sorted field names and every row escapes its fields the csv way. */
export function csvof(rows: Array<Record<string, string>>): string {
  if (rows.length === 0) return "";
  const fields = [...new Set(rows.flatMap(row => Object.keys(row)))].sort();
  const header = fields.map(csvfield).join(",");
  const body = rows.map(row => fields.map(field => csvfield(row[field] ?? "")).join(","));
  return [header, ...body].join("\n");
}

/** Escapes one markdown table cell: the backslash escapes first so a value that already carries one never collides with the pipe escape, the pipe follows and a newline breaks the cell into a line break the table carries literally. */
export function markdownfield(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
}

/** Renders rows as one markdown table: the header carries the sorted field names, the separator row fixes the column count and every row escapes its cells the markdown way. */
export function markdownof(rows: Array<Record<string, string>>): string {
  if (rows.length === 0) return "";
  const fields = [...new Set(rows.flatMap(row => Object.keys(row)))].sort();
  const header = `| ${fields.map(markdownfield).join(" | ")} |`;
  const separator = `| ${fields.map(() => "---").join(" | ")} |`;
  const body = rows.map(row => `| ${fields.map(field => markdownfield(row[field] ?? "")).join(" | ")} |`);
  return [header, separator, ...body].join("\n");
}

/** Renders records as json lines: one compact json document per line, so a stream consumer reads one record at a time with no delimiter bookkeeping. */
export function jsonlinesof(records: Array<Record<string, unknown>>): string {
  if (records.length === 0) return "";
  return records.map(record => JSON.stringify(record)).join("\n");
}

/** The secret field shapes an export refuses in full when their values carry no mask marker: the same shapes the importexport bundle refuses, so no format launders an unmasked store value. */
export const secretfieldshapes: readonly string[] = ["secret", "token", "password", "apikey", "authorization"];

/** Reads the secret named fields whose raw values carry no mask marker: every one of them refuses the export under any format, because masking at export time would launder an unmasked store value. */
export function unmaskedfieldsof(records: Array<Record<string, unknown>>): string[] {
  const unmasked = new Set<string>();
  for (const record of records) {
    for (const [name, value] of Object.entries(record)) {
      if (typeof value !== "string" || value.trim() === "") continue;
      if (secretfieldshapes.some(shape => name.toLowerCase().includes(shape)) && !value.includes(maskmarker)) unmasked.add(name);
    }
  }
  return [...unmasked].sort();
}

/** Exports records in the descriptor format with the mask verdicts honored: the verdicts mask the fields they hold back in every format, a raw secret value refuses the export in full because masking at export time would launder an unmasked store, and a refused export writes nothing. */
export function exportrecords(input: { descriptor: exportdescriptor; records: Array<Record<string, unknown>>; shapes: string[]; path?: string }): { result: exportresult; content: string } {
  const unmasked = unmaskedfieldsof(input.records);
  const maskgate = exportmaskgate({ unmasked });
  if (!maskgate.allowed) return { result: { descriptor: input.descriptor, bytes: 0, rows: 0, ...(input.path !== undefined ? { path: input.path } : {}), reason: maskgate.reason ?? "The export refused an unmasked value." }, content: "" };
  const masked = input.records.map(record => maskexport(record, input.shapes) as Record<string, unknown>);
  const stringrows = masked.map(record => Object.fromEntries(Object.entries(record).map(([name, value]) => [name, typeof value === "string" ? value : JSON.stringify(value)])) as Record<string, string>);
  if (input.descriptor.format === "csv") {
    const content = csvof(stringrows);
    return { result: { descriptor: input.descriptor, bytes: content.length, rows: stringrows.length, ...(input.path !== undefined ? { path: input.path } : {}) }, content };
  }
  if (input.descriptor.format === "json") {
    const content = JSON.stringify(masked, null, 2);
    return { result: { descriptor: input.descriptor, bytes: content.length, rows: masked.length, ...(input.path !== undefined ? { path: input.path } : {}) }, content };
  }
  if (input.descriptor.format === "jsonl") {
    const content = jsonlinesof(masked);
    return { result: { descriptor: input.descriptor, bytes: content.length, rows: masked.length, ...(input.path !== undefined ? { path: input.path } : {}) }, content };
  }
  if (input.descriptor.format === "markdown") {
    const content = markdownof(stringrows);
    return { result: { descriptor: input.descriptor, bytes: content.length, rows: stringrows.length, ...(input.path !== undefined ? { path: input.path } : {}) }, content };
  }
  const content = masked.map(record => Object.entries(record).map(([name, value]) => `${name}=${typeof value === "string" ? value : JSON.stringify(value)}`).join(" ")).join("\n");
  return { result: { descriptor: input.descriptor, bytes: content.length, rows: masked.length, ...(input.path !== undefined ? { path: input.path } : {}) }, content };
}

/** Reads the row view of one immutable log chain: one row per entry with its identity, kind, origin, step, summary and time. */
export function chainrows(entries: immutablelogentry[]): Array<Record<string, string>> {
  return entries.map(entry => ({ id: entry.id, kind: entry.kind, origin: entry.origin, ...(entry.stepid !== undefined ? { stepid: entry.stepid } : {}), summary: entry.summary, at: String(entry.at) }));
}

/** Exports one sealed run log in the descriptor format: the chain verifies before any byte leaves the store, so a broken chain refuses the export in full. */
export async function exportchain(input: { descriptor: exportdescriptor; log: storedrunlog; shapes: string[]; path?: string }): Promise<{ result: exportresult; content: string }> {
  const verification = await verifylogchain(input.log.entries);
  const chaingate = exportchaingate({ chainvalid: verification.valid, ...(verification.reason !== "" ? { reason: verification.reason } : {}) });
  if (!chaingate.allowed) return { result: { descriptor: input.descriptor, bytes: 0, rows: 0, ...(input.path !== undefined ? { path: input.path } : {}), reason: chaingate.reason ?? "The export refused an unverified chain." }, content: "" };
  return exportrecords({ descriptor: input.descriptor, records: chainrows(input.log.entries), shapes: input.shapes, ...(input.path !== undefined ? { path: input.path } : {}) });
}

/** Reads the export row view of one site note: the identity and provenance beside the plain body or the sealed body exactly as the note stores it, so a sensitive note never ships its plaintext. */
export function noterow(note: sitenote): Record<string, string> {
  return { id: note.id, origin: note.origin, title: note.title, author: note.author, sensitive: String(note.sensitive), ...(note.body !== undefined ? { body: note.body } : {}), ...(note.sealedbody !== undefined ? { sealedbody: note.sealedbody } : {}), updatedat: String(note.updatedat) };
}

/** Exports notes in the descriptor format with the mask verdicts honored: the plain bodies and the sealed bodies ride the same masking gate as every other record. */
export function exportnotes(input: { descriptor: exportdescriptor; notes: sitenote[]; shapes: string[]; path?: string }): { result: exportresult; content: string } {
  return exportrecords({ descriptor: input.descriptor, records: input.notes.map(noterow), shapes: input.shapes, ...(input.path !== undefined ? { path: input.path } : {}) });
}

/** Exports extraction rows in the descriptor format: the extracted values mask under the same verdicts, and an unmasked sensitive value refuses the export. */
export function exportextractions(input: { descriptor: exportdescriptor; rows: Array<Record<string, unknown>>; shapes: string[]; path?: string }): { result: exportresult; content: string } {
  return exportrecords({ descriptor: input.descriptor, records: input.rows, shapes: input.shapes, ...(input.path !== undefined ? { path: input.path } : {}) });
}

/* ── Merged from minimization.ts: the 1.1.90 consolidation interns the correlated minimization logic here, so no variation of the same file lives beside another. ── */
import { randomid } from "./memory.js";

/**
 * Data minimization logic of the 1.1.79 family.
 * Every correlated rule for the smallest possible data footprint lives in this one module: the localfirst pass that keeps extraction, aggregation and diffing on the device and strips the identity fields the reviewed plan never listed while the localrule fields never leave the device at all; the notelemetry posture that keeps every counter inside the local memory with the worker free of outbound usage calls; the optinsync consent that stays disabled until the user turns each data class on and stamps the consent per class; the encryptsync pass that derives the key from the user passphrase, encrypts every payload before the transport and stamps the format version while refusing a sync without the passphrase; the purgeonrequest pass that deletes stored data by scope on the user request, demands the typed confirmation for the full scope, preserves the immutable audit hashes and reports every deleted key; the exportall bundle that carries every stored record — runs, memory, captures, settings and provenance — into one portable file the streaming pass walks without a size cap; the cookiejar isolation that assigns one jar per task run, scopes every cookie read and write to the active jar and seals the jar at the run completion under the user expiry window; the cleanupafterrun pass that clears the task artifacts of a completed run while the artifacts the user flagged for retention stay; and the enforcequarantine rule that holds every download in the sandbox folder until the scanner verdict arrives and releases or deletes the file by the verdict alone.
 * The module extends the reviewed families instead of duplicating them: the cookie entries ride the cookierecord shapes the cookie control family already writes, the quarantine verdicts reuse the scanverdict grammar and the quarantineentry record of the security family with its new lifecycle status, the exportall provenance composes the provlog entries of the pipeline family, and the purge receipts answer the audit trail the immutable log family already seals.
 * Every impure move stays behind an injected seam — the key derivation, the payload encryption, the sync transport and the scanner hook resolve through functions the executor wires — while every cadence, retention, scope, timing and expiry stays the user's with no code default: an absent sync cadence keeps every pass off, an absent cleanup timing leaves every pass to the explicit user action, an absent jar expiry keeps every sealed jar until the user purges it, and no minimization path ever bypasses a review.
 */

/** Key derivation seam: one user passphrase resolves to the derived key material; the extension executor wires the webcrypto derivation, tests wire plain fixtures. The passphrase itself never persists and never rides a payload. */
export type keyderive = (passphrase: string) => Promise<string>;

/** Payload encryption seam: one derived key with one plaintext payload resolves to the cipher text; the extension executor wires the webcrypto cipher, tests wire plain fixtures. */
export type payloadencrypt = (key: string, payload: string) => Promise<string>;

/** Sync transport seam: one encrypted payload with the classes it carries resolves to the delivery state; the extension executor wires the user configured sync backend, tests wire plain fixtures and counters. */
export type syncsend = (payload: string, classes: string[]) => Promise<{ delivered: boolean; endpoint?: string }>;

/** Scanner hook seam: one quarantined file resolves to the verdict of the user configured scanner; the extension executor wires the configured scan hook endpoint, tests wire plain fixtures. */
export type scannerhook = (entry: { path: string; reason: string; digest?: string }) => Promise<scanverdict>;

/** The minimization kinds of the 1.1.79 family, listed among the available capabilities of every proposal request. */
export const minimizationkinds: string[] = ["localfirst", "notelemetry", "optinsync", "encryptsync", "purgeonrequest", "exportall", "cookiejar", "cleanupartifacts", "enforcequarantine"];

/** Reads the identity field names the localfirst pass strips when the reviewed plan never listed them: the common account, session and tracking shapes a page carries that an extraction keeps only when the review names the field. */
const identityfields: string[] = ["email", "phone", "name", "address", "account", "sessionid", "userid", "ip", "geolocation", "cookie", "token"];

/**
 * Processes one extraction through the local first pass: extraction, aggregation and diffing stay on the device, the identity fields strip unless the reviewed plan listed them, and the localrule fields of the origin strip always — they never leave the device for any review — while the report names every stripped and every local held field so the audit trail answers what the extraction stopped carrying.
 */
export function localfirst(input: { origin: string; rows: Array<Record<string, string>>; reviewedfields?: string[]; rules: localrule[]; now: number }): { rows: Array<Record<string, string>>; stripped: string[]; localheld: string[]; reason: string } {
  if (input.origin.trim() === "") throw new Error("The localfirst pass names its origin; an unnamespaced extraction answers no review.");
  const reviewed = new Set((input.reviewedfields ?? []).map(field => field.trim().toLowerCase()).filter(field => field !== ""));
  const localfields = new Set(input.rules.filter(rule => rule.origin === input.origin || rule.origin === "*").flatMap(rule => rule.fields.map(field => field.trim().toLowerCase()).filter(field => field !== "")));
  const stripped = new Set<string>();
  const localheld = new Set<string>();
  const rows = input.rows.map(row => {
    const next: Record<string, string> = {};
    for (const [field, value] of Object.entries(row)) {
      const key = field.trim().toLowerCase();
      if (localfields.has(key)) { localheld.add(field); continue; }
      if (identityfields.some(identity => key === identity || key.endsWith(`_${identity}`) || key.endsWith(`-${identity}`)) && !reviewed.has(key)) { stripped.add(field); continue; }
      next[field] = value;
    }
    return next;
  });
  return { rows, stripped: [...stripped], localheld: [...localheld], reason: `The localfirst pass kept ${rows.length} row${rows.length === 1 ? "" : "s"} on the device${stripped.size > 0 ? `, stripped ${stripped.size} identity field${stripped.size === 1 ? "" : "s"} the review never listed` : ""}${localheld.size > 0 ? ` and held ${localheld.size} local rule field${localheld.size === 1 ? "" : "s"} that never leave the device` : ""}.` };
}

/**
 * Lists the local rule fields an outbound payload carries: the localgate and the protocol boundary refuse any payload that answers with one entry or more, because a field marked local never leaves the device for any transport.
 */
export function localfieldsof(payload: Record<string, unknown>, rules: localrule[]): string[] {
  const keys = Object.keys(payload).map(key => key.trim().toLowerCase());
  return rules.flatMap(rule => rule.fields.map(field => field.trim().toLowerCase())).filter(field => field !== "" && keys.includes(field));
}

/**
 * Reads the telemetry policy fixed to off: the enabled literal stays false by construction — the type makes an on state unrepresentable — and every counter keeps living inside the local memory, so the popup names the posture and the tests hold the invariant.
 */
export function fixedtelemetrypolicy(now: number): telemetrypolicy {
  return { enabled: false, counters: "local", at: now };
}

/**
 * Turns the sync opt in on per data class: sync stays disabled until the user lists every data class and enables each one, every enablement stamps the consent per class for the audit trail, and a class the listing never offered never enables — an unlisted class answers no consent.
 */
export function optinsync(input: { current?: syncsettings; offered: string[]; enable: string[]; now: number }): { settings: syncsettings; consent: Array<{ dataclass: string; at: number }> } {
  const offered = input.offered.map(item => item.trim().toLowerCase()).filter(item => item !== "");
  if (offered.length === 0) throw new Error("The sync opt in lists every data class before any enablement; an empty listing enables nothing.");
  const enable = input.enable.map(item => item.trim().toLowerCase()).filter(item => item !== "");
  const unknown = enable.filter(item => !offered.includes(item));
  if (unknown.length > 0) throw new Error(`The sync opt in never enables a class the listing did not offer: ${unknown.join(", ")} stay${unknown.length === 1 ? "s" : ""} off until the user lists them.`);
  const consented = new Map((input.current?.consent ?? []).map(entry => [entry.dataclass, entry.at]));
  const enabled = new Set(input.current?.enabled ?? []);
  for (const dataclass of enable) {
    enabled.add(dataclass);
    consented.set(dataclass, input.now);
  }
  return { settings: { enabled: [...enabled], ...(input.current?.cadence !== undefined ? { cadence: input.current.cadence } : {}), consent: [...consented.entries()].map(([dataclass, at]) => ({ dataclass, at })), at: input.now }, consent: enable.map(dataclass => ({ dataclass, at: input.now })) };
}

/**
 * Encrypts one sync payload before the transport: the key derives from the user passphrase through the derivation seam, the payload encrypts through the cipher seam, the format version tags the envelope, and a sync without the passphrase refuses — a passphrase the user never typed never defaults in code.
 */
export async function encryptsync(input: { payload: string; passphrase?: string; derive: keyderive; encrypt: payloadencrypt }): Promise<{ cipher: string; formattag: string; reason: string }> {
  const passphrase = input.passphrase ?? "";
  if (passphrase.trim() === "") throw new Error("The encryptsync pass needs the user passphrase; a sync without the passphrase never transports because the key never defaults in code.");
  if (input.payload.length === 0) throw new Error("The encryptsync pass encrypts a non-empty payload; an empty sync carries nothing to sync.");
  const key = await input.derive(passphrase);
  const cipher = await input.encrypt(key, input.payload);
  const formattag = "devthink-sync-1";
  return { cipher, formattag, reason: `The encryptsync pass derived its key from the user passphrase, encrypted the ${input.payload.length} character payload and stamped the ${formattag} format version; the passphrase never rides the envelope.` };
}

/**
 * Runs one sync pass through the seams: only the classes the user opted in ride the payload, the encryptsync pass encrypts before the transport seam fires, and the syncrecord carries the payload hash with the format tag — a plaintext or an unconsented class never reaches the transport.
 */
export async function syncpass(input: { payload: string; classes: string[]; settings: syncsettings; passphrase?: string; derive: keyderive; encrypt: payloadencrypt; send: syncsend; now: number }): Promise<{ record: syncrecord; delivered: boolean; reason: string }> {
  const enabled = new Set(input.settings.enabled.map(item => item.toLowerCase()));
  const unconsented = input.classes.filter(item => !enabled.has(item.toLowerCase()));
  if (unconsented.length > 0) throw new Error(`The sync pass carries the classes ${unconsented.join(", ")} the user never opted in; an unconsented class never reaches the transport.`);
  const encrypted = await encryptsync({ payload: input.payload, ...(input.passphrase !== undefined ? { passphrase: input.passphrase } : {}), derive: input.derive, encrypt: input.encrypt });
  const delivery = await input.send(encrypted.cipher, input.classes);
  const record: syncrecord = { id: randomid(), classes: input.classes, payloadhash: await shaof(encrypted.cipher), formattag: encrypted.formattag, encrypted: true, syncedat: input.now };
  return { record, delivered: delivery.delivered, reason: `The sync pass encrypted the ${input.classes.join(", ")} payload, delivered it${delivery.endpoint !== undefined ? ` through ${delivery.endpoint}` : ""} and recorded the payload hash; every class rode with its own consent stamp.` };
}

/**
 * Deletes stored data by scope on the user request: the purge answers the inventory the device holds, the full scope demands the typed confirmation phrase, the audit class never deletes because the immutable audit hashes survive every purge, and the report lists every deleted key for the audit trail.
 */
export function purgeonrequest(input: { policy: purgepolicy; typed: string; inventory: datainventory[]; now: number }): { deleted: string[]; kept: string[]; audithashespreserved: boolean; reason: string } {
  const scope = input.policy.scope.map(item => item.trim().toLowerCase()).filter(item => item !== "");
  if (scope.length === 0) throw new Error("The purge request names its scope; a purge without a scope deletes nothing.");
  const full = scope.includes("all") || (scope.includes("runs") && scope.includes("memory") && scope.includes("captures") && scope.includes("settings") && scope.includes("provenance"));
  if (full && input.typed.trim() !== input.policy.confirmation) throw new Error("The full scope purge needs the typed confirmation phrase; a purge nobody typed out never runs.");
  const deleted: string[] = [];
  const kept: string[] = [];
  for (const entry of input.inventory) {
    if (entry.dataclass === "audit") { kept.push(entry.key); continue; }
    if (scope.includes(entry.dataclass) || full) deleted.push(entry.key);
    else kept.push(entry.key);
  }
  return { deleted, kept, audithashespreserved: true, reason: `The purge deleted ${deleted.length} stored key${deleted.length === 1 ? "" : "s"} of the ${scope.join(", ")} scope${full ? " after the typed confirmation" : ""} — ${deleted.join(", ") || "none"} — while the audit hashes survived${kept.length > 0 ? ` and ${kept.length} key${kept.length === 1 ? "" : "s"} stayed` : ""}; every deleted key entered the audit trail.` };
}

/**
 * Bundles every stored record into one portable file: the runs, the memory items, the captures, the settings and the provenance entries ride one exportall bundle the user explicitly asked for, the record count and the byte size name what left, and nothing here caps the size because a bundle the user asked for streams whole.
 */
export function exportall(input: { runs: string[]; memory: string[]; captures: string[]; settings: boolean; provenance: string[]; now: number }): exportallbundle {
  if (input.runs.length === 0 && input.memory.length === 0 && input.captures.length === 0 && input.provenance.length === 0 && !input.settings) throw new Error("The exportall bundle carries the stored records; a device holding nothing exports nothing.");
  const records = input.runs.length + input.memory.length + input.captures.length + input.provenance.length + (input.settings ? 1 : 0);
  const bytes = JSON.stringify({ runs: input.runs, memory: input.memory, captures: input.captures, settings: input.settings, provenance: input.provenance }).length;
  return { id: randomid(), runs: input.runs, memory: input.memory, captures: input.captures, settings: input.settings, provenance: input.provenance, records, bytes, at: input.now };
}

/**
 * Streams one exportall bundle in chunks without a size cap: the chunk size stays the explicit choice of the caller because no code ceiling ever refuses a large bundle; the chunks concatenate back into the bundle payload byte for byte.
 */
export function streambundle(input: { bundle: exportallbundle; chunksize: number }): string[] {
  if (!Number.isInteger(input.chunksize) || input.chunksize <= 0) throw new Error("The bundle streaming names its chunk size as a positive whole number of characters; the chunk size never defaults in code.");
  const payload = JSON.stringify(input.bundle);
  const chunks: string[] = [];
  for (let offset = 0; offset < payload.length; offset += input.chunksize) chunks.push(payload.slice(offset, offset + input.chunksize));
  return chunks;
}

/**
 * Assigns one cookie jar to a task run: the jar carries its id, the run it isolates and the cookie entries scoped inside it, so one task run never shares its cookie state with another; an empty jar at the run start holds nothing until a reviewed cookie step writes.
 */
export function newjar(input: { runid: string; now: number; id?: string }): cookiejarrecord {
  if (input.runid.trim() === "") throw new Error("The cookie jar names its run; an unnamespaced jar isolates no task.");
  return { jarid: input.id ?? randomid(), runid: input.runid, cookies: [], sealed: false, createdat: input.now, updatedat: input.now };
}

/**
 * Scopes one cookie read or write to the active jar: a write appends or replaces the entries inside the jar it belongs to — and a sealed jar refuses every write because a completed run never changes its cookie state — while a read answers exactly the entries the jar holds for the domain the step named.
 */
export function jarscope(input: { jar: cookiejarrecord; operation: "read" | "write"; cookies?: Array<{ name: string; domain: string; value: string; path?: string; expiresat?: number }>; domain?: string; now: number }): { jar: cookiejarrecord; entries: Array<{ name: string; domain: string; value: string; path?: string; expiresat?: number }>; reason: string } {
  if (input.operation === "write") {
    if (input.jar.sealed) throw new Error(`The jar ${input.jar.jarid} of the run ${input.jar.runid} sealed at the run completion; a sealed jar refuses every write.`);
    const cookies = input.cookies ?? [];
    if (cookies.length === 0) throw new Error("The jar write carries its cookie entries; an empty write changes nothing.");
    const merged = [...input.jar.cookies];
    for (const cookie of cookies) {
      const index = merged.findIndex(entry => entry.name === cookie.name && entry.domain === cookie.domain);
      if (index >= 0) merged[index] = cookie;
      else merged.push(cookie);
    }
    return { jar: { ...input.jar, cookies: merged, updatedat: input.now }, entries: cookies, reason: `The jar write scoped ${cookies.length} cookie entr${cookies.length === 1 ? "y" : "ies"} inside the jar ${input.jar.jarid} of the run ${input.jar.runid}; no other run reads them.` };
  }
  const entries = input.jar.cookies.filter(entry => input.domain === undefined || entry.domain === input.domain);
  return { jar: input.jar, entries, reason: `The jar read answered ${entries.length} cookie entr${entries.length === 1 ? "y" : "ies"} of the jar ${input.jar.jarid}${input.domain !== undefined ? ` for the domain ${input.domain}` : ""}; the read stays inside the active jar.` };
}

/**
 * Seals the jar of a completed run: the seal stamps the completion time, the user configured expiry window marks when the sealed jar's entries expire for the automatic cleanup, and an absent window keeps the jar until the user purges it because the expiry never defaults in code.
 */
export function sealjar(input: { jar: cookiejarrecord; now: number; expiry?: number }): cookiejarrecord {
  if (input.jar.sealed) return { ...input.jar, updatedat: input.now };
  if (input.expiry !== undefined && !(input.expiry > 0)) throw new Error("The jar expiry stays a positive number of milliseconds the user chose; the expiry never defaults in code.");
  return { ...input.jar, sealed: true, sealedat: input.now, ...(input.expiry !== undefined ? { expiresat: input.now + input.expiry } : {}), updatedat: input.now };
}

/**
 * Clears the task artifacts of a completed run: the classes the cleanup schedule names leave while the artifacts the user flagged for retention stay, and an absent class list clears nothing because the cleanup stays the user's schedule with no code default.
 */
export function cleanupafterrun(input: { runid: string; artifacts: Array<{ id: string; dataclass: string; retained?: boolean }>; classes: string[]; now: number }): { cleared: string[]; kept: string[]; reason: string } {
  if (input.runid.trim() === "") throw new Error("The cleanup pass names its run; an unnamespaced cleanup clears nothing.");
  const classes = input.classes.map(item => item.trim().toLowerCase()).filter(item => item !== "");
  if (classes.includes("audit")) throw new Error("The cleanup pass never deletes the audit history without the user consent; the immutable hashes survive every pass.");
  const cleared: string[] = [];
  const kept: string[] = [];
  for (const artifact of input.artifacts) {
    if (artifact.retained === true) { kept.push(artifact.id); continue; }
    if (classes.includes(artifact.dataclass.toLowerCase())) cleared.push(artifact.id);
    else kept.push(artifact.id);
  }
  return { cleared, kept, reason: `The cleanup pass cleared ${cleared.length} artifact${cleared.length === 1 ? "" : "s"} of the run ${input.runid} under the classes ${classes.join(", ") || "none"} while ${kept.length} stayed${kept.length > 0 ? " — the retained artifacts the user flagged never leave" : ""}.` };
}

/**
 * Holds a download in the sandbox folder until the scanner verdict arrives and releases or deletes the file by the verdict alone: a clean verdict releases, a flagged verdict deletes, and a pending or error verdict holds — a file without a verdict never opens, and a hook failure never releases anything.
 */
export function enforcequarantine(input: { path: string; reason: string; scan?: scanverdict; digest?: string; now: number; id?: string }): { entry: quarantineentry; action: "hold" | "release" | "delete"; reason: string } {
  if (input.path.trim() === "") throw new Error("The quarantine names its file path; a download without a path quarantines nowhere.");
  const scan = input.scan ?? "pending";
  const entry: quarantineentry = { id: input.id ?? randomid(), path: input.path, reason: input.reason, scan, status: scan === "clean" ? "released" : scan === "flagged" ? "deleted" : "held", ...(input.digest !== undefined && /^[0-9a-f]{64}$/.test(input.digest.trim().toLowerCase()) ? { digest: input.digest.trim().toLowerCase() } : {}), at: input.now, updatedat: input.now };
  if (scan === "clean") return { entry, action: "release", reason: `The scanner verdict read clean so the quarantined file ${input.path} releases from the sandbox folder to the reviewed download flow.` };
  if (scan === "flagged") return { entry, action: "delete", reason: `The scanner verdict read flagged so the quarantined file ${input.path} deletes from the sandbox folder; a flagged download never reaches the downloads folder.` };
  return { entry, action: "hold", reason: `The scanner verdict reads ${scan} so the quarantined file ${input.path} stays held in the sandbox folder; a file without a clean verdict never opens.` };
}

/**
 * Builds one data inventory entry of a stored family: the serialized size and the record count answer what the device holds, so the purge and the exportall bundle scope exactly over the inventory and never guess.
 */
export function inventoryentry(input: { key: string; dataclass: string; value: unknown; now: number }): datainventory {
  if (input.key.trim() === "") throw new Error("The inventory entry names its storage key; an unnamespaced key answers no family.");
  const serialized = JSON.stringify(input.value ?? null) ?? "null";
  const records = Array.isArray(input.value) ? input.value.length : input.value === undefined || input.value === null ? 0 : 1;
  return { key: input.key, dataclass: input.dataclass, size: serialized.length, records, at: input.now };
}

/** Hashes one payload with the subtle crypto digest when available and falls back to the plain length mix the tests seed, because the payload hash names the sync and never decrypts anything. */
async function shaof(payload: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (subtle !== undefined) {
    const digest = await subtle.digest("SHA-256", new TextEncoder().encode(payload));
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
  }
  return `len-${payload.length}`;
}

/* ── Merged from portability.ts: the 1.1.90 consolidation interns the correlated portability logic here, so no variation of the same file lives beside another. ── */
/**
 * Importexport and dropimport logic of the 1.1.65 family.
 * Settings and data move between profiles here: the importexport payload carries the originprofiles, the siteprofiles, the site notes and the preferences of one profile while the secretvault values and the unmasked logs never enter any bundle under any flag; and the dropimport accepts the csv, json and workflow files the user drops on the optionspage and the dashboardpage with its file kind detection naming what it found.
 * No bundle is ever forced: every import lands under the same review, and no export path ever ships a secret or an unmasked log value.
 */

/** Builds one importexport payload: the settings and data bundle of one profile with the originprofiles, the siteprofiles, the notes and the preferences and the honest exclusion list of everything that stayed out. */
export function importexportpayloadof(input: { profile: string; originprofiles: Array<Record<string, unknown>>; siteprofiles: Array<Record<string, unknown>>; notes: Array<Record<string, unknown>>; preferences: Record<string, unknown>; at: number }): importexportpayload {
  if (input.profile.trim() === "") throw new Error("The importexport payload needs its profile name.");
  const secrets = [...input.originprofiles, ...input.siteprofiles, ...input.notes, ...Object.values(input.preferences)].find(record => secretcarrying(record)) !== undefined;
  const gate = importexportgate({ containssecrets: secrets, unmaskedlogs: false });
  if (!gate.allowed) throw new Error(gate.reason);
  return { version: 1, kind: "settings", profile: input.profile.trim(), exportedat: input.at, contents: { originprofiles: input.originprofiles, siteprofiles: input.siteprofiles, notes: input.notes, preferences: input.preferences }, exclusions: ["secretvault values", "unmasked logs"] };
}

/** Detects whether one record carries a secret vault value by its key shapes so the export refuses before any bundle ships. */
function secretcarrying(record: unknown): boolean {
  if (record === null || typeof record !== "object") return false;
  const entries = Object.entries(record as Record<string, unknown>);
  const secretkeys = ["secret", "token", "password", "apikey", "authorization"];
  return entries.some(([key, value]) => secretkeys.some(shape => key.toLowerCase().includes(shape)) && typeof value === "string" && value.trim() !== "");
}

/** Validates one importexport payload for import: a bundle that carries secretvault values or unmasked logs refuses under any flag, and the payload needs its profile and contents. */
export function importexportvalidate(payload: importexportpayload): { ok: boolean; reason: string } {
  const records = [...payload.contents.originprofiles, ...payload.contents.siteprofiles, ...payload.contents.notes, ...Object.values(payload.contents.preferences)];
  const preferencessecrets = Object.entries(payload.contents.preferences).some(([key, value]) => secretcarrying({ [key]: value }));
  const gate = importexportgate({ containssecrets: records.some(record => secretcarrying(record)) || preferencessecrets, unmaskedlogs: payload.contents.unmaskedlogs !== undefined });
  if (!gate.allowed) return { ok: false, reason: gate.reason ?? "The importexport bundle refuses." };
  if (payload.profile.trim() === "") return { ok: false, reason: "The importexport bundle needs its profile name." };
  return { ok: true, reason: `The importexport bundle of the profile ${payload.profile} validates with ${payload.contents.originprofiles.length} origin profile${payload.contents.originprofiles.length === 1 ? "" : "s"}, ${payload.contents.siteprofiles.length} site profile${payload.contents.siteprofiles.length === 1 ? "" : "s"} and ${payload.contents.notes.length} note${payload.contents.notes.length === 1 ? "" : "s"}; ${payload.exclusions.join(" and ")} never enter any bundle.` };
}

/** Applies one importexport payload to the current preferences: the imported keys replace their current values while the secrets exclusion list stays untouched because no secret ever rides a bundle. */
export function applyimport(payload: importexportpayload, current: Record<string, unknown>): { preferences: Record<string, unknown>; applied: string[] } {
  const validation = importexportvalidate(payload);
  if (!validation.ok) throw new Error(validation.reason);
  const applied = Object.keys(payload.contents.preferences);
  return { preferences: { ...current, ...payload.contents.preferences }, applied };
}

/** Detects the file kind of one dropped file: the extension names csv, json and workflow files while the head of the content confirms the json and workflow shapes. */
export function detectfilekind(filename: string, head: string): dropimportsession["kind"] | undefined {
  const extension = filename.toLowerCase().split(".").pop() ?? "";
  if (extension === "csv") return "csv";
  if (extension === "json") {
    const trimmed = head.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed.includes("\"steps\"") ? "workflow" : "json";
    return "json";
  }
  if (extension === "yaml" || extension === "yml") return "workflow";
  return undefined;
}

/** Builds one dropimport session of a file dropped on the optionspage or the dashboardpage: the detected kind names what the import path takes while an unknown kind refuses the session. */
export function dropimportof(input: { filename: string; bytes: number; head: string; at: number }): dropimportsession {
  if (input.filename.trim() === "") throw new Error("The dropimport session needs its filename.");
  const kind = detectfilekind(input.filename, input.head);
  if (kind === undefined) throw new Error(`The dropimport detects no csv, json or workflow kind in ${input.filename}; the import path refuses the file.`);
  return { id: `${input.filename}:${input.at}`, filename: input.filename, kind, bytes: input.bytes, accepted: true, at: input.at };
}
