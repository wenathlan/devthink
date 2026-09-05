/** The data module of the 1.1.90 consolidation: every correlated variation of the dataset records, the streaming pipelines and the chunked parsing logic interned in this one file, so the module family carries one surface without duplicate variations. */

/* ── Merged from datacommand.ts: the 1.1.90 consolidation interns the correlated datacommand logic here, so no variation of the same file lives beside another. ── */
import type { artifactrecord, chunkextractcursor, chunkextractwindowresult, columnspec, dataset, datasetrow, dedupekey, exportedartifact, extractbatch, extractpipeline, extractrow, extractsession, gridcolumn, provlogentry, provenancerecord, samplepolicy, sourcestamprecord, streamcursor, streamstate, streamparsechunk, streamparsetoken, toolstep, transformrule } from "./types.js";
import { tocsv, toexcel, tojson } from "./page.js";

/**
 * Dataset command logics for the background executors.
 * Every correlated rule for dataset records, artifact exports with checksums, chunked streaming with backpressure, extraction cursors, loop row variables, provenance records and artifact retention lives in this file.
 */

/** Builds one dataset record from a scraped grid result. */
export function builddataset(id: string, name: string, grid: { columns: columnspec[]; rows: datasetrow[]; children?: Array<{ parentrow: number; selector: string; columns: columnspec[]; rows: datasetrow[] }> }, at: number): dataset {
  return { id, name: name || id, columns: grid.columns, rows: grid.rows, sources: [], at };
}

/** Computes the deterministic checksum of an exported artifact's content. */
export function checksum(value: string): string {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) hash = ((hash * 33) ^ value.charCodeAt(index)) >>> 0;
  return `fnv1a-${hash.toString(16)}`;
}

/** Serializes one dataset into the reviewed export format. */
export function exportcontent(datasetvalue: dataset, format: "csv" | "json" | "excel", delimiter = ","): string {
  if (format === "json") return tojson(datasetvalue.columns, datasetvalue.rows);
  if (format === "excel") return toexcel(datasetvalue.columns, datasetvalue.rows, datasetvalue.name);
  return tocsv(datasetvalue.columns, datasetvalue.rows, delimiter);
}

/** Builds one exported artifact record with its content and checksum for the task artifact store. */
export function exportartifact(id: string, datasetvalue: dataset, format: "csv" | "json" | "excel", stepid: string, content: string, at: number): exportedartifact {
  const extension = format === "excel" ? "xml" : format;
  return { id, kind: format, name: `${datasetvalue.name || datasetvalue.id}.${extension}`, stepid, rowcount: datasetvalue.rows.length, content, checksum: checksum(content), at };
}

/** Converts one exported artifact into the artifact record shape the run store keeps. */
export function artifactrecordof(artifact: exportedartifact): artifactrecord {
  return { id: artifact.id, kind: artifact.kind, name: artifact.name, stepid: artifact.stepid, at: artifact.at };
}

/** Plans the chunk boundaries of a streaming export from a user configured chunk size with no code ceiling. */
export function chunkplan(rows: number, chunk: number): Array<{ index: number; from: number; to: number }> {
  const size = Math.max(1, Math.floor(chunk));
  const chunks: Array<{ index: number; from: number; to: number }> = [];
  for (let from = 0; from < rows || chunks.length === 0; from += size) {
    const to = Math.min(rows, from + size);
    chunks.push({ index: chunks.length, from, to });
    if (to >= rows) break;
  }
  return chunks;
}

/** True when the stream writer must wait for acknowledgements: pending writes reached the in-flight budget of one. */
export function backpressure(written: number, acknowledged: number): boolean {
  return written - acknowledged >= 1;
}

/** Advances one stream state by one acknowledged chunk of rows. */
export function advancestream(state: streamstate, chunk: { index: number; to: number }, at: number, done: boolean): streamstate {
  return { datasetid: state.datasetid, name: state.name, chunk: chunk.index + 1, chunks: state.chunks, written: chunk.to, ...(done ? { done: true } : {}), at };
}

/** Returns the first unwritten row index of a stream, starting a fresh stream at zero. */
export function streamfrom(state: streamstate | undefined, rows: number): number {
  if (!state || state.done) return 0;
  return Math.min(state.written, rows);
}

/** Builds the initial stream state of one dataset. */
export function newstream(datasetvalue: dataset, chunks: number, at: number): streamstate {
  return { datasetid: datasetvalue.id, name: datasetvalue.name, chunk: 0, chunks, written: 0, at };
}

/** Advances one extraction session by one extracted page with its row count. */
export function advancecursor(sessionvalue: extractsession, page: string, rows: number, at: number, done: boolean): extractsession {
  return {
    id: sessionvalue.id,
    datasetid: sessionvalue.datasetid,
    name: sessionvalue.name,
    target: sessionvalue.target,
    next: sessionvalue.next,
    planned: sessionvalue.planned,
    pages: [...sessionvalue.pages, page],
    rows: sessionvalue.rows + rows,
    cursor: sessionvalue.cursor + 1,
    ...(done || sessionvalue.cursor + 1 >= sessionvalue.planned ? { done: true } : {}),
    startedat: sessionvalue.startedat,
    updatedat: at,
  };
}

