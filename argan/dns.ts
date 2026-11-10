// # dns.ts — the one keyword file of the dns zone domain: the
// consolidation law of the root (one keyword file per domain) merged the
// four wave files of the name resolution lane into this seat — the
// DNSSEC validation math (the former dnssec.ts body below), the planned
// change set engine between two versions of a zone (zonediff.ts), the
// clean URL bar of the SPA (cleanurl.ts) and the gateway protocol mesh
// (protocols.ts) — every export preserved verbatim, zero logic changes,
// the wire surfaces untouched (PROTOCOLS: 231 rows across the fifteen
// family groups, the dns family carrying the argan home transports).
// The consolidation notes: the four sources share no duplicated helpers
// and no same-name declarations — the dedupe ride and the group-suffix
// ride of the law are both empty here — so every section keeps its own
// private helpers verbatim (parseZoneTimestamp / decodeBase64 /
// ownerLabelCount of the dnssec section, NAMEFIELDS / TTLUNITS / parseTtl
// / isTtlToken / absolutize / normalizeData / tokenize / groupRecords /
// targetSet / pickPrimary of the zonediff section, HASH_ROUTE / BASENAME
// / TRACKERS / isTracker of the cleanurl section), and the two argan
// imports the sources carried (nextSerial + RecordSetRow of zonediff,
// BadgeTone of protocols) fold into the single argan.ts import below.

import { type BadgeTone, nextSerial, type RecordSetRow } from "./argan.ts";

/* ════════════════════════════════════════════════════════════════════ */
/* SECTION: dnssec.ts — the DNSSEC validation math (the first seat).    */
/* ════════════════════════════════════════════════════════════════════ */

// # dnssec — the DNSSEC validation math of the family, housed at the argan root.
// Library-grade module shipped inside the published packages (npm, maven with the Spring
// Boot rider): it owns the domain types and pure, generic helpers only — zero consumer
// data. The scope here is the clock and structure half of the validation chain (the
// discipline dnssec-js models with its DatePeriod): RRSIG presentation parsing, the
// RFC 4034 Appendix B key tag, the signature validity window with skew, the RRset/RRSIG
// TTL equality rule and the DS→DNSKEY structural match over the IANA registries. The
// heavyweight half — the cryptographic signature verification itself — belongs to the
// crypto layer and is deliberately out of scope; every verdict here names the exact
// failed check through typed codes, traceable from the resolver answer back to the row.

/** The IANA DNSSEC algorithm numbers the validator answers for (RFC 8624 set). */
export const DNSSECALGORITHMS: ReadonlyMap<number, string> = new Map([
  [5, "RSASHA1"],
  [7, "RSASHA1NSEC3SHA1"],
  [8, "RSASHA256"],
  [10, "RSASHA512"],
  [13, "ECDSAP256SHA256"],
  [14, "ECDSAP384SHA384"],
  [15, "ED25519"],
  [16, "ED448"],
]);

/** The IANA DS digest type numbers the validator answers for. */
export const DNSSECDIGESTTYPES: ReadonlyMap<number, string> = new Map([
  [1, "SHA-1"],
  [2, "SHA-256"],
  [4, "SHA-384"],
]);

/** One parsed RRSIG record (the presentation fields of RFC 4034 §3.1). */
export interface RrSig {
  /** the record type the signature covers, uppercase ("A", "DNSKEY") */
  typeCovered: string;
  algorithm: number;
  /** the label count the signer used (wildcard owner names drop the leftmost `*`) */
  labels: number;
  /** the ttl the signed rrset originally carried */
  originalTtl: number;
  /** signature expiration, epoch ms (inclusive) */
  expiration: number;
  /** signature inception, epoch ms (inclusive) */
  inception: number;
  keyTag: number;
  /** the signer zone name, lowercase, trailing dot kept */
  signerName: string;
  /** the signature itself, presentation base64 (unverified here) */
  signature: string;
}

/** One parsed DNSKEY record (the presentation fields of RFC 4034 §2.1). */
export interface DnsKey {
  flags: number;
  protocol: number;
  algorithm: number;
  /** the public key, presentation base64 */
  publicKey: string;
}

/** One parsed DS record (the presentation fields of RFC 4036 §5.1.4). */
export interface DsRecord {
  keyTag: number;
  algorithm: number;
  digestType: number;
  /** the digest, presentation hex (uncompared here) */
  digest: string;
}

/** One verdict of the structural validators: ok, or the typed code of the failed check. */
export type DnssecVerdict = { ok: true } | { ok: false; code: DnssecFailureCode; detail: string };

/** The typed codes every failed check answers with — traceable from the answer to the row. */
export type DnssecFailureCode =
  | "expired-signature"
  | "not-yet-valid-signature"
  | "ttl-mismatch"
  | "ttl-exceeds-original"
  | "label-count-mismatch"
  | "unknown-algorithm"
  | "unknown-digest-type"
  | "key-tag-mismatch"
  | "algorithm-mismatch"
  | "not-a-zone-key"
  | "protocol-mismatch";

/** Error raised by the presentation parsers for lines they cannot read. */
export class DnssecValidationError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "DnssecValidationError";
  }
}

/** Parses a zone-file UTC timestamp (YYYYMMDDHHmmSS) into epoch ms. */
function parseZoneTimestamp(token: string): number {
  if (!/^\d{14}$/.test(token)) throw new DnssecValidationError(`dnssec: unreadable timestamp "${token}"`);
  const year = Number.parseInt(token.slice(0, 4), 10);
  const month = Number.parseInt(token.slice(4, 6), 10);
  const day = Number.parseInt(token.slice(6, 8), 10);
  const hour = Number.parseInt(token.slice(8, 10), 10);
  const minute = Number.parseInt(token.slice(10, 12), 10);
  const second = Number.parseInt(token.slice(12, 14), 10);
  return Date.UTC(year, month - 1, day, hour, minute, second);
}

/**
 * Parses one RRSIG record from its presentation format:
 * `<typeCovered> <algorithm> <labels> <originalTtl> <expiration> <inception> <keyTag> <signer> <signature>`.
 * Dates are zone-file UTC (YYYYMMDDHHmmSS). Throws `DnssecValidationError` on bad rows.
 *
 * @param line the presentation line (the rdata, with or without the leading "RRSIG").
 * @returns the parsed signature.
 */
export function parseRrSig(line: string): RrSig {
  const fields = line.trim().split(/\s+/);
  if (fields[0]?.toUpperCase() === "RRSIG") fields.shift();
  if (fields.length < 9) throw new DnssecValidationError(`dnssec: RRSIG needs 9 fields, got ${fields.length}`);
  const algorithm = Number.parseInt(fields[1], 10);
  const labels = Number.parseInt(fields[2], 10);
  const originalTtl = Number.parseInt(fields[3], 10);
  const expiration = parseZoneTimestamp(fields[4]);
  const inception = parseZoneTimestamp(fields[5]);
  const keyTag = Number.parseInt(fields[6], 10);
  if (!Number.isFinite(algorithm) || algorithm <= 0)
    throw new DnssecValidationError(`dnssec: bad algorithm "${fields[1]}"`);
  if (!Number.isFinite(labels) || labels < 0) throw new DnssecValidationError(`dnssec: bad label count "${fields[2]}"`);
  if (!Number.isFinite(originalTtl) || originalTtl < 0)
    throw new DnssecValidationError(`dnssec: bad original ttl "${fields[3]}"`);
  if (expiration < inception) throw new DnssecValidationError("dnssec: signature expires before it starts");
  if (!Number.isFinite(keyTag) || keyTag < 0 || keyTag > 65535)
    throw new DnssecValidationError(`dnssec: bad key tag "${fields[6]}"`);
  return {
    typeCovered: fields[0].toUpperCase(),
    algorithm,
    labels,
    originalTtl,
    expiration,
    inception,
    keyTag,
    signerName: `${fields[7].toLowerCase()}${fields[7].endsWith(".") ? "" : "."}`,
    signature: fields[8],
  };
}

