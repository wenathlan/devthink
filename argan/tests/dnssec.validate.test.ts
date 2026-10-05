// # dnssec.validate.test — honest unit tests for the DNSSEC validation math, runnable
// with the node built-in runner (no install, no dependencies):
//   node --test tests/dnssec.validate.test.ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DNSSECALGORITHMS,
  DNSSECDIGESTTYPES,
  keyTag,
  parseRrSig,
  validateChainLink,
  validateDsMatch,
  validateSignatureLabels,
  validateSignatureTtl,
  validateSignatureWindow,
  DnssecValidationError,
  type DnsKey,
} from "../dnssec.validate.ts";

/** A small DNSKEY whose key tag was computed by hand from the RFC 4034 Appendix B loop. */
const ZONEKEY: DnsKey = { flags: 256, protocol: 3, algorithm: 8, publicKey: "qrs=" };

/** A fresh RRSIG presentation line over www.example.com. (2026 window). */
const SIGNATURELINE = "A 8 3 300 20261231235959 20260101000000 18928 www.example.com. dGVzdHNpZ25hdHVyZQ==";

describe("dnssec.validate presentation parsing", () => {
  it("parses an RRSIG line with its zone-file timestamps", () => {
    const sig = parseRrSig(SIGNATURELINE);
    assert.equal(sig.typeCovered, "A");
    assert.equal(sig.algorithm, 8);
    assert.equal(sig.labels, 3);
    assert.equal(sig.originalTtl, 300);
    assert.equal(sig.keyTag, 18928);
    assert.equal(sig.signerName, "www.example.com.");
    assert.equal(sig.expiration, Date.UTC(2026, 11, 31, 23, 59, 59));
    assert.equal(sig.inception, Date.UTC(2026, 0, 1, 0, 0, 0));
  });

  it("accepts the optional leading RRSIG token and rejects broken rows", () => {
    assert.equal(parseRrSig(`RRSIG ${SIGNATURELINE}`).typeCovered, "A");
    assert.throws(() => parseRrSig("A 8 3"), DnssecValidationError);
    assert.throws(() => parseRrSig("A 8 3 300 2026 20260101000000 1 example.com. aa"), DnssecValidationError);
    // expiration before inception is structurally impossible
    assert.throws(
      () => parseRrSig("A 8 3 300 20260101000000 20261231235959 1 example.com. aa"),
      DnssecValidationError,
    );
  });
});

describe("dnssec.validate key tag and chain math", () => {
  it("computes the RFC 4034 Appendix B checksum by hand", () => {
    // rdata = 01 00 03 08 aa bb → 256 + 0 + 768 + 8 + 43520 + 187 = 44739
    assert.equal(keyTag(ZONEKEY), 44739);
  });

  it("answers the IANA registries the validator consults", () => {
    assert.equal(DNSSECALGORITHMS.get(15), "ED25519");
    assert.equal(DNSSECDIGESTTYPES.get(2), "SHA-256");
    assert.ok(!DNSSECALGORITHMS.has(0));
  });

  it("matches a DS to its DNSKEY and names the failed check", () => {
    const ds = { keyTag: keyTag(ZONEKEY), algorithm: 8, digestType: 2, digest: "9f86d081884c7d65" };
    assert.deepEqual(validateDsMatch(ds, ZONEKEY), { ok: true });
    assert.deepEqual(validateChainLink(ds, ZONEKEY), { ok: true });
    const wrongTag = validateDsMatch({ ...ds, keyTag: 1 }, ZONEKEY);
    assert.equal(wrongTag.ok, false);
    assert.equal(wrongTag.ok ? "" : wrongTag.code, "key-tag-mismatch");
    const wrongAlgorithm = validateDsMatch({ ...ds, algorithm: 13 }, ZONEKEY);
    assert.equal(wrongAlgorithm.ok ? "" : wrongAlgorithm.code, "algorithm-mismatch");
    const unknownDigest = validateDsMatch({ ...ds, digestType: 9 }, ZONEKEY);
    assert.equal(unknownDigest.ok ? "" : unknownDigest.code, "unknown-digest-type");
    const unknownAlgorithm = validateDsMatch({ ...ds, algorithm: 0 }, ZONEKEY);
    assert.equal(unknownAlgorithm.ok ? "" : unknownAlgorithm.code, "unknown-algorithm");
    // flags and protocol are part of the rdata, so each mutation recomputes its own DS tag
    const strippedKey = { ...ZONEKEY, flags: 1 };
    const noZoneKey = validateDsMatch({ keyTag: keyTag(strippedKey), algorithm: 8, digestType: 2, digest: "aa" }, strippedKey);
    assert.equal(noZoneKey.ok ? "" : noZoneKey.code, "not-a-zone-key");
    const oldProtocolKey = { ...ZONEKEY, protocol: 2 };
    const badProtocol = validateDsMatch({ keyTag: keyTag(oldProtocolKey), algorithm: 8, digestType: 2, digest: "aa" }, oldProtocolKey);
    assert.equal(badProtocol.ok ? "" : badProtocol.code, "protocol-mismatch");
  });
});

describe("dnssec.validate clock and ttl windows", () => {
  const sig = parseRrSig(SIGNATURELINE);

  it("answers ok inside the validity window and names the reason outside", () => {
    const inside = Date.UTC(2026, 5, 15, 12, 0, 0);
    assert.deepEqual(validateSignatureWindow(sig, inside), { ok: true });
    const after = Date.UTC(2027, 0, 2, 0, 0, 0);
    const expired = validateSignatureWindow(sig, after);
    assert.equal(expired.ok ? "" : expired.code, "expired-signature");
    const before = Date.UTC(2025, 0, 1, 0, 0, 0);
    const early = validateSignatureWindow(sig, before);
    assert.equal(early.ok ? "" : early.code, "not-yet-valid-signature");
  });

  it("honors the clock skew on both edges of the window", () => {
    const justExpired = sig.expiration + 60_000;
    assert.equal(validateSignatureWindow(sig, justExpired, 120_000).ok, true);
    assert.equal(validateSignatureWindow(sig, justExpired, 0).ok, false);
    const justStarted = sig.inception - 60_000;
    assert.equal(validateSignatureWindow(sig, justStarted, 120_000).ok, true);
  });

  it("enforces the rrset ttl equality and the original ttl ceiling", () => {
    assert.deepEqual(validateSignatureTtl(sig, 300, 300), { ok: true });
    const mismatch = validateSignatureTtl(sig, 600, 300);
    assert.equal(mismatch.ok ? "" : mismatch.code, "ttl-mismatch");
    const ceiling = validateSignatureTtl(parseRrSig("A 8 3 60 20261231235959 20260101000000 1 example.com. aa"), 300, 300);
    assert.equal(ceiling.ok ? "" : ceiling.code, "ttl-exceeds-original");
  });

  it("checks the label count with the wildcard rule", () => {
    assert.deepEqual(validateSignatureLabels(sig, "www.example.com."), { ok: true });
    // the wildcard drops its leftmost label: *.example.com. signs as 2 labels
    const wildcard = parseRrSig("A 8 2 300 20261231235959 20260101000000 1 example.com. aa");
    assert.deepEqual(validateSignatureLabels(wildcard, "*.example.com."), { ok: true });
    const broken = validateSignatureLabels(sig, "a.b.example.com.");
    assert.equal(broken.ok ? "" : broken.code, "label-count-mismatch");
  });
});