/** Builds the initial extraction session of one dataset extraction. */
export function newextractsession(id: string, datasetid: string, name: string, target: string, next: string, planned: number, at: number): extractsession {
  return { id, datasetid, name, target, next, planned, pages: [], rows: 0, cursor: 0, startedat: at, updatedat: at };
}

/** Returns the pages an interrupted extraction still owes after its stored cursor. */
export function remainingpages(sessionvalue: extractsession, planned: number): number {
  if (sessionvalue.done) return 0;
  return Math.max(0, Math.max(sessionvalue.planned, planned) - sessionvalue.cursor);
}

/** Builds one provenance record of an exported artifact with its source url, step ref, row range and checksum. */
export function provenancefor(artifact: { id: string; name: string; rowcount: number; checksum: string }, url: string, stepid: string, at: number): provenancerecord {
  return { artifact: artifact.id, name: artifact.name, url, stepid, rowstart: artifact.rowcount > 0 ? 1 : 0, rowend: artifact.rowcount, checksum: artifact.checksum, at };
}

/** Applies the user configured artifact retention to exported artifacts; an absent setting keeps everything. */
export function retainedexports<T>(records: T[], retention: number | undefined): T[] {
  return retention === undefined ? records : records.slice(0, retention);
}

/** Interpolates one text through the {{column}} tokens of a dataset row; only the row's own string values answer a token because an inherited property never leaks object internals into a step payload. The token walk is a single linear scan: a brace expression over library input answers attacker paced backtracking, so the scanner resolves each token with plain index arithmetic instead. */
export function interpolate(text: string, row: datasetrow): string {
  let out = "";
  let cursor = 0;
  for (;;) {
    const open = text.indexOf("{{", cursor);
    if (open < 0) return out + text.slice(cursor);
    const close = text.indexOf("}", open + 2);
    if (close < 0) return out + text.slice(cursor);
    if (close > open + 2 && text.charCodeAt(close + 1) === 125) {
      out += text.slice(cursor, open);
      const value = row[text.slice(open + 2, close).trim()];
      out += typeof value === "string" ? value : "";
      cursor = close + 2;
      continue;
    }
    out += text.slice(cursor, open + 2);
    cursor = open + 2;
  }
}

/** Substitutes the row variables of one looprows iteration into the target, value and options of the inner step. */
export function loopstep(step: toolstep, row: datasetrow): toolstep {
  return {
    ...step,
    ...(step.target !== undefined ? { target: interpolate(step.target, row) } : {}),
    ...(step.value !== undefined ? { value: interpolate(step.value, row) } : {}),
    ...(step.options !== undefined ? { options: interpolate(step.options, row) } : {}),
  };
}

/** Exposes one dataset row as the step variables of a looprows iteration. */
export function loopvariables(row: datasetrow): datasetrow {
  return { ...row };
}

/** Builds the grid preview of a dataset with its column order, total rows and sampled rows. */
export function gridpreview(datasetvalue: dataset, sample: number): { datasetid: string; columns: string[]; rows: number; sample: datasetrow[] } {
  return { datasetid: datasetvalue.id, columns: datasetvalue.columns.map(column => column.key), rows: datasetvalue.rows.length, sample: datasetvalue.rows.slice(0, Math.max(0, Math.floor(sample))) };
}

/** Sorts dataset rows by one column key in the reviewed direction with a stable fallback for equal values. */
export function sortrows(rows: datasetrow[], key: string, direction: "asc" | "desc"): datasetrow[] {
  const sign = direction === "desc" ? -1 : 1;
  return [...rows].sort((left, right) => {
    const a = left[key] ?? "";
    const b = right[key] ?? "";
    const numeric = Number(a);
    const numericb = Number(b);
    if (Number.isFinite(numeric) && Number.isFinite(numericb) && a.trim() !== "" && b.trim() !== "") return (numeric - numericb) * sign;
    return a.localeCompare(b) * sign;
  });
}

/** Builds the sheet push payload of one dataset for a reviewed sheet endpoint. */
export function sheetpayload(datasetvalue: dataset, sheet: string): { sheet: string; columns: string[]; rows: datasetrow[] } {
  return { sheet, columns: datasetvalue.columns.map(column => column.key), rows: datasetvalue.rows };
}

/** Merges reviewed transform rules and dedupe keys into the task rules record of one task. */
export function mergetaskrules(existing: { taskid: string; transforms: transformrule[]; dedupekeys: string[] } | undefined, taskid: string, transforms: transformrule[], dedupekeys: string[], at: number): { taskid: string; transforms: transformrule[]; dedupekeys: string[]; at: number } {
  return {
    taskid,
    transforms: transforms.length > 0 ? transforms : (existing?.transforms ?? []),
    dedupekeys: dedupekeys.length > 0 ? dedupekeys : (existing?.dedupekeys ?? []),
    at,
  };
}