/** Decodes presentation base64 into bytes — dependency-free, node and browser. */
function decodeBase64(value: string): Uint8Array {
  const clean = value.replace(/[^A-Za-z0-9+/]/g, "");
  const padded = clean.padEnd(Math.ceil(clean.length / 4) * 4, "=");
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of padded) {
    if (char === "=") break;
    const index = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(char);
    if (index === -1) throw new DnssecValidationError(`dnssec: bad base64 character "${char}"`);
    buffer = (buffer << 6) | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return Uint8Array.from(bytes);
}

/** Builds the DNSKEY rdata wire format (flags, protocol, algorithm, public key). */
export function dnsKeyRdata(key: DnsKey): Uint8Array {
  const publicKey = decodeBase64(key.publicKey);
  const rdata = new Uint8Array(4 + publicKey.length);
  rdata[0] = (key.flags >> 8) & 0xff;
  rdata[1] = key.flags & 0xff;
  rdata[2] = key.protocol;
  rdata[3] = key.algorithm;
  rdata.set(publicKey, 4);
  return rdata;
}

/**
 * Computes the DNSSEC key tag of a DNSKEY record (RFC 4034 Appendix B): a 16-bit
 * ones'-complement checksum over the rdata wire format.
 *
 * @param key the DNSKEY record.
 * @returns the key tag (0-65535).
 */
export function keyTag(key: DnsKey): number {
  const rdata = dnsKeyRdata(key);
  let accumulator = 0;
  for (let index = 0; index < rdata.length; index++) {
    accumulator += index & 1 ? rdata[index] : rdata[index] << 8;
    accumulator += (accumulator >> 16) & 0xffff;
  }
  return accumulator & 0xffff;
}

/**
 * Validates the RRSIG validity window against the reference clock (RFC 4035 §5.3.1):
 * inception ≤ now ≤ expiration, with an explicit skew for resolver clock drift.
 *
 * @param sig the parsed signature.
 * @param now the reference clock in epoch ms (defaults to the real clock).
 * @param skewMs the tolerated clock drift in ms (default 0 — resolvers answer for themselves).
 * @returns the verdict with `expired-signature` or `not-yet-valid-signature` on failure.
 */
export function validateSignatureWindow(sig: RrSig, now: number = Date.now(), skewMs = 0): DnssecVerdict {
  if (now - skewMs > sig.expiration) {
    return { ok: false, code: "expired-signature", detail: `expired at ${new Date(sig.expiration).toISOString()}` };
  }
  if (now + skewMs < sig.inception) {
    return { ok: false, code: "not-yet-valid-signature", detail: `starts at ${new Date(sig.inception).toISOString()}` };
  }
  return { ok: true };
}

/**
 * Validates the RRSIG ttl against the RRset it covers (RFC 4035 §5.3.2): the
 * signature ttl must equal the rrset ttl and never exceed the original ttl the
 * signer recorded.
 *
 * @param sigTtl the ttl the RRSIG record itself carries.
 * @param sig the parsed signature.
 * @param rrsetTtl the ttl of the covered rrset.
 * @returns the verdict with `ttl-mismatch` or `ttl-exceeds-original` on failure.
 */
export function validateSignatureTtl(sig: RrSig, sigTtl: number, rrsetTtl: number): DnssecVerdict {
  if (sigTtl !== rrsetTtl) {
    return { ok: false, code: "ttl-mismatch", detail: `rrsig ttl ${sigTtl} differs from rrset ttl ${rrsetTtl}` };
  }
  if (sigTtl > sig.originalTtl) {
    return { ok: false, code: "ttl-exceeds-original", detail: `ttl ${sigTtl} exceeds the original ${sig.originalTtl}` };
  }
  return { ok: true };
}

/** Counts the labels of an owner name (empty trailing root label excluded). */
function ownerLabelCount(name: string): number {
  const trimmed = name.trim().toLowerCase();
  if (trimmed === "" || trimmed === ".") return 0;
  return trimmed.replace(/\.$/, "").split(".").length;
}

/**
 * Validates the RRSIG label count against the owner name it signs (RFC 4035 §5.3.2):
 * the count must match the owner's labels, with a leading wildcard dropped on both
 * sides (`*.example.com.` signs as `example.com.` = 2 labels).
 *
 * @param sig the parsed signature.
 * @param ownerName the rrset owner name (absolute, trailing dot).
 * @returns the verdict with `label-count-mismatch` on failure.
 */
export function validateSignatureLabels(sig: RrSig, ownerName: string): DnssecVerdict {
  const labels = ownerLabelCount(ownerName);
  const isWildcard = ownerName.trim().toLowerCase().startsWith("*.");
  const signedLabels = isWildcard ? labels - 1 : labels;
  if (sig.labels !== signedLabels) {
    return {
      ok: false,
      code: "label-count-mismatch",
      detail: `rrsig covers ${sig.labels} labels, owner carries ${signedLabels}`,
    };
  }
  return { ok: true };
}

/**
 * Validates the structural match between a DS record and the DNSKEY it refers to
 * (RFC 4035 §5.2): the key tag and the algorithm must agree, the digest type must
 * be one of the IANA registry and the key must be a zone key answering on
 * protocol 3. The digest comparison itself belongs to the crypto layer.
 *
 * @param ds the delegation signer record.
 * @param key the child DNSKEY record.
 * @returns the verdict with the typed code of the failed check.
 */
export function validateDsMatch(ds: DsRecord, key: DnsKey): DnssecVerdict {
  if (!DNSSECALGORITHMS.has(ds.algorithm)) {
    return {
      ok: false,
      code: "unknown-algorithm",
      detail: `algorithm ${ds.algorithm} is not in the RFC 8624 registry`,
    };
  }
  if (!DNSSECDIGESTTYPES.has(ds.digestType)) {
    return {
      ok: false,
      code: "unknown-digest-type",
      detail: `digest type ${ds.digestType} is not in the IANA registry`,
    };
  }
  if (ds.algorithm !== key.algorithm) {
    return {
      ok: false,
      code: "algorithm-mismatch",
      detail: `ds algorithm ${ds.algorithm} differs from dnskey ${key.algorithm}`,
    };
  }
  if (ds.keyTag !== keyTag(key)) {
    return { ok: false, code: "key-tag-mismatch", detail: `ds names tag ${ds.keyTag}, dnskey computes ${keyTag(key)}` };
  }
  const ZONEKEYFLAG = 0x0100;
  if ((key.flags & ZONEKEYFLAG) === 0) {
    return { ok: false, code: "not-a-zone-key", detail: `dnskey flags ${key.flags} miss the zone key bit` };
  }
  if (key.protocol !== 3) {
    return { ok: false, code: "protocol-mismatch", detail: `dnskey protocol ${key.protocol} is not 3` };
  }
  return { ok: true };
}

/**
 * Validates one structural link of the chain of trust: the DS of the parent zone
 * against a DNSKEY of the child, and (when the child key is the secure entry
 * point, flags 257) the key tag the chain walks through. The signature math is
 * out of scope by design; this answers "does the chain structurally hold".
 *
 * @param ds the parent's DS record for the child zone.
 * @param key the child DNSKEY candidate.
 * @returns the verdict over the whole structural link.
 */
export function validateChainLink(ds: DsRecord, key: DnsKey): DnssecVerdict {
  const dsVerdict = validateDsMatch(ds, key);
  if (!dsVerdict.ok) return dsVerdict;
  return { ok: true };
}

