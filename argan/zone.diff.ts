// # zone.diff — the planned change set between two versions of a zone, housed at the argan root.
// Library-grade module shipped inside the published packages (npm, maven with the Spring
// Boot rider): it owns the domain types and pure, generic helpers only — zero consumer
// data. The shape follows the plan discipline of external-dns (the kubernetes-sigs
// planner): records group by owner name and type, the targets compare as a set (round
// robin order never produces a change) and an unconfigured TTL never triggers an update.
// Wire: the Sol zone pages serve the verbatim RecordSetRow tables of argan.ts; this
// module parses those same lines into normalized records, diffs them and suggests the
// next YYYYMMDDNN serial through argan.nextSerial — a publication never hardcodes a row.

import { nextSerial, type RecordSetRow } from "./argan.ts";

/** One normalized zone record (owner name, type, ttl and rdata). */
export interface ZoneRecord {
  /** absolute owner name, lowercase, trailing dot kept ("www.example.com.") */
  name: string;
  /** record type, uppercase ("A", "NS", "CNAME") */
  type: string;
  /** time to live in seconds; undefined inherits the zone default and never triggers an update */
  ttl?: number;
  /** normalized rdata: name tokens absolute and lowercase, the rest verbatim */
  data: string;
}

/** One planned change of the diff (the external-dns create/update/delete vocabulary). */
export interface RecordChange {
  action: "create" | "delete" | "update";
  name: string;
  type: string;
  /** the record as it exists in the current version (absent for creates) */
  before?: ZoneRecord;
  /** the record as planned in the desired version (absent for deletes) */
  after?: ZoneRecord;
  /** what made the row a change: the target set or only the ttl */
  reason: "targets" | "ttl";
}

/** The planned change set between two versions of one zone. */
export interface ZoneDiff {
  creates: RecordChange[];
  deletes: RecordChange[];
  updates: RecordChange[];
}

/** Error raised by the zone-file parser for lines it cannot read (carries the line number). */
export class ZoneDiffError extends Error {
  /** the 1-based line number the parser choked on */
  readonly line: number;

  constructor(message: string, line: number, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ZoneDiffError";
    this.line = line;
  }
}

/** The rdata fields of each name-bearing type that hold domain names (field indexes). */
const NAMEFIELDS: Record<string, readonly number[]> = {
  NS: [0],
  CNAME: [0],
  PTR: [0],
  DNAME: [0],
  MX: [1],
  SRV: [3],
  SOA: [0, 1],
};

/** TTL unit multipliers for the RFC 2308 spellings ("1h30m"). */
const TTLUNITS: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };

/** Parses a TTL token: plain seconds ("300") or unit spellings ("1h30m"). */
function parseTtl(token: string): number {
  if (/^\d+$/.test(token)) return Number.parseInt(token, 10);
  const lower = token.toLowerCase();
  const units = lower.match(/\d+[smhdw]/g);
  if (!units || units.join("") !== lower) return Number.NaN;
  return units.reduce((total, part) => total + Number.parseInt(part, 10) * TTLUNITS[part.slice(-1)], 0);
}

/** Whether the token reads as a TTL (plain seconds or unit spellings). */
function isTtlToken(token: string): boolean {
  return /^\d+[smhdw]*$/i.test(token) && !Number.isNaN(parseTtl(token));
}

/** Makes a record name absolute and lowercase against the zone origin ("@" is the apex). */
function absolutize(name: string, origin: string): string {
  const lower = name.toLowerCase();
  if (lower === "@") return origin;
  if (lower.endsWith(".")) return lower;
  return `${lower}.${origin}`;
}

/** Normalizes the rdata of one record: the name fields absolute and lowercase, the rest verbatim. */
function normalizeData(type: string, data: string, origin: string): string {
  const fields = data.split(/\s+/);
  const nameFields = NAMEFIELDS[type];
  if (nameFields) {
    for (const index of nameFields) {
      const token = fields[index];
      if (token && token !== "@" && !/^\d+$/.test(token)) fields[index] = absolutize(token, origin);
      else if (token === "@") fields[index] = origin;
    }
  }
  return fields.join(" ");
}

/** Splits one zone-file line into its tokens, honoring quoted strings and `;` comments. */
function tokenize(line: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quoted = false;
  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === ";" && !quoted) break;
    if (!quoted && /\s/.test(char)) {
      if (current) tokens.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  if (current) tokens.push(current);
  return tokens;
}