/* ── Merged from pipelines.ts: the 1.1.90 consolidation interns the correlated pipelines logic here, so no variation of the same file lives beside another. ── */
/**
 * Data pipeline logic of the 1.1.75 family.
 * Every correlated rule for the streaming of large extracts to disk chunk by chunk with a cursor that checkpoints after every write, the resume of an interrupted extraction from its streamcursor with the already persisted rows skipped by their keys, the transform rules that reshape one value at a time while the raw value stays beside the transformed one, the row deduplication over the configured columns with whitespace and case normalization, the preview sampling of a subset without ever touching the full extract, the source stamps that attach the url, the step and the capture time to every row and every cell, the grid preview that projects rows and columns into a sortable filterable view, the provenance log that records one append only entry per stream, transform, dedupe, sample and resume pass and answers provenance queries by row key lives in this file.
 * The pipeline layer never bypasses a review: streamdisk writes through the reviewed sink only, resumeextract continues only the same plan of the same origin, transformvalues refuses the transforms that would drop rows silently, deduperows keeps the first occurrence and reports every dropped row, samplerows never mutates the stored extract, sourcestamp never rewrites a stamped timestamp, gridpreview projects a read only view, and provlog redacts the secret shaped values before any entry lands so the audit trail carries provenance without payloads.
 */

/** Normalizes one key value for the dedupe comparison: whitespace folds its runs and trims the ends, case lowercases, and the configured normalization applies exactly while an unconfigured comparison reads the raw value. */
function normalizekeyvalue(value: string, normalization: dedupekey["normalization"]): string {
  let normalized = value;
  if (normalization === "whitespace" || normalization === "whitespace and case") normalized = normalized.replace(/\s+/g, " ").trim();
  if (normalization === "case" || normalization === "whitespace and case") normalized = normalized.toLowerCase();
  return normalized;
}

/** Streams the rows of one extract to its sink chunk by chunk: only the active chunk rides the write at a time, every chunk reports the rows and the bytes it persisted, the streamcursor records the last written position after each chunk so the checkpoint call sees every boundary, and an absent chunk size streams the whole extract as one chunk because the chunk bound stays a user choice with no code default. */
export function streamdisk(input: { pipeline: extractpipeline; rows: extractrow[]; write: (chunk: extractrow[]) => number; cursor?: streamcursor; chunk?: number; checkpoint?: (cursor: streamcursor) => void; now: number }): { cursor: streamcursor; rowswritten: number; byteswritten: number; chunks: number; reason: string } {
  if (input.pipeline.id.trim() === "") throw new Error("The streamdisk pass needs its pipeline; every streamed extract carries its identity.");
  const startoffset = input.cursor !== undefined && input.cursor.pipelineid === input.pipeline.id ? input.cursor.offset : 0;
  const startchunk = input.cursor !== undefined && input.cursor.pipelineid === input.pipeline.id ? input.cursor.chunk : 0;
  if (input.chunk !== undefined && (!Number.isInteger(input.chunk) || input.chunk <= 0)) throw new Error("The stream chunk size stays a positive whole number of rows the user chose; the chunk bound never defaults in code.");
  const remaining = input.rows.slice(startoffset);
  const size = input.chunk !== undefined ? input.chunk : remaining.length;
  let rowswritten = 0;
  let byteswritten = 0;
  let chunks = 0;
  let cursor: streamcursor = { pipelineid: input.pipeline.id, offset: startoffset, chunk: startchunk, updatedat: input.now };
  for (let index = 0; index < remaining.length; index += size) {
    const active = remaining.slice(index, index + size);
    byteswritten += input.write(active);
    rowswritten += active.length;
    chunks += 1;
    cursor = { pipelineid: input.pipeline.id, offset: startoffset + rowswritten, chunk: startchunk + chunks, updatedat: input.now };
    input.checkpoint?.(cursor);
  }
  return { cursor, rowswritten, byteswritten, chunks, reason: `Streamed ${rowswritten} row${rowswritten === 1 ? "" : "s"} of the pipeline ${input.pipeline.name} to the reviewed sink in ${chunks} chunk${chunks === 1 ? "" : "s"} of ${size} row${size === 1 ? "" : "s"} with ${byteswritten} byte${byteswritten === 1 ? "" : "s"} written; only the active chunk rode the write and the cursor checkpoints after every chunk.` };
}

