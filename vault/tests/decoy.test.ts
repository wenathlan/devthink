// # decoy tests — the faun lesson's final seal answers probes with the
// plausible and keeps the honest contract for every api shape. the suite
// walks the three laws of the decoy lane: the ledger is plausible and
// deterministic within a boot (the repeated probe reads the same world),
// the probe verdict separates the browser signature from every api
// shape, and the encrypted decoy wears the store face with zero truth in
// the clear. the api wiring itself rides the accounts suite's server
// harness — the browser-shaped read answers the decoy while the bare
// anonymous request keeps the honest 401 the accounts suite asserts.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { decoyledger, encrypteddecoy, isprobe } from "../decoy.ts";

describe("the decoy ledger", () => {
  it("is plausible — three to nine projects with believable rows", () => {
    const ledger = decoyledger();
    assert.ok(ledger.length >= 3 && ledger.length <= 9, `the believable band rides 3-9 rows, saw ${ledger.length}`);
    for (const row of ledger) {
      assert.match(row.id, /^pd-\d+/, "the id carries the real lane shape");
      assert.match(row.createdAt, /^2026-\d{2}-\d{2}$/, "the date reads as an iso day");
      assert.ok(row.bytes >= 12 * 1024 * 1024, "the size sits in the believable megabyte band");
      assert.ok(row.objects >= 40, "the object count sits in the believable band");
      assert.ok(row.name.length > 3, "the name reads as a real project name");
    }
  });

  it("is deterministic within a boot — the repeated probe reads the same world", () => {
    const first = JSON.stringify(decoyledger());
    const second = JSON.stringify(decoyledger());
    assert.equal(first, second, "two reads of the same boot answer the identical ledger");
  });

  it("carries distinct ids within a ledger", () => {
    const rows = decoyledger();
    const ids = new Set(rows.map((row) => row.id));
    assert.equal(ids.size, rows.length, "every decoy row carries a distinct id");
  });
});

describe("the probe verdict", () => {
  it("answers only the browser signature", () => {
    assert.equal(isprobe("text/html,application/xhtml+xml"), true, "the browser signature rides the decoy");
    assert.equal(isprobe("TEXT/HTML"), true, "the case-insensitive browser signature rides the decoy");
    assert.equal(isprobe(undefined), false, "the bare api shape keeps the honest refusal");
    assert.equal(isprobe("*/*"), false, "the star shape keeps the honest refusal");
    assert.equal(isprobe("application/json"), false, "the json client keeps the honest refusal");
    assert.equal(isprobe("text/plain"), false, "the plain text shape keeps the honest refusal");
  });
});

describe("the encrypted decoy", () => {
  it("wears the store face with zero truth in the clear", () => {
    const bytes = encrypteddecoy();
    assert.equal(bytes[0], 0x53, "the payload wears the sqlite magic the probe greps for");
    assert.equal(bytes[1], 0x51);
    assert.equal(bytes[14], 0x33, "the format line reads as the third generation");
    assert.equal(bytes[15], 0x00, "the magic terminates");
    /* the sealed body behind the face never carries the raw ledger: the
     * serialized decoy must not appear verbatim inside the payload. */
    const raw = new TextEncoder().encode(JSON.stringify({ projects: decoyledger() }));
    const sealedwindow = bytes.subarray(16);
    let verbatim = false;
    for (let index = 0; index + raw.length <= sealedwindow.length; index += 1) {
      if (sealedwindow[index] === raw[0]) {
        let matches = true;
        for (let probe = 1; probe < raw.length; probe += 1) {
          if (sealedwindow[index + probe] !== raw[probe]) {
            matches = false;
            break;
          }
        }
        if (matches) {
          verbatim = true;
          break;
        }
      }
    }
    assert.equal(verbatim, false, "the decoy body rides sealed, never in the clear");
  });
});