/* ════════════════════════════════════════════════════════════════════ */
/* SECTION: zonediff.ts — the planned change set (the second seat).     */
/* ════════════════════════════════════════════════════════════════════ */

// # zonediff — the planned change set between two versions of a zone, housed at the argan root.
// Library-grade module shipped inside the published packages (npm, maven with the Spring
// Boot rider): it owns the domain types and pure, generic helpers only — zero consumer
// data. The shape follows the plan discipline of external-dns (the kubernetes-sigs
// planner): records group by owner name and type, the targets compare as a set (round
// robin order never produces a change) and an unconfigured TTL never triggers an update.
// Wire: the Sol zone pages serve the verbatim RecordSetRow tables of argan.ts; this
// module parses those same lines into normalized records, diffs them and suggests the
// next YYYYMMDDNN serial through argan.nextSerial — a publication never hardcodes a row.

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

/** The bounded seat of the ttl grammar: the longest ttl spelling any zone file and any registrar answer carries sits far below this ceiling, so a hostile unbounded digit run (the polynomial-redos wall the code scanning gate flagged — the match over `\d+[smhdw]` walked cubic backtracking on a run of zeros the unit never ends) never reaches the engine. */
const TTLTOKENLIMIT = 32;

/** Parses a TTL token: plain seconds ("300") or unit spellings ("1h30m"). */
function parseTtl(token: string): number {
  /* the bounded seat guards both regex paths at once — the plain-seconds
   * test and the unit scan — before any pattern touches the input. */
  if (token.length > TTLTOKENLIMIT) return Number.NaN;
  if (/^\d+$/.test(token)) return Number.parseInt(token, 10);
  const lower = token.toLowerCase();
  // the linear unit scan (the redos heal): the old global regex walked
  // back over every digit of a unit-less token before advancing, a
  // polynomial cost on crafted inputs - the manual walk visits each
  // character exactly once and answers the same units list.
  const units: string[] = [];
  let index = 0;
  while (index < lower.length) {
    const start = index;
    while (index < lower.length && lower.charCodeAt(index) >= 48 && lower.charCodeAt(index) <= 57) index += 1;
    if (index === start) {
      index += 1;
      continue;
    }
    if (index < lower.length && TTLUNITS[lower[index]] !== undefined) {
      units.push(lower.slice(start, index + 1));
    }
    index += 1;
  }
  if (units.length === 0 || units.join("") !== lower) return Number.NaN;
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
      if (!tokens[1]) throw new ZoneDiffError("zonediff: $ORIGIN needs a name", number);
      const declared = tokens[1].toLowerCase();
      originNow = declared.endsWith(".") ? declared : `${declared}.`;
      continue;
    }
    if (directive === "$TTL") {
      zoneTtl = parseTtl(tokens[1] ?? "");
      if (Number.isNaN(zoneTtl)) throw new ZoneDiffError(`zonediff: unreadable $TTL "${tokens[1]}"`, number);
      continue;
    }
    if (directive === "$INCLUDE" || directive === "$GENERATE") {
      throw new ZoneDiffError(`zonediff: ${directive} directives are not supported`, number);
    }
    const opening = tokens.indexOf("(");
    if (opening !== -1) {
      pending = { tokens: tokens.slice(0, opening), line: number, inheritsOwner: /^[ \t]/.test(raw) };
      continue;
    }
    emitRecord(tokens, number, /^[ \t]/.test(raw));
  }
  if (pending) throw new ZoneDiffError("zonediff: unclosed parenthesis at end of file", pending.line);

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
    if (!/^[A-Z]{1,10}$/.test(type))
      throw new ZoneDiffError(`zonediff: unreadable record type "${tokens[cursor]}"`, number);
    cursor += 1;
    const data = normalizeData(type, tokens.slice(cursor).join(" "), originNow);
    if (!data) throw new ZoneDiffError(`zonediff: ${type} record without rdata`, number);
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
      for (const after of nextGroup)
        diff.creates.push({ action: "create", name: after.name, type: after.type, after, reason: "targets" });
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
    for (const before of nowGroup)
      diff.deletes.push({ action: "delete", name: before.name, type: before.type, before, reason: "targets" });
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

/* ════════════════════════════════════════════════════════════════════ */
/* SECTION: cleanurl.ts — the clean URL bar (the third seat).           */
/* ════════════════════════════════════════════════════════════════════ */

// the argan unit of the family.
// # cleanurl — the clean URL bar of the family, typed for the SPA
// Hash routes become paths, index.html and duplicate slashes disappear, campaign
// trackers are stripped with replaceState (no reload, no history pollution) and the
// canonical link stays in sync. Navigation itself is handled by wouter Link, so no
// click interception and no reload binding live here.

const HASH_ROUTE = /^#\/?/;
const BASENAME = /(^|\/)index\.html?$/;
const TRACKERS: readonly RegExp[] = [
  /^(utm_|gclid|fbclid|msclkid|dclid|mc_|ref_?src$)/i,
  /^igshid$/i,
  /^yclid$/i,
  /^twclid$/i,
  /^_tt/i,
  /^srsltid$/i,
];

function isTracker(key: string): boolean {
  return TRACKERS.some((pattern) => pattern.test(key));
}

/** Builds the clean form of a url of this site; foreign origins come back untouched. */
export function cleanUrl(input: string, origin: string = window.location.origin): string {
  let url: URL;
  try {
    url = new URL(input, origin);
  } catch {
    return input;
  }
  if (url.origin !== origin) return input;

  let out = url;

  // 1) a route in the hash becomes a real path: /#/settings -> /settings
  if (HASH_ROUTE.test(out.hash)) {
    const path = out.hash.replace(HASH_ROUTE, "/");
    out = new URL(path + out.search, origin);
  } else if (out.hash) {
    out = new URL(out.pathname + out.search, origin);
  }

  // 2) index.html and duplicated slashes disappear
  out.pathname = out.pathname.replace(BASENAME, "/").replace(/\/{2,}/g, "/");

  // 3) campaign trackers leave the url
  let hadTrackers = false;
  Array.from(out.searchParams.keys()).forEach((key) => {
    if (isTracker(key)) {
      out.searchParams.delete(key);
      hadTrackers = true;
    }
  });
  if (hadTrackers) out.search = out.searchParams.toString();

  return out.toString();
}

/** Normalizes the current address without reloading or polluting the history. */
export function applyNow(): boolean {
  const cleaned = cleanUrl(window.location.href);
  if (cleaned === window.location.href) return false;
  window.history.replaceState(window.history.state, "", cleaned);
  return true;
}

/** Keeps <link rel=canonical> and og:url in sync with the clean url (SEO, sharing). */
export function syncCanonical(): void {
  const canonical = document.querySelector('link[rel="canonical"]');
  canonical?.setAttribute("href", window.location.origin + window.location.pathname);
  const og = document.querySelector('meta[property="og:url"]');
  og?.setAttribute("content", window.location.origin + window.location.pathname);
}

/* ════════════════════════════════════════════════════════════════════ */
/* SECTION: protocols.ts — the protocol mesh (the fourth seat).         */
/* ════════════════════════════════════════════════════════════════════ */

// # protocols — the protocol mesh of the family gateway, housed at the argan root.
// Library-grade module shipped inside the published packages (npm, maven with the Spring
// Boot rider): it owns the registry rows and pure, generic helpers only — zero consumer
// data. The mesh lists every wire the gateway speaks, grouped by family keyword: the web
// edge (http versions, websockets, webtransport), the api dialects that ride it, the mail,
// dns, file, remote, messaging, stream, tunnel, overlay, data, ops, directory and legacy
// families. Every row names its governing spec and its security posture — encrypted
// (protocol-native or TLS cryptography), opportunistic (STARTTLS or TLS-on-demand) or
// cleartext — and the helper layer answers lookups, group filters and the tls-capable
// count the owner law pins above one hundred.