/** Continues one interrupted pipeline from its streamcursor: the rows the cursor offset and the persisted row keys already cover skip so nothing writes twice, the resume marks the pipeline in the provlog, and a pipeline of another plan or another origin refuses loudly because a resume continues exactly the extraction it came from. */
export function resumeextract(input: { pipeline: extractpipeline; rows: extractrow[]; cursor?: streamcursor; persistedkeys?: string[]; logid?: string; now: number }): { pipeline: extractpipeline; rows: extractrow[]; skipped: number; cursor: streamcursor; entry: provlogentry } {
  if (input.pipeline.id.trim() === "") throw new Error("The resume names its pipeline; an interrupted extraction carries its identity.");
  if (input.pipeline.state === "finished") throw new Error(`The pipeline ${input.pipeline.name} already finished; a finished extraction resumes nothing.`);
  const cursor = input.cursor ?? { pipelineid: input.pipeline.id, offset: 0, chunk: 0, updatedat: input.now };
  if (cursor.pipelineid !== input.pipeline.id) throw new Error(`The streamcursor of ${cursor.pipelineid} belongs to another pipeline; the resume continues exactly the extraction it came from.`);
  const persisted = new Set(input.persistedkeys ?? []);
  const remaining: extractrow[] = [];
  let skipped = 0;
  for (const [index, row] of input.rows.entries()) {
    if (index < cursor.offset || persisted.has(row.key)) { skipped += 1; continue; }
    remaining.push(row);
  }
  const entry: provlogentry = { id: input.logid !== undefined && input.logid.trim() !== "" ? input.logid.trim() : `${input.pipeline.id}:resume`, pipelineid: input.pipeline.id, runid: input.pipeline.runid, operation: "resume", rowkeys: remaining.map(row => row.key), summary: `The pipeline ${input.pipeline.name} resumed from the streamcursor at offset ${cursor.offset} and chunk ${cursor.chunk}: ${skipped} row${skipped === 1 ? "" : "s"} already persisted skipped by their row keys and ${remaining.length} row${remaining.length === 1 ? "" : "s"} continue to the reviewed sink.`, at: input.now };
  const pipeline: extractpipeline = { ...input.pipeline, state: "running", updatedat: input.now };
  return { pipeline, rows: remaining, skipped, cursor: { ...cursor, updatedat: input.now }, entry };
}

/** Applies the reviewed transform rules between extraction and export: every rule reshapes exactly its field through its reviewed operation — trim folds the whitespace, case folds the letters, number strips the non numeric shapes and date normalizes to ISO 8601 — the raw value stays beside the transformed value so the audit reads both sides, and a transform never drops a row: an operation that cannot apply keeps the raw value and names its refusal while every row survives the pass. */
export function transformvalues(input: { rows: extractrow[]; rules: transformrule[] }): { rows: extractrow[]; applied: number; refusals: string[] } {
  const refusals: string[] = [];
  let applied = 0;
  const rows = input.rows.map(row => {
    let values = { ...row.values };
    let rawvalues = row.rawvalues !== undefined ? { ...row.rawvalues } : {};
    for (const rule of input.rules) {
      const field = rule.field ?? rule.target;
      const original = values[field] ?? "";
      if (rule.operation !== undefined && !["trim", "case", "number", "date"].includes(rule.operation)) {
        refusals.push(`${field}: the operation ${rule.operation} is not a reviewed transform; the raw value stays and the pipeline refuses the rule.`);
        continue;
      }
      let transformed = original;
      if (rule.operation === "trim") transformed = original.replace(/\s+/g, " ").trim();
      if (rule.operation === "case") transformed = original.toUpperCase();
      if (rule.operation === "number") transformed = original.replace(/[^\d.\-]/g, "");
      if (rule.operation === "date") {
        const parsed = Date.parse(original.trim());
        if (Number.isNaN(parsed)) {
          refusals.push(`${field}: the value ${original} parses as no date; the raw value stays beside the refused transform.`);
          continue;
        }
        transformed = new Date(parsed).toISOString();
      }
      if (rule.operation === undefined) continue;
      if (transformed !== original) applied += 1;
      rawvalues = { ...rawvalues, [field]: original };
      values = { ...values, [field]: transformed };
    }
    return { ...row, values, ...(Object.keys(rawvalues).length > 0 ? { rawvalues } : {}) };
  });
  if (rows.length !== input.rows.length) throw new Error("A transform pass never drops a row; every row keeps its place with the raw value beside the transformed one.");
  return { rows, applied, refusals };
}

/** Deduplicates the rows of one pipeline by its configured key: the key columns join into one comparison value under the configured normalization — whitespace folding, case folding, both or none — with every column part JSON quoted so a cell value that embeds the join separator never collides two distinct rows, the first occurrence of every key stays, the dropped rows report by count and by key, and an empty key list refuses loudly because a dedupe without its columns would compare whole rows the user never configured. */
export function deduperows(input: { rows: extractrow[]; key: dedupekey }): { kept: extractrow[]; dropped: number; droppedkeys: string[]; reason: string } {
  const columns = input.key.columns.map(column => column.trim()).filter(column => column !== "");
  if (columns.length === 0) throw new Error("The dedupe key names its columns; an empty key would compare whole rows the user never configured.");
  const seen = new Set<string>();
  const kept: extractrow[] = [];
  const droppedkeys: string[] = [];
  for (const row of input.rows) {
    const joined = columns.map(column => JSON.stringify(normalizekeyvalue(row.values[column] ?? "", input.key.normalization))).join("|");
    if (seen.has(joined)) { droppedkeys.push(row.key); continue; }
    seen.add(joined);
    kept.push(row);
  }
  return { kept, dropped: droppedkeys.length, droppedkeys, reason: `Deduplicated ${input.rows.length} row${input.rows.length === 1 ? "" : "s"} by ${columns.join(", ")} under the ${input.key.normalization} normalization: the first occurrence of every key stays and ${droppedkeys.length} duplicate${droppedkeys.length === 1 ? "" : "s"} dropped with the count reported.` };
}

