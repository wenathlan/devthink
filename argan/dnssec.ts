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
  if (!Number.isFinite(algorithm) || algorithm <= 0) throw new DnssecValidationError(`dnssec: bad algorithm "${fields[1]}"`);
  if (!Number.isFinite(labels) || labels < 0) throw new DnssecValidationError(`dnssec: bad label count "${fields[2]}"`);
  if (!Number.isFinite(originalTtl) || originalTtl < 0) throw new DnssecValidationError(`dnssec: bad original ttl "${fields[3]}"`);
  if (expiration < inception) throw new DnssecValidationError("dnssec: signature expires before it starts");
  if (!Number.isFinite(keyTag) || keyTag < 0 || keyTag > 65535) throw new DnssecValidationError(`dnssec: bad key tag "${fields[6]}"`);
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
    accumulator += accumulator >> 16 & 0xffff;
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
    return { ok: false, code: "label-count-mismatch", detail: `rrsig covers ${sig.labels} labels, owner carries ${signedLabels}` };
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
    return { ok: false, code: "unknown-algorithm", detail: `algorithm ${ds.algorithm} is not in the RFC 8624 registry` };
  }
  if (!DNSSECDIGESTTYPES.has(ds.digestType)) {
    return { ok: false, code: "unknown-digest-type", detail: `digest type ${ds.digestType} is not in the IANA registry` };
  }
  if (ds.algorithm !== key.algorithm) {
    return { ok: false, code: "algorithm-mismatch", detail: `ds algorithm ${ds.algorithm} differs from dnskey ${key.algorithm}` };
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