/** The hierarchical family keyword every protocol row carries (the pane groups). */
export type ProtocolGroup =
  | "web"
  | "api"
  | "collab"
  | "mail"
  | "dns"
  | "file"
  | "remote"
  | "messaging"
  | "stream"
  | "tunnel"
  | "overlay"
  | "data"
  | "ops"
  | "directory"
  | "legacy";

/** The security posture of the wire (encrypted covers TLS and protocol-native crypto). */
export type ProtocolSecurity = "encrypted" | "opportunistic" | "cleartext";

/** One row of the gateway protocol mesh: the scheme, its port, spec, family and state. */
export interface ProtocolSpec {
  /** the scheme the gateway registers, lowercase ("https", "wss", "webtransport") */
  scheme: string;
  /** the display name of the protocol */
  name: string;
  /** the default port of the wire ("—" when the protocol negotiates its own) */
  port: string;
  /** the governing spec or reference of the protocol */
  spec: string;
  /** the hierarchical family the protocol belongs to */
  group: ProtocolGroup;
  /** the security posture of the wire */
  security: ProtocolSecurity;
  /** the state of the listener on the gateway ("live", "preferred", "planned", "opt-in", "legacy") */
  state: string;
}

/**
 * The mesh itself: 231 rows grouped by family keyword, alphabetical inside every group.
 * The web family leads — it is the https edge the whole api surface rides — and the dns
 * family carries the argan home transports the gateway already answers today.
 */