/** Selects the preview subset of one extract by its sample policy: the first strategy takes the leading rows, the random strategy shuffles deterministically under the seeded generator the policy names, the stratified strategy spreads the pick evenly across the ordered extract, and the full extract never mutates — the subset copies its rows so the stored batch keeps exactly what it held. */
export function samplerows(input: { rows: extractrow[]; policy: samplepolicy; seed?: number }): { rows: extractrow[]; strategy: samplepolicy["strategy"]; reason: string } {
  if (!Number.isInteger(input.policy.rows) || input.policy.rows <= 0) throw new Error("The sample policy names its row count as a positive whole number the user chose; the preview bound never defaults in code.");
  const count = Math.min(input.policy.rows, input.rows.length);
  let picked: extractrow[] = [];
  if (input.policy.strategy === "first") picked = input.rows.slice(0, count);
  else if (input.policy.strategy === "stratified") {
    if (count === 0) picked = [];
    else {
      const stride = input.rows.length / count;
      for (let index = 0; index < count; index += 1) {
        const row = input.rows[Math.floor(index * stride)];
        if (row !== undefined) picked.push(row);
      }
    }
  } else {
    let state = (input.seed ?? 1) >>> 0 || 1;
    const next = (): number => { state = (state * 1664525 + 1013904223) >>> 0; return state / 0x100000000; };
    const ordered = input.rows.map((row, index) => ({ row, order: next() * (input.rows.length + 1) + index }));
    picked = ordered.sort((one, two) => one.order - two.order).slice(0, count).map(entry => entry.row);
  }
  return { rows: picked.map(row => ({ ...row, values: { ...row.values } })), strategy: input.policy.strategy, reason: `Sampled ${picked.length} of ${input.rows.length} row${input.rows.length === 1 ? "" : "s"} by the ${input.policy.strategy} strategy of the user policy; the full extract stays untouched and the preview reads a copy.` };
}

/** Stamps the rows of one extraction pass with their source: the url, the step id and the capture time build one sourcestamprecord, every row of the pass carries the stamp, every cell links to the stamp id so each value answers which page and step captured it, and a row that already carries the same stamp keeps it once because a stamped timestamp never rewrites. */
export function sourcestamp(input: { rows: extractrow[]; stampid: string; url: string; stepid: string; now: number }): { rows: extractrow[]; stamp: sourcestamprecord } {
  if (input.stampid.trim() === "") throw new Error("The source stamp needs its id; every stamp carries its identity for the cell links.");
  if (input.url.trim() === "") throw new Error("The source stamp names its url; every extracted row answers the page it came from.");
  if (input.stepid.trim() === "") throw new Error("The source stamp names its step; every extracted row answers the reviewed step that captured it.");
  const stamp: sourcestamprecord = { id: input.stampid.trim(), url: input.url.trim(), stepid: input.stepid.trim(), capturedat: input.now };
  const rows = input.rows.map(row => {
    const stamps = row.stamps.some(existing => existing.id === stamp.id) ? row.stamps : [...row.stamps, stamp];
    const cellstamps: Record<string, string> = { ...(row.cellstamps ?? {}) };
    for (const field of Object.keys(row.values)) cellstamps[field] = stamp.id;
    return { ...row, stamps, cellstamps };
  });
  return { rows, stamp };
}

/** Infers the kind of one grid column from its sampled values: numbers, booleans and ISO dates infer their kind while every other shape stays text; an all empty column stays text because the preview never guesses a kind it did not observe. */
function columnkindof(values: string[]): gridcolumn["kind"] {
  const present = values.filter(value => value.trim() !== "");
  if (present.length === 0) return "text";
  if (present.every(value => /^-?\d+(?:\.\d+)?$/.test(value.trim()))) return "number";
  if (present.every(value => value.trim() === "true" || value.trim() === "false")) return "boolean";
  if (present.every(value => !Number.isNaN(Date.parse(value.trim())) && /\d{4}-\d{2}-\d{2}/.test(value.trim()))) return "date";
  return "text";
}