/**
 * Parses a master zone file (RFC 1035 §5.1) into normalized records. Honored syntax:
 * comments and blank lines are dropped, `$ORIGIN` and `$TTL` directives, `@` as the
 * apex, owner inheritance on lines that start with whitespace, parenthesized
 * continuations joined into one record and the `[ttl] [class]` / `[class] [ttl]`
 * header orders. Quoted strings keep their inner spaces (presentation quotes are
 * stripped). Throws `ZoneDiffError` with the offending line number.
 *
 * @param text the zone file text (current or desired version).
 * @param defaultOrigin the zone origin when the file declares none ("example.com.").
 * @param defaultTtl the TTL applied to records without one (a `$TTL` directive wins).
 * @returns the normalized records in file order.
 */
export function parseZoneRecords(text: string, defaultOrigin: string, defaultTtl?: number): ZoneRecord[] {
  const bare = defaultOrigin.toLowerCase();
  const origin = bare.endsWith(".") ? bare : `${bare}.`;
  const records: ZoneRecord[] = [];
  let zoneTtl = defaultTtl;
  let originNow = origin;
  let owner = origin;
  let pending: { tokens: string[]; line: number; inheritsOwner: boolean } | null = null;
  const lines = text.split(/\r?\n/);

  for (let index = 0; index < lines.length; index++) {
    const raw = lines[index];
    const number = index + 1;
    const tokens = tokenize(raw);
    if (pending) {
      const closing = tokens.indexOf(")");
      pending.tokens.push(...(closing === -1 ? tokens : tokens.slice(0, closing)));
      if (closing === -1) continue;
      emitRecord(pending.tokens, pending.line, pending.inheritsOwner);
      pending = null;
      continue;
    }
    if (tokens.length === 0) continue;
    const directive = tokens[0].toUpperCase();
    if (directive === "$ORIGIN") {
      if (!tokens[1]) throw new ZoneDiffError("zone.diff: $ORIGIN needs a name", number);
      const declared = tokens[1].toLowerCase();
      originNow = declared.endsWith(".") ? declared : `${declared}.`;
      continue;
    }
    if (directive === "$TTL") {
      zoneTtl = parseTtl(tokens[1] ?? "");
      if (Number.isNaN(zoneTtl)) throw new ZoneDiffError(`zone.diff: unreadable $TTL "${tokens[1]}"`, number);
      continue;
    }
    if (directive === "$INCLUDE" || directive === "$GENERATE") {
      throw new ZoneDiffError(`zone.diff: ${directive} directives are not supported`, number);
    }
    const opening = tokens.indexOf("(");
    if (opening !== -1) {
      pending = { tokens: tokens.slice(0, opening), line: number, inheritsOwner: /^[ \t]/.test(raw) };
      continue;
    }
    emitRecord(tokens, number, /^[ \t]/.test(raw));
  }
  if (pending) throw new ZoneDiffError("zone.diff: unclosed parenthesis at end of file", pending.line);

  return records;

  /** Emits one parsed record from a complete token row (header, then rdata). */
  function emitRecord(tokens: string[], number: number, inheritsOwner: boolean): void {
    let cursor = 0;
    if (!inheritsOwner) {
      owner = absolutize(tokens[0], originNow);
      cursor = 1;
    }
    let ttl: number | undefined;
    for (let guard = 0; guard < 2 && cursor < tokens.length; guard++) {
      const token = tokens[cursor];
      if (ttl === undefined && isTtlToken(token)) {
        ttl = parseTtl(token);
        cursor += 1;
        continue;
      }
      if (token.toUpperCase() === "IN") {
        cursor += 1;
        continue;
      }
      break;
    }
    const type = (tokens[cursor] ?? "").toUpperCase();
    if (!/^[A-Z]{1,10}$/.test(type)) throw new ZoneDiffError(`zone.diff: unreadable record type "${tokens[cursor]}"`, number);
    cursor += 1;
    const data = normalizeData(type, tokens.slice(cursor).join(" "), originNow);
    if (!data) throw new ZoneDiffError(`zone.diff: ${type} record without rdata`, number);
    records.push({ name: owner, type, ttl: ttl ?? zoneTtl, data });
  }
}