export const PROTOCOLS: readonly ProtocolSpec[] = [
  /** ## web — the https edge: document and transport protocols of the gateway. */
  { scheme: "coap", name: "CoAP", port: "5683/UDP", spec: "RFC 7252", group: "web", security: "cleartext", state: "opt-in" },
  { scheme: "coaps", name: "CoAP over DTLS", port: "5684/UDP", spec: "RFC 7252 · 6347", group: "web", security: "encrypted", state: "opt-in" },
  { scheme: "gemini", name: "Gemini", port: "1965", spec: "the gemini spec", group: "web", security: "encrypted", state: "opt-in" },
  { scheme: "graphql-ws", name: "GraphQL subscriptions over wss", port: "443", spec: "the graphql-transport-ws spec", group: "web", security: "encrypted", state: "live" },
  { scheme: "h2", name: "HTTP/2 over TLS", port: "443", spec: "RFC 9113", group: "web", security: "encrypted", state: "live" },
  { scheme: "h2c", name: "HTTP/2 cleartext upgrade", port: "80", spec: "RFC 9113", group: "web", security: "cleartext", state: "opt-in" },
  { scheme: "h3", name: "HTTP/3 over QUIC", port: "443/UDP", spec: "RFC 9114", group: "web", security: "encrypted", state: "live" },
  { scheme: "http", name: "HTTP/1.1", port: "80", spec: "RFC 9110 · 9112", group: "web", security: "cleartext", state: "live" },
  { scheme: "https", name: "HTTP/1.1 over TLS", port: "443", spec: "RFC 9110 · 8446", group: "web", security: "encrypted", state: "live" },
  { scheme: "longpoll", name: "HTTP long polling", port: "80/443", spec: "the keep-alive pattern", group: "web", security: "opportunistic", state: "live" },
  { scheme: "spdy", name: "SPDY/3.1", port: "443", spec: "the spdy draft", group: "web", security: "encrypted", state: "legacy" },
  { scheme: "sse", name: "Server-Sent Events", port: "443", spec: "text/event-stream · WHATWG", group: "web", security: "encrypted", state: "live" },
  { scheme: "webcodecs", name: "WebCodecs", port: "—", spec: "W3C WebCodecs", group: "web", security: "encrypted", state: "live" },
  { scheme: "webtransport", name: "WebTransport", port: "443/UDP", spec: "W3C WebTransport · RFC 9114", group: "web", security: "encrypted", state: "live" },
  { scheme: "webrtc", name: "WebRTC (DTLS-SRTP)", port: "ephemeral/UDP", spec: "W3C WebRTC 1.0 · RFC 8825", group: "web", security: "encrypted", state: "live" },
  { scheme: "ws", name: "WebSocket", port: "80", spec: "RFC 6455", group: "web", security: "cleartext", state: "live" },
  { scheme: "wss", name: "WebSocket Secure", port: "443", spec: "RFC 6455", group: "web", security: "encrypted", state: "live" },

  /** ## api — the rpc and api dialects riding the https edge. */
  { scheme: "acme", name: "ACME certificate orders", port: "443", spec: "RFC 8555", group: "api", security: "encrypted", state: "live" },
  { scheme: "activitypub", name: "ActivityPub", port: "443", spec: "W3C ActivityPub", group: "api", security: "encrypted", state: "live" },
  { scheme: "atproto", name: "AT Protocol", port: "443", spec: "the atproto spec", group: "api", security: "encrypted", state: "opt-in" },
  { scheme: "capnproto", name: "Cap'n Proto RPC", port: "—", spec: "the cap'n proto rpc spec", group: "api", security: "opportunistic", state: "opt-in" },
  { scheme: "certificate-transparency", name: "Certificate Transparency", port: "443", spec: "RFC 6962", group: "api", security: "opportunistic", state: "live" },
  { scheme: "grpc", name: "gRPC over HTTP/2", port: "50051", spec: "the grpc spec", group: "api", security: "opportunistic", state: "live" },
  { scheme: "grpcs", name: "gRPC over TLS", port: "443", spec: "the grpc spec · RFC 8446", group: "api", security: "encrypted", state: "live" },
  { scheme: "grpc-web", name: "gRPC-Web", port: "443", spec: "the grpc-web spec", group: "api", security: "encrypted", state: "live" },
  { scheme: "jsonrpc", name: "JSON-RPC 2.0", port: "80/443", spec: "the json-rpc 2.0 spec", group: "api", security: "opportunistic", state: "live" },
  { scheme: "matrix", name: "Matrix federation", port: "8448", spec: "the matrix spec", group: "api", security: "encrypted", state: "live" },
  { scheme: "micropub", name: "Micropub", port: "443", spec: "W3C Micropub", group: "api", security: "encrypted", state: "opt-in" },
  { scheme: "msgpack-rpc", name: "MessagePack-RPC", port: "—", spec: "the msgpack-rpc spec", group: "api", security: "opportunistic", state: "opt-in" },
  { scheme: "oembed", name: "oEmbed", port: "443", spec: "the oembed 1.0 spec", group: "api", security: "encrypted", state: "live" },
  { scheme: "ohttp", name: "Oblivious HTTP", port: "443", spec: "RFC 9458", group: "api", security: "encrypted", state: "opt-in" },
  { scheme: "ocsp", name: "OCSP", port: "80/443", spec: "RFC 6960", group: "api", security: "opportunistic", state: "live" },
  { scheme: "openid-connect", name: "OpenID Connect", port: "443", spec: "the oidc core 1.0", group: "api", security: "encrypted", state: "live" },
  { scheme: "pingback", name: "Pingback", port: "80/443", spec: "the pingback 1.0 spec", group: "api", security: "opportunistic", state: "legacy" },
  { scheme: "soap", name: "SOAP 1.2", port: "443", spec: "W3C SOAP 1.2", group: "api", security: "opportunistic", state: "live" },
  { scheme: "thrift", name: "Apache Thrift RPC", port: "9090", spec: "the thrift protocol", group: "api", security: "opportunistic", state: "live" },
  { scheme: "webfinger", name: "WebFinger", port: "443", spec: "RFC 7033", group: "api", security: "encrypted", state: "live" },
  { scheme: "webmention", name: "Webmention", port: "443", spec: "W3C Webmention", group: "api", security: "encrypted", state: "opt-in" },
  { scheme: "webpush", name: "Web Push", port: "443", spec: "RFC 8030 · 8291", group: "api", security: "encrypted", state: "live" },
  { scheme: "xmlrpc", name: "XML-RPC", port: "80/443", spec: "the xml-rpc spec", group: "api", security: "opportunistic", state: "live" },

  /** ## collab — the calendaring and pim dialects over http. */
  { scheme: "caldav", name: "CalDAV", port: "80/443", spec: "RFC 4791", group: "collab", security: "opportunistic", state: "live" },
  { scheme: "carddav", name: "CardDAV", port: "80/443", spec: "RFC 6352", group: "collab", security: "opportunistic", state: "live" },
  { scheme: "webdav", name: "WebDAV", port: "80/443", spec: "RFC 4918", group: "collab", security: "opportunistic", state: "live" },
  { scheme: "webdavs", name: "WebDAV over TLS", port: "443", spec: "RFC 4918 · 8446", group: "collab", security: "encrypted", state: "live" },

  /** ## mail — the store-and-forward family. */
  { scheme: "imap", name: "IMAP4rev2", port: "143", spec: "RFC 9051", group: "mail", security: "opportunistic", state: "live" },
  { scheme: "imaps", name: "IMAP over TLS", port: "993", spec: "RFC 8314", group: "mail", security: "encrypted", state: "live" },
  { scheme: "jmap", name: "JMAP", port: "443", spec: "RFC 8620 · 8621", group: "mail", security: "encrypted", state: "live" },
  { scheme: "lmtp", name: "LMTP", port: "—", spec: "RFC 2033", group: "mail", security: "opportunistic", state: "live" },
  { scheme: "pop3", name: "POP3", port: "110", spec: "RFC 1939", group: "mail", security: "opportunistic", state: "live" },
  { scheme: "pop3s", name: "POP3 over TLS", port: "995", spec: "RFC 8314", group: "mail", security: "encrypted", state: "live" },
  { scheme: "sieve", name: "ManageSieve", port: "4190", spec: "RFC 5804", group: "mail", security: "opportunistic", state: "opt-in" },
  { scheme: "smtp", name: "SMTP relay", port: "25", spec: "RFC 5321", group: "mail", security: "cleartext", state: "live" },
  { scheme: "smtps", name: "SMTP over implicit TLS", port: "465", spec: "RFC 8314", group: "mail", security: "encrypted", state: "live" },
  { scheme: "submission", name: "Mail submission (STARTTLS)", port: "587", spec: "RFC 6409", group: "mail", security: "opportunistic", state: "live" },

  /** ## dns — the name resolution family (the argan home). */
  { scheme: "axfr", name: "AXFR full zone transfer", port: "53", spec: "RFC 5936", group: "dns", security: "cleartext", state: "live" },
  { scheme: "dns", name: "Classic DNS (UDP + TCP)", port: "53", spec: "RFC 1035 · 7766", group: "dns", security: "cleartext", state: "live" },
  { scheme: "dnscrypt", name: "DNSCrypt v2", port: "443", spec: "the dnscrypt v2 spec", group: "dns", security: "encrypted", state: "opt-in" },
  { scheme: "dns-sd", name: "DNS-SD", port: "5353/UDP", spec: "RFC 6763", group: "dns", security: "cleartext", state: "live" },
  { scheme: "doh", name: "DNS over HTTPS", port: "443", spec: "RFC 8484", group: "dns", security: "encrypted", state: "preferred" },
  { scheme: "doh-json", name: "DoH JSON (/resolve)", port: "443", spec: "the json resolver draft", group: "dns", security: "encrypted", state: "panel · debug" },
  { scheme: "doq", name: "DNS over QUIC", port: "853/UDP", spec: "RFC 9250", group: "dns", security: "encrypted", state: "planned" },
  { scheme: "dot", name: "DNS over TLS", port: "853", spec: "RFC 7858 · 8310", group: "dns", security: "encrypted", state: "live" },
  { scheme: "ixfr", name: "IXFR incremental transfer", port: "53", spec: "RFC 1995", group: "dns", security: "cleartext", state: "live" },
  { scheme: "llmnr", name: "LLMNR", port: "5355/UDP", spec: "RFC 4795", group: "dns", security: "cleartext", state: "legacy" },
  { scheme: "mdns", name: "Multicast DNS", port: "5353/UDP", spec: "RFC 6762", group: "dns", security: "cleartext", state: "live" },
  { scheme: "odoh", name: "Oblivious DoH", port: "443", spec: "RFC 9230", group: "dns", security: "encrypted", state: "planned" },

  /** ## file — the transfer and filesystem family. */
  { scheme: "9p", name: "Plan 9 filesystem", port: "564", spec: "9P2000", group: "file", security: "cleartext", state: "opt-in" },
  { scheme: "afs", name: "AFS", port: "7000", spec: "the rx protocol", group: "file", security: "cleartext", state: "legacy" },
  { scheme: "cifs", name: "CIFS", port: "445", spec: "MS-CIFS", group: "file", security: "opportunistic", state: "legacy" },
  { scheme: "ftp", name: "FTP", port: "21", spec: "RFC 959", group: "file", security: "cleartext", state: "legacy" },
  { scheme: "ftp-data", name: "FTP data channel", port: "20", spec: "RFC 959", group: "file", security: "cleartext", state: "legacy" },
  { scheme: "ftps", name: "FTP over TLS", port: "990", spec: "RFC 4217", group: "file", security: "encrypted", state: "opt-in" },
  { scheme: "git", name: "Git native protocol", port: "9418", spec: "the git protocol v2", group: "file", security: "cleartext", state: "live" },
  { scheme: "git-http", name: "Git smart HTTP", port: "80/443", spec: "the git http-protocol", group: "file", security: "opportunistic", state: "live" },
  { scheme: "hg", name: "Mercurial wire", port: "8000", spec: "the mercurial wire protocol", group: "file", security: "cleartext", state: "legacy" },
  { scheme: "nfs", name: "NFSv4.2", port: "2049", spec: "RFC 7862", group: "file", security: "cleartext", state: "live" },
  { scheme: "rsync", name: "rsync delta transfer", port: "873", spec: "the rsync protocol", group: "file", security: "cleartext", state: "live" },
  { scheme: "scp", name: "SCP", port: "22", spec: "the scp dialect", group: "file", security: "encrypted", state: "legacy" },
  { scheme: "sftp", name: "SFTP", port: "22", spec: "the sftp v3 dialect", group: "file", security: "encrypted", state: "live" },
  { scheme: "smb", name: "SMB", port: "445", spec: "MS-SMB2", group: "file", security: "opportunistic", state: "live" },
  { scheme: "svn", name: "Subversion svn://", port: "3690", spec: "the ra_svn protocol", group: "file", security: "opportunistic", state: "legacy" },
  { scheme: "tftp", name: "TFTP", port: "69/UDP", spec: "RFC 1350", group: "file", security: "cleartext", state: "opt-in" },

  /** ## remote — the remote seat family. */
  { scheme: "mosh", name: "Mosh roaming shell", port: "60000/UDP", spec: "the mosh protocol", group: "remote", security: "encrypted", state: "live" },
  { scheme: "rdp", name: "RDP", port: "3389", spec: "MS-RDPBCGR", group: "remote", security: "encrypted", state: "live" },
  { scheme: "rlogin", name: "rlogin", port: "513", spec: "RFC 1282", group: "remote", security: "cleartext", state: "legacy" },
  { scheme: "rsh", name: "rsh", port: "514", spec: "the berkeley rsh", group: "remote", security: "cleartext", state: "legacy" },
  { scheme: "spice", name: "SPICE", port: "5900+", spec: "the spice protocol", group: "remote", security: "opportunistic", state: "opt-in" },
  { scheme: "ssh", name: "SSH", port: "22", spec: "RFC 4253", group: "remote", security: "encrypted", state: "live" },
  { scheme: "telnet", name: "Telnet", port: "23", spec: "RFC 854", group: "remote", security: "cleartext", state: "legacy" },
  { scheme: "vnc", name: "VNC (RFB)", port: "5900", spec: "the rfb protocol", group: "remote", security: "opportunistic", state: "live" },
  { scheme: "x11", name: "X11", port: "6000", spec: "the x11 protocol", group: "remote", security: "cleartext", state: "legacy" },

  /** ## messaging — the pubsub, im and signaling family. */
  { scheme: "amqp", name: "AMQP 1.0", port: "5672", spec: "OASIS AMQP 1.0", group: "messaging", security: "cleartext", state: "live" },
  { scheme: "amqps", name: "AMQP over TLS", port: "5671", spec: "OASIS AMQP 1.0", group: "messaging", security: "encrypted", state: "live" },
  { scheme: "h323", name: "H.323", port: "1720", spec: "ITU-T H.323", group: "messaging", security: "opportunistic", state: "legacy" },
  { scheme: "iax", name: "IAX2", port: "4569/UDP", spec: "the iax2 protocol", group: "messaging", security: "cleartext", state: "opt-in" },
  { scheme: "irc", name: "IRC", port: "6667", spec: "RFC 1459 · 2812", group: "messaging", security: "cleartext", state: "live" },
  { scheme: "ircs", name: "IRC over TLS", port: "6697", spec: "RFC 7194", group: "messaging", security: "encrypted", state: "live" },
  { scheme: "kafka", name: "Kafka log protocol", port: "9092", spec: "the kafka protocol", group: "messaging", security: "opportunistic", state: "live" },
  { scheme: "mgcp", name: "MGCP", port: "2427/UDP", spec: "RFC 3435", group: "messaging", security: "cleartext", state: "legacy" },
  { scheme: "mqtt", name: "MQTT 5", port: "1883", spec: "the mqtt 5.0 spec", group: "messaging", security: "cleartext", state: "live" },
  { scheme: "mqtt-sn", name: "MQTT-SN", port: "1884/UDP", spec: "the mqtt-sn 1.2 spec", group: "messaging", security: "cleartext", state: "opt-in" },
  { scheme: "mqtts", name: "MQTT over TLS", port: "8883", spec: "the mqtt 5.0 spec", group: "messaging", security: "encrypted", state: "live" },
  { scheme: "msrp", name: "MSRP", port: "—", spec: "RFC 4975", group: "messaging", security: "opportunistic", state: "opt-in" },
  { scheme: "msrps", name: "MSRP over TLS", port: "—", spec: "RFC 4975", group: "messaging", security: "encrypted", state: "opt-in" },
  { scheme: "nats", name: "NATS", port: "4222", spec: "the nats protocol", group: "messaging", security: "opportunistic", state: "live" },
  { scheme: "nanomsg", name: "nanomsg SP", port: "—", spec: "the nanomsg sp spec", group: "messaging", security: "opportunistic", state: "opt-in" },
  { scheme: "nostr", name: "Nostr relays", port: "443", spec: "NIP-01", group: "messaging", security: "encrypted", state: "opt-in" },
  { scheme: "openwire", name: "OpenWire", port: "61616", spec: "the openwire spec", group: "messaging", security: "opportunistic", state: "opt-in" },
  { scheme: "sccp", name: "SCCP (Skinny)", port: "2000", spec: "the sccp protocol", group: "messaging", security: "cleartext", state: "legacy" },
  { scheme: "sip", name: "SIP", port: "5060", spec: "RFC 3261", group: "messaging", security: "opportunistic", state: "live" },
  { scheme: "sips", name: "SIPS", port: "5061", spec: "RFC 3261", group: "messaging", security: "encrypted", state: "live" },
  { scheme: "smpp", name: "SMPP", port: "2775", spec: "the smpp 5.0 spec", group: "messaging", security: "cleartext", state: "live" },
  { scheme: "stomp", name: "STOMP 1.2", port: "61613", spec: "the stomp 1.2 spec", group: "messaging", security: "opportunistic", state: "opt-in" },
  { scheme: "xmpp", name: "XMPP", port: "5222", spec: "RFC 6120 · 6121", group: "messaging", security: "opportunistic", state: "live" },
  { scheme: "xmpps", name: "XMPP over TLS", port: "5223", spec: "RFC 6120", group: "messaging", security: "encrypted", state: "legacy" },
  { scheme: "zeromq", name: "ZeroMQ (ZMTP 3.0)", port: "—", spec: "the zmtp 3.0 spec", group: "messaging", security: "opportunistic", state: "live" },

  /** ## stream — the media delivery family. */
  { scheme: "dash", name: "MPEG-DASH segments", port: "80/443", spec: "the mpeg-dash spec", group: "stream", security: "opportunistic", state: "live" },
  { scheme: "hls", name: "HTTP Live Streaming", port: "80/443", spec: "RFC 8216", group: "stream", security: "opportunistic", state: "live" },
  { scheme: "mss", name: "Smooth Streaming", port: "80/443", spec: "MS-SSTR", group: "stream", security: "opportunistic", state: "legacy" },
  { scheme: "osc", name: "Open Sound Control", port: "—", spec: "the osc 1.0 spec", group: "stream", security: "cleartext", state: "opt-in" },
  { scheme: "rist", name: "RIST", port: "—", spec: "the rist profile", group: "stream", security: "opportunistic", state: "opt-in" },
  { scheme: "rtcp", name: "RTCP", port: "—", spec: "RFC 3550", group: "stream", security: "cleartext", state: "live" },
  { scheme: "rtmp", name: "RTMP", port: "1935", spec: "the rtmp spec", group: "stream", security: "cleartext", state: "live" },
  { scheme: "rtmpe", name: "RTMPE", port: "1935", spec: "the rtmpe variant", group: "stream", security: "encrypted", state: "legacy" },
  { scheme: "rtmfp", name: "RTMFP", port: "1935/UDP", spec: "the rtmfp spec", group: "stream", security: "encrypted", state: "legacy" },
  { scheme: "rtmps", name: "RTMPS", port: "443", spec: "the rtmps variant", group: "stream", security: "encrypted", state: "live" },
  { scheme: "rtp", name: "RTP (AVP profile)", port: "—", spec: "RFC 3550", group: "stream", security: "cleartext", state: "live" },
  { scheme: "rtsp", name: "RTSP 2.0", port: "554", spec: "RFC 7826", group: "stream", security: "opportunistic", state: "live" },
  { scheme: "rtsps", name: "RTSP over TLS", port: "322", spec: "RFC 8341", group: "stream", security: "encrypted", state: "live" },
  { scheme: "srt", name: "SRT", port: "—", spec: "the srt protocol", group: "stream", security: "encrypted", state: "live" },
  { scheme: "srtp", name: "SRTP", port: "—", spec: "RFC 3711", group: "stream", security: "encrypted", state: "live" },

  /** ## tunnel — the vpn and encapsulation family. */
  { scheme: "dccp", name: "DCCP", port: "—", spec: "RFC 4340", group: "tunnel", security: "cleartext", state: "legacy" },
  { scheme: "dtls", name: "DTLS 1.3", port: "—", spec: "RFC 9147", group: "tunnel", security: "encrypted", state: "live" },
  { scheme: "enet", name: "ENet", port: "—", spec: "the enet protocol", group: "tunnel", security: "cleartext", state: "opt-in" },
  { scheme: "esp", name: "IPsec ESP", port: "50", spec: "RFC 4303", group: "tunnel", security: "encrypted", state: "live" },
  { scheme: "geneve", name: "GENEVE", port: "6081/UDP", spec: "RFC 8926", group: "tunnel", security: "cleartext", state: "opt-in" },
  { scheme: "gre", name: "GRE", port: "47", spec: "RFC 2784", group: "tunnel", security: "cleartext", state: "legacy" },
  { scheme: "ike", name: "IKEv2", port: "500/4500", spec: "RFC 7296", group: "tunnel", security: "encrypted", state: "live" },
  { scheme: "ipsec", name: "IPsec tunnel", port: "50/4500", spec: "RFC 4301", group: "tunnel", security: "encrypted", state: "live" },
  { scheme: "kcp", name: "KCP", port: "—", spec: "the kcp protocol", group: "tunnel", security: "opportunistic", state: "opt-in" },
  { scheme: "l2tp", name: "L2TP", port: "1701/UDP", spec: "RFC 3931", group: "tunnel", security: "cleartext", state: "legacy" },
  { scheme: "masque", name: "MASQUE (CONNECT-UDP)", port: "443/UDP", spec: "RFC 9484", group: "tunnel", security: "encrypted", state: "planned" },
  { scheme: "mptcp", name: "Multipath TCP", port: "—", spec: "RFC 8684", group: "tunnel", security: "cleartext", state: "opt-in" },
  { scheme: "openvpn", name: "OpenVPN", port: "1194/UDP", spec: "the openvpn protocol", group: "tunnel", security: "encrypted", state: "live" },
  { scheme: "pptp", name: "PPTP", port: "1723", spec: "RFC 2637", group: "tunnel", security: "opportunistic", state: "legacy" },
  { scheme: "quic", name: "QUIC", port: "443/UDP", spec: "RFC 9000", group: "tunnel", security: "encrypted", state: "live" },
  { scheme: "raknet", name: "RakNet", port: "—", spec: "the raknet protocol", group: "tunnel", security: "cleartext", state: "opt-in" },
  { scheme: "sctp", name: "SCTP", port: "132", spec: "RFC 4960", group: "tunnel", security: "cleartext", state: "opt-in" },
  { scheme: "socks4", name: "SOCKS4", port: "1080", spec: "the socks4 protocol", group: "tunnel", security: "cleartext", state: "legacy" },
  { scheme: "socks5", name: "SOCKS5", port: "1080", spec: "RFC 1928", group: "tunnel", security: "opportunistic", state: "live" },
  { scheme: "socks5h", name: "SOCKS5 with remote DNS", port: "1080", spec: "RFC 1928", group: "tunnel", security: "opportunistic", state: "live" },
  { scheme: "tinc", name: "tinc mesh vpn", port: "655", spec: "the tinc protocol", group: "tunnel", security: "encrypted", state: "opt-in" },
  { scheme: "tls", name: "TLS 1.3 record layer", port: "—", spec: "RFC 8446", group: "tunnel", security: "encrypted", state: "live" },
  { scheme: "vxlan", name: "VXLAN", port: "4789/UDP", spec: "RFC 7348", group: "tunnel", security: "cleartext", state: "live" },
  { scheme: "wireguard", name: "WireGuard", port: "51820/UDP", spec: "the wireguard protocol", group: "tunnel", security: "encrypted", state: "live" },
  { scheme: "zerotier", name: "ZeroTier", port: "9993/UDP", spec: "the zerotier protocol", group: "tunnel", security: "encrypted", state: "opt-in" },

  /** ## overlay — the decentralized naming, storage and privacy family. */
  { scheme: "bittorrent", name: "BitTorrent", port: "6881", spec: "BEP 3 · BEP 10", group: "overlay", security: "opportunistic", state: "live" },
  { scheme: "cjdns", name: "Cjdns", port: "—", spec: "the cjdns protocol", group: "overlay", security: "encrypted", state: "opt-in" },
  { scheme: "dat", name: "Dat", port: "—", spec: "the dat protocol", group: "overlay", security: "encrypted", state: "legacy" },
  { scheme: "devp2p", name: "devp2p", port: "30303/UDP", spec: "the devp2p spec", group: "overlay", security: "encrypted", state: "opt-in" },
  { scheme: "dht", name: "Mainline DHT (KRPC)", port: "6881/UDP", spec: "BEP 5", group: "overlay", security: "cleartext", state: "live" },
  { scheme: "filecoin", name: "Filecoin", port: "—", spec: "the filecoin spec", group: "overlay", security: "encrypted", state: "opt-in" },
  { scheme: "hypercore", name: "Hypercore", port: "—", spec: "the hypercore protocol", group: "overlay", security: "encrypted", state: "opt-in" },
  { scheme: "i2p", name: "I2P", port: "—", spec: "the i2p protocol", group: "overlay", security: "encrypted", state: "opt-in" },
  { scheme: "ipfs", name: "IPFS", port: "4001", spec: "the ipfs spec", group: "overlay", security: "opportunistic", state: "opt-in" },
  { scheme: "ipns", name: "IPNS", port: "4001", spec: "the ipns spec", group: "overlay", security: "opportunistic", state: "opt-in" },
  { scheme: "libp2p", name: "libp2p", port: "4001", spec: "the libp2p spec", group: "overlay", security: "encrypted", state: "opt-in" },
  { scheme: "ssb", name: "Secure Scuttlebutt", port: "8008", spec: "the ssb protocol", group: "overlay", security: "encrypted", state: "opt-in" },
  { scheme: "tor", name: "Tor onion services v3", port: "—", spec: "the tor dirspec", group: "overlay", security: "encrypted", state: "opt-in" },
  { scheme: "yggdrasil", name: "Yggdrasil", port: "—", spec: "the yggdrasil protocol", group: "overlay", security: "encrypted", state: "opt-in" },

  /** ## data — the database wire family. */
  { scheme: "cassandra", name: "Cassandra native transport", port: "9042", spec: "the cql binary protocol", group: "data", security: "opportunistic", state: "live" },
  { scheme: "clickhouse", name: "ClickHouse native", port: "9000", spec: "the clickhouse wire", group: "data", security: "opportunistic", state: "opt-in" },
  { scheme: "memcached", name: "Memcached", port: "11211", spec: "the memcached protocol", group: "data", security: "cleartext", state: "live" },
  { scheme: "mongodb", name: "MongoDB (OP_MSG)", port: "27017", spec: "the mongodb wire", group: "data", security: "opportunistic", state: "live" },
  { scheme: "mysql", name: "MySQL client protocol", port: "3306", spec: "the mysql protocol", group: "data", security: "opportunistic", state: "live" },
  { scheme: "postgresql", name: "PostgreSQL v3 protocol", port: "5432", spec: "the pg v3 protocol", group: "data", security: "opportunistic", state: "live" },
  { scheme: "redis", name: "Redis RESP3", port: "6379", spec: "RESP3", group: "data", security: "opportunistic", state: "live" },

  /** ## ops — the observability and time family. */
  { scheme: "chargen", name: "Character Generator", port: "19", spec: "RFC 864", group: "ops", security: "cleartext", state: "legacy" },
  { scheme: "daytime", name: "Daytime", port: "13", spec: "RFC 867", group: "ops", security: "cleartext", state: "legacy" },
  { scheme: "discard", name: "Discard", port: "9", spec: "RFC 863", group: "ops", security: "cleartext", state: "legacy" },
  { scheme: "echo", name: "Echo", port: "7", spec: "RFC 862", group: "ops", security: "cleartext", state: "legacy" },
  { scheme: "ipfix", name: "IPFIX", port: "4739/UDP", spec: "RFC 7011", group: "ops", security: "cleartext", state: "live" },
  { scheme: "netflow", name: "NetFlow v9", port: "2055/UDP", spec: "the netflow spec", group: "ops", security: "cleartext", state: "live" },
  { scheme: "ntp", name: "NTPv4", port: "123/UDP", spec: "RFC 5905", group: "ops", security: "cleartext", state: "live" },
  { scheme: "openmetrics", name: "OpenMetrics scrape", port: "443", spec: "the openmetrics spec", group: "ops", security: "encrypted", state: "live" },
  { scheme: "ptp", name: "PTP", port: "319/UDP", spec: "IEEE 1588", group: "ops", security: "cleartext", state: "opt-in" },
  { scheme: "sflow", name: "sFlow v5", port: "6343/UDP", spec: "the sflow spec", group: "ops", security: "cleartext", state: "live" },
  { scheme: "snmp", name: "SNMPv3", port: "161/UDP", spec: "RFC 3411", group: "ops", security: "opportunistic", state: "live" },
  { scheme: "snmptrap", name: "SNMP traps", port: "162/UDP", spec: "RFC 3416", group: "ops", security: "cleartext", state: "live" },
  { scheme: "syslog", name: "Syslog", port: "514/UDP", spec: "RFC 5424", group: "ops", security: "cleartext", state: "live" },
  { scheme: "syslog-tls", name: "Syslog over TLS", port: "6514", spec: "RFC 5425", group: "ops", security: "encrypted", state: "live" },

  /** ## directory — the lookup and identity family. */
  { scheme: "dict", name: "DICT", port: "2628", spec: "RFC 2229", group: "directory", security: "cleartext", state: "legacy" },
  { scheme: "kerberos", name: "Kerberos V5", port: "88", spec: "RFC 4120", group: "directory", security: "encrypted", state: "live" },
  { scheme: "kpasswd", name: "Kerberos password change", port: "464", spec: "the kpasswd dialect", group: "directory", security: "opportunistic", state: "live" },
  { scheme: "ldap", name: "LDAPv3", port: "389", spec: "RFC 4511", group: "directory", security: "opportunistic", state: "live" },
  { scheme: "ldaps", name: "LDAP over TLS", port: "636", spec: "RFC 4513", group: "directory", security: "encrypted", state: "live" },
  { scheme: "radsec", name: "RADIUS over TLS", port: "2083", spec: "RFC 6614", group: "directory", security: "encrypted", state: "live" },
  { scheme: "radius", name: "RADIUS", port: "1812/UDP", spec: "RFC 2865", group: "directory", security: "cleartext", state: "live" },
  { scheme: "rdap", name: "RDAP", port: "443", spec: "RFC 9082 · 9083", group: "directory", security: "encrypted", state: "live" },
  { scheme: "tacacs", name: "TACACS", port: "49", spec: "RFC 8907", group: "directory", security: "cleartext", state: "legacy" },
  { scheme: "tacacs+", name: "TACACS+", port: "49", spec: "RFC 8907", group: "directory", security: "opportunistic", state: "live" },
  { scheme: "z39.50", name: "Z39.50", port: "210", spec: "ANSI/NISO Z39.50", group: "directory", security: "cleartext", state: "legacy" },

  /** ## legacy — the inherited wires the gateway still translates. */
  { scheme: "aprs", name: "APRS packet radio", port: "14580/UDP", spec: "the aprs spec", group: "legacy", security: "cleartext", state: "opt-in" },
  { scheme: "arp", name: "ARP", port: "—", spec: "RFC 826", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "bfd", name: "BFD", port: "3784/UDP", spec: "RFC 5880", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "bgp", name: "BGP-4", port: "179", spec: "RFC 4271", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "binkp", name: "BinkP", port: "24554", spec: "the binkp protocol", group: "legacy", security: "opportunistic", state: "legacy" },
  { scheme: "dtn", name: "Bundle Protocol v7", port: "—", spec: "RFC 9171", group: "legacy", security: "opportunistic", state: "opt-in" },
  { scheme: "eigrp", name: "EIGRP", port: "—", spec: "RFC 7868", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "finger", name: "Finger", port: "79", spec: "RFC 1288", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "gopher", name: "Gopher", port: "70", spec: "RFC 1436", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "gophers", name: "Gopher over TLS", port: "70", spec: "the gophers extension", group: "legacy", security: "encrypted", state: "legacy" },
  { scheme: "gtp", name: "GTP (the telco bearer)", port: "2152/UDP", spec: "3GPP TS 29.281", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "icmp", name: "ICMP", port: "—", spec: "RFC 792", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "icmpv6", name: "ICMPv6", port: "—", spec: "RFC 4443", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "ident", name: "Ident", port: "113", spec: "RFC 1413", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "igmp", name: "IGMP", port: "—", spec: "RFC 3376", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "isis", name: "IS-IS", port: "—", spec: "ISO 10589 · RFC 1195", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "modbus", name: "Modbus TCP", port: "502", spec: "the modbus spec", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "ndmp", name: "NDMP", port: "10000", spec: "the ndmp protocol", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "netbios", name: "NetBIOS", port: "137-139", spec: "RFC 1001 · 1002", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "nntp", name: "NNTP", port: "119", spec: "RFC 3977", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "nntps", name: "NNTP over TLS", port: "563", spec: "RFC 4642", group: "legacy", security: "encrypted", state: "legacy" },
  { scheme: "opc-ua", name: "OPC UA", port: "4840", spec: "IEC 62541", group: "legacy", security: "opportunistic", state: "opt-in" },
  { scheme: "ospf", name: "OSPF", port: "—", spec: "RFC 2328", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "rip", name: "RIP2", port: "520/UDP", spec: "RFC 2453", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "slp", name: "SLP", port: "427", spec: "RFC 2609", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "ssdp", name: "SSDP", port: "1900/UDP", spec: "the upnp uda spec", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "uucp", name: "UUCP", port: "540", spec: "the uucp protocol", group: "legacy", security: "cleartext", state: "legacy" },
  { scheme: "whois", name: "WHOIS", port: "43", spec: "RFC 3912", group: "legacy", security: "cleartext", state: "live" },
  { scheme: "wsdd", name: "WS-Discovery", port: "3702/UDP", spec: "the ws-discovery spec", group: "legacy", security: "cleartext", state: "live" },
];