/** Projects the rows of one extract into a read only grid model: the columns build from the observed fields with their kinds inferred from the sampled values and their widths derived from the content, the sort orders by any column without touching the stored extract, the filter keeps the rows whose cells carry the query, and every projected row carries its marks — stamped when its stamps exist, transformed for the fields whose raw values survive beside them, deduplicated for the rows a dedupe pass kept. */
export function pipelinegridpreview(input: { rows: extractrow[]; sort?: { column: string; direction: "ascending" | "descending" }; filter?: string; dedupekeys?: string[] }): { columns: gridcolumn[]; rows: Array<{ key: string; values: Record<string, string>; stamped: boolean; transformed: string[]; deduplicated: boolean }>; total: number } {
  const fields = [...new Set(input.rows.flatMap(row => Object.keys(row.values)))];
  const columns: gridcolumn[] = fields.map(field => {
    const values = input.rows.map(row => row.values[field] ?? "");
    const width = Math.max(field.length, ...values.map(value => value.length));
    return { name: field, kind: columnkindof(values), width };
  });
  const query = (input.filter ?? "").trim().toLowerCase();
  const deduped = new Set(input.dedupekeys ?? []);
  let rows = input.rows.map(row => ({ key: row.key, values: { ...row.values }, stamped: row.stamps.length > 0, transformed: Object.keys(row.rawvalues ?? {}), deduplicated: deduped.has(row.key) }));
  if (query !== "") rows = rows.filter(row => Object.values(row.values).some(value => value.toLowerCase().includes(query)));
  if (input.sort !== undefined) {
    const column = columns.find(candidate => candidate.name === input.sort?.column);
    if (column === undefined) throw new Error(`The grid preview knows no ${input.sort.column} column to sort; the projection sorts by the columns it observed.`);
    const direction = input.sort.direction === "descending" ? -1 : 1;
    rows = rows.sort((left, right) => {
      const one = left.values[column.name] ?? "";
      const two = right.values[column.name] ?? "";
      let compared = 0;
      if (column.kind === "number") compared = Number(one) - Number(two);
      else if (column.kind === "boolean") compared = (one === "true" ? 1 : 0) - (two === "true" ? 1 : 0);
      else if (column.kind === "date") compared = Date.parse(one) - Date.parse(two);
      else compared = one.localeCompare(two);
      return direction * compared;
    });
  }
  return { columns, rows, total: input.rows.length };
}

/** Redacts the secret shaped values before one provlog entry lands: the assignments of tokens, passwords, keys and bearer credentials mask to their label so the provenance log carries the operation and its row keys without ever carrying a payload. */
function redactprovenance(text: string): string {
  return text
    .replace(/\b(api[- ]?key|token|secret|password|passwd|bearer|authorization)\b(\s*[:=]\s*)\S+/gi, "$1$2[redacted]")
    .replace(/\bsk-[a-z0-9]{16,}\b/gi, "[redacted key]")
    .replace(/\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, "[redacted token]")
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[redacted private key]");
}

/** Appends one provenance log entry for one extraction operation: every stream, transform, dedupe, sample and resume pass lands exactly one entry with the row keys it touched and its redacted summary, the log refuses an entry whose id already sits in it because the provlog stays append only for the audit integrity, and the secret shaped values mask before the entry ever lands. */
export function provlog(input: { entries: provlogentry[]; id: string; pipelineid: string; runid: string; operation: provlogentry["operation"]; rowkeys: string[]; summary: string; now: number }): { entries: provlogentry[]; entry: provlogentry } {
  if (input.id.trim() === "") throw new Error("The provlog entry needs its id; every logged operation carries its identity.");
  if (input.pipelineid.trim() === "") throw new Error("The provlog entry names its pipeline; the provenance log stays per pipeline.");
  if (input.summary.trim() === "") throw new Error("The provlog entry needs its summary in plain language; the audit reads exactly what the operation did.");
  if (input.entries.some(entry => entry.id === input.id.trim())) throw new Error(`The provlog entry ${input.id.trim()} already sits in the log; the provenance log stays append only and an entry never rewrites.`);
  const entry: provlogentry = { id: input.id.trim(), pipelineid: input.pipelineid.trim(), runid: input.runid, operation: input.operation, rowkeys: [...input.rowkeys], summary: redactprovenance(input.summary.trim()), at: input.now };
  return { entries: [...input.entries, entry], entry };
}

/** Answers the provenance query of one row key: every provlog entry that touches the row returns in order so the reader walks exactly the operations the row rode — the stream that persisted it, the transforms that reshaped it, the dedupe that kept or dropped it, the sample that previewed it and the resume that continued it. */
export function provlogquery(entries: provlogentry[], rowkey: string): provlogentry[] {
  return entries.filter(entry => entry.rowkeys.includes(rowkey)).sort((one, two) => one.at - two.at || (one.id < two.id ? -1 : 1));
}

/** Tracks the live state of the pipelines of the workspace: the running, paused and finished counts roll per run so the popup and the sidepanel read exactly how many extracts stream, wait and finished, and the counts derive from the stored pipelines without ever writing one. */
export function pipelinestate(input: { pipelines: extractpipeline[] }): { running: number; paused: number; finished: number; perrun: Array<{ runid: string; running: number; paused: number; finished: number }> } {
  const runs = [...new Set(input.pipelines.map(pipeline => pipeline.runid))];
  return {
    running: input.pipelines.filter(pipeline => pipeline.state === "running").length,
    paused: input.pipelines.filter(pipeline => pipeline.state === "paused").length,
    finished: input.pipelines.filter(pipeline => pipeline.state === "finished").length,
    perrun: runs.map(runid => ({ runid, running: input.pipelines.filter(pipeline => pipeline.runid === runid && pipeline.state === "running").length, paused: input.pipelines.filter(pipeline => pipeline.runid === runid && pipeline.state === "paused").length, finished: input.pipelines.filter(pipeline => pipeline.runid === runid && pipeline.state === "finished").length })),
  };
}

/** Builds one extract batch of a finished pass: the rows and their streamcursor bundle under the pipeline identity so the preview and the resume read exactly the same rows. */
export function extractbatchof(input: { id: string; pipeline: extractpipeline; rows: extractrow[]; cursor: streamcursor; now: number }): extractbatch {
  if (input.id.trim() === "") throw new Error("The extract batch needs its id; every previewed pass carries its identity.");
  return { id: input.id.trim(), pipelineid: input.pipeline.id, rows: input.rows, cursor: input.cursor, at: input.now };
}