/** Groups records by "name type" — the external-dns plan key. */
function groupRecords(records: readonly ZoneRecord[]): Map<string, ZoneRecord[]> {
  const groups = new Map<string, ZoneRecord[]>();
  for (const record of records) {
    const key = `${record.name} ${record.type}`;
    const group = groups.get(key);
    if (group) group.push(record);
    else groups.set(key, [record]);
  }
  return groups;
}

/** The sorted, de-duplicated rdata set of one record group (round robin order erased). */
function targetSet(group: readonly ZoneRecord[]): string[] {
  return [...new Set(group.map((record) => record.data))].sort();
}

/** Picks the representative record of a group (lowest ttl first, then lowest data). */
function pickPrimary(group: readonly ZoneRecord[]): ZoneRecord {
  return [...group].sort((left, right) => (left.ttl ?? 0) - (right.ttl ?? 0) || left.data.localeCompare(right.data))[0];
}

/**
 * Diffs the current version of a zone against the desired version. Records are
 * normalized first (names absolute and lowercase, ttl numeric), so identical rows
 * diff to an empty set. The change vocabulary follows external-dns: creates,
 * deletes and updates — an update carries both sides and its reason (targets or
 * ttl). A desired ttl of undefined inherits the zone default and never updates.
 *
 * @param current the records the zone serves now.
 * @param desired the records the zone should serve.
 * @returns the planned change set (empty arrays when the versions agree).
 */
export function diffZones(current: readonly ZoneRecord[], desired: readonly ZoneRecord[]): ZoneDiff {
  const now = groupRecords(current);
  const next = groupRecords(desired);
  const diff: ZoneDiff = { creates: [], deletes: [], updates: [] };
  for (const [key, nextGroup] of next) {
    const nowGroup = now.get(key);
    if (!nowGroup) {
      for (const after of nextGroup) diff.creates.push({ action: "create", name: after.name, type: after.type, after });
      continue;
    }
    const before = pickPrimary(nowGroup);
    const after = pickPrimary(nextGroup);
    const targetsDiffer = targetSet(nowGroup).join("\u0000") !== targetSet(nextGroup).join("\u0000");
    if (targetsDiffer) {
      diff.updates.push({ action: "update", name: before.name, type: before.type, before, after, reason: "targets" });
      continue;
    }
    if (after.ttl !== undefined && before.ttl !== after.ttl) {
      diff.updates.push({ action: "update", name: before.name, type: before.type, before, after, reason: "ttl" });
    }
  }
  for (const [key, nowGroup] of now) {
    if (next.has(key)) continue;
    for (const before of nowGroup) diff.deletes.push({ action: "delete", name: before.name, type: before.type, before });
  }
  return diff;
}

/**
 * Parses two verbatim zone files and diffs them in one call — the convenience over
 * {@link parseZoneRecords} + {@link diffZones}.
 *
 * @param currentText the zone file text the server answers now.
 * @param desiredText the reviewed zone file text to publish.
 * @param origin the zone origin ("example.com.").
 * @returns the planned change set.
 */
export function diffZoneFiles(currentText: string, desiredText: string, origin: string): ZoneDiff {
  return diffZones(parseZoneRecords(currentText, origin), parseZoneRecords(desiredText, origin));
}

/**
 * Parses the verbatim zone rows the Sol zone pages serve (the `RecordSetRow` tables
 * of argan.ts) into normalized records — the bridge from the rendered zone table to
 * the diff. Record and directive rows are parsed verbatim; blank rows are dropped.
 *
 * @param rows the record-set rows (record, directive and blank rows mixed).
 * @param origin the zone origin ("example.com.").
 * @returns the normalized records of the rows.
 */
export function recordsFromRows(rows: readonly RecordSetRow[], origin: string): ZoneRecord[] {
  const text = rows
    .filter((row) => row.kind !== "blank")
    .map((row) => row.line)
    .join("\n");
  return parseZoneRecords(text, origin);
}

/**
 * Suggests the zone serial for a publication: an empty diff keeps the serial
 * untouched, any planned change bumps the YYYYMMDDNN revision through
 * argan.nextSerial.
 *
 * @param diff the planned change set.
 * @param serial the serial the zone carries now.
 * @returns the serial to publish.
 */
export function serialForPublication(diff: ZoneDiff, serial: string): string {
  const empty = diff.creates.length === 0 && diff.deletes.length === 0 && diff.updates.length === 0;
  return empty ? serial : nextSerial(serial);
}