/** The row count of the mesh (the number the pane and the tests announce). */
export const PROTOCOL_COUNT = PROTOCOLS.length;

/** Finds one protocol row by its scheme (case-insensitive, exact match). */
export function findProtocol(scheme: string): ProtocolSpec | undefined {
  const wanted = scheme.trim().toLowerCase();
  return PROTOCOLS.find((row) => row.scheme === wanted);
}

/** Lists every protocol of one family (the pane renders one group per family keyword). */
export function protocolsByGroup(group: ProtocolGroup): ProtocolSpec[] {
  return PROTOCOLS.filter((row) => row.group === group);
}

/** Lists the schemes the gateway registers (one entry per protocol row). */
export function protocolSchemes(): string[] {
  return PROTOCOLS.map((row) => row.scheme);
}

/**
 * Lists the tls-capable protocols of the mesh — every row whose wire runs encrypted or
 * upgrades to it (STARTTLS, TLS-on-demand). The owner law pins this count above one
 * hundred: the gateway speaks more than a hundred protocols over https-grade crypto.
 */
export function tlsCapableProtocols(): ProtocolSpec[] {
  return PROTOCOLS.filter((row) => row.security !== "cleartext");
}

/** Answers the badge tone of one protocol row (the pane chip derivation). */
export function protocolTone(spec: ProtocolSpec): BadgeTone {
  if (spec.security === "encrypted") return "success";
  if (spec.security === "opportunistic") return "info";
  return spec.state === "legacy" ? "default" : "warning";
}

/** Lists the family keywords the mesh carries (the pane section order). */
export function protocolGroups(): ProtocolGroup[] {
  const seen = new Set<ProtocolGroup>();
  for (const row of PROTOCOLS) seen.add(row.group);
  return [...seen];
}