/* ── Merged from streamparse.ts: the 1.1.90 consolidation interns the correlated streamparse logic here, so no variation of the same file lives beside another. ── */
/**
 * Streamparse logic of the 1.1.68 family.
 * Pages too large for one pass parse in chunks inside a worker: the stream tokenizer walks the page text window by window, yields observations progressively as each chunk completes and never holds the full page text in memory, while every chunk passes through the same schemastrict validation the one pass parser runs.
 * Big tables extract through chunkextract: the cursor carries the table fingerprint, slices big tables into resumable row windows, emits each window as a partial extraction result, resumes from its cursor after an interruption and merges the windows into the datagrid incrementally.
 */

/** The byte bound of one streamparse chunk the caller supplies: the bound stays the user's choice, and the parser never holds more than the current chunk. */
export type streamparseoptions = { chunkbytes: number };

/** Splits one large page into chunk windows without holding the full text: the splitter returns the chunk count and the byte range of each chunk while the caller feeds one chunk at a time. */
export function streamparsewindows(input: { bytes: number; chunkbytes: number }): { chunks: number; windows: Array<{ index: number; start: number; end: number }> } {
  if (input.chunkbytes <= 0) throw new Error("The streamparse chunk bound must stay a positive number of bytes; the bound stays the user's choice and never defaults inside the engine.");
  const chunks = Math.ceil(input.bytes / input.chunkbytes);
  const windows = Array.from({ length: chunks }, (_, index) => ({ index, start: index * input.chunkbytes, end: Math.min((index + 1) * input.chunkbytes, input.bytes) }));
  return { chunks, windows };
}

/** Tokenizes one chunk of a large page: the tokenizer walks the chunk text, splits text, element and attribute tokens and keeps the chunk bytes bounded so the full page text never assembles in memory. */
export function streamparsechunkof(input: { index: number; text: string; chunkbytes: number; last: boolean }): streamparsechunk {
  if (input.text.length > input.chunkbytes) throw new Error(`The streamparse chunk ${input.index} carries ${input.text.length} bytes over the ${input.chunkbytes} byte bound; the parser never holds more than one chunk.`);
  const tokens: streamparsetoken[] = [];
  const pattern = /(<\/?[a-zA-Z][^>]*>)|([^<]+)/g;
  for (const match of input.text.matchAll(pattern)) {
    const element = match[1];
    const text = match[2];
    if (element !== undefined) {
      tokens.push({ chunk: input.index, text: element, kind: "element" });
      const attributes = element.match(/[a-zA-Z-]+="[^"]*"/g) ?? [];
      for (const attribute of attributes) tokens.push({ chunk: input.index, text: attribute, kind: "attribute" });
      continue;
    }
    if (text !== undefined && text.trim() !== "") tokens.push({ chunk: input.index, text: text.trim(), kind: "text" });
  }
  const observations = tokens.filter(token => token.kind === "text").map(token => token.text);
  return { index: input.index, tokens, observations, bytes: input.text.length, complete: input.last };
}

/** Validates one streamparse chunk through the same schemastrict validation the one pass parser runs: a chunk outside the shape the parser accepts refuses the whole stream before any observation yields. */
export function validatesetreamparsechunk(chunk: unknown, expectedindex: number): { valid: boolean; reason?: string } {
  if (!Boolean(chunk) || typeof chunk !== "object" || Array.isArray(chunk)) return { valid: false, reason: "Every streamparse chunk travels as one plain object; schemastrict refuses the chunk carrier." };
  const candidate = chunk as { index?: unknown; tokens?: unknown; bytes?: unknown; complete?: unknown };
  if (typeof candidate.index !== "number" || candidate.index !== expectedindex) return { valid: false, reason: `The streamparse chunk must carry its index ${expectedindex}; a chunk out of order never yields observations.` };
  if (!Array.isArray(candidate.tokens)) return { valid: false, reason: "The streamparse chunk carries its tokens as an array." };
  if (typeof candidate.bytes !== "number") return { valid: false, reason: "The streamparse chunk carries its byte count as a number." };
  if (typeof candidate.complete !== "boolean") return { valid: false, reason: "The streamparse chunk carries its completion flag as a boolean." };
  return { valid: true };
}

/** Yields the observations of one streamparse chunk progressively: each chunk completes into its own observation batch while the stream never waits for the last chunk before yielding the earlier ones. */
export function streamparseobservations(chunks: streamparsechunk[]): { progressive: string[][]; total: number } {
  const progressive: string[][] = [];
  let total = 0;
  for (const chunk of chunks) {
    progressive.push(chunk.observations);
    total += chunk.observations.length;
  }
  return { progressive, total };
}

/** Builds the memory bound summary of one streamparse stream: the peak bytes stay at one chunk bound because the full page text never assembles in memory. */
export function streamparsememorybound(input: { chunkbytes: number; chunks: number }): { peak: number; fullpage: number; saved: number } {
  const fullpage = input.chunkbytes * input.chunks;
  return { peak: input.chunkbytes, fullpage, saved: Math.max(fullpage - input.chunkbytes, 0) };
}

/** Opens one chunkextract cursor at the head of a big table: the cursor carries the table fingerprint the resume verifies and the user configured row window. */
export function openchunkextractcursor(input: { tableid: string; fingerprint: string; rows: number; window?: number; now?: number }): chunkextractcursor {
  if (input.tableid.trim() === "") throw new Error("The chunkextract cursor needs its table id.");
  if (input.fingerprint.trim() === "") throw new Error("The chunkextract cursor needs its table fingerprint; a resume without its fingerprint never continues.");
  if (input.window !== undefined && input.window <= 0) throw new Error("The chunkextract row window stays a positive row count and the user's choice.");
  return { tableid: input.tableid, fingerprint: input.fingerprint, rowindex: 0, window: input.window ?? input.rows, complete: input.rows === 0 };
}

/** Slices one window of rows out of a big table: the cursor advances by the window size, the window emits as one partial extraction result and the cursor completes once the row range ends. */
export function chunkextractwindow(input: { cursor: chunkextractcursor; rows: Array<Record<string, string>> }): chunkextractwindowresult {
  if (input.cursor.rowindex > input.rows.length) throw new Error("The chunkextract cursor stands past the end of its table; open a fresh cursor for a new table.");
  const end = Math.min(input.cursor.rowindex + input.cursor.window, input.rows.length);
  const rows = input.rows.slice(input.cursor.rowindex, end);
  const cursor: chunkextractcursor = { ...input.cursor, rowindex: end, complete: end >= input.rows.length };
  return { cursor, rows, complete: cursor.complete };
}

/** Resumes one chunkextract cursor after an interruption: the stored fingerprint must match the table the resume addresses or the resume refuses and the caller opens a fresh cursor. */
export function resumechunkextract(input: { cursor: chunkextractcursor; tableid: string; fingerprint: string }): { resumed: boolean; reason: string } {
  if (input.cursor.tableid !== input.tableid) return { resumed: false, reason: `The chunkextract cursor belongs to the table ${input.cursor.tableid} while the resume addresses ${input.tableid}; open a fresh cursor.` };
  if (input.cursor.fingerprint !== input.fingerprint) return { resumed: false, reason: `The table fingerprint changed since the cursor stopped; the resume refuses so no window mixes two table states.` };
  if (input.cursor.complete) return { resumed: false, reason: "The chunkextract cursor already completed its table; the merge holds every window." };
  return { resumed: true, reason: `The cursor resumes at row ${input.cursor.rowindex} of the unchanged table.` };
}

/** Merges the windows of one chunkextract stream into the datagrid incrementally: every window appends its rows in arrival order while a repeated or out of order window never duplicates a row. */
export function mergechunkwindows(windows: chunkextractwindowresult[]): { rows: Array<Record<string, string>>; duplicates: number } {
  const rows: Array<Record<string, string>> = [];
  const seen = new Set<string>();
  let duplicates = 0;
  for (const window of windows) {
    for (const row of window.rows) {
      const key = Object.keys(row).sort().map(column => `${column}=${row[column] ?? ""}`).join("|");
      if (seen.has(key)) { duplicates += 1; continue; }
      seen.add(key);
      rows.push(row);
    }
  }
  return { rows, duplicates };
}

/** Reads the progress line of one chunkextract stream the datagrid shows: the rows extracted so far beside the total the cursor covers. */
export function chunkextractprogress(cursor: chunkextractcursor, totalrows: number): { extracted: number; total: number; share: number; complete: boolean } {
  return { extracted: cursor.rowindex, total: totalrows, share: totalrows === 0 ? 1 : cursor.rowindex / totalrows, complete: cursor.complete };
}

/** Shapes one streamparse stream into the offscreen worker task payload: the chunked parse runs inside the worker pool the 1.1.60 family introduced, beside the chunkextract windows of big tables. */
export function streamparsetaskof(input: { runid: string; stepid: string; chunkbytes: number; chunks: number }): { task: "streamparse"; runid: string; stepid: string; chunkbytes: number; chunks: number } {
  if (input.chunkbytes <= 0) throw new Error("The streamparse worker task needs its positive chunk bound.");
  return { task: "streamparse", runid: input.runid, stepid: input.stepid, chunkbytes: input.chunkbytes, chunks: input.chunks };
}

/** Shapes one chunkextract window task into the offscreen worker payload: the worker slices one row window and returns the advanced cursor with its partial rows. */
export function chunkextracttaskof(input: { runid: string; stepid: string; tableid: string; fingerprint: string; rowindex: number; window: number }): { task: "chunkextract"; runid: string; stepid: string; tableid: string; fingerprint: string; rowindex: number; window: number } {
  if (input.window <= 0) throw new Error("The chunkextract worker task needs its positive row window.");
  return { task: "chunkextract", runid: input.runid, stepid: input.stepid, tableid: input.tableid, fingerprint: input.fingerprint, rowindex: input.rowindex, window: input.window };
}
