// # zonediff.test — honest unit tests for the zone diff, runnable with the
// vitest runner:
//   pnpm test
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { nextSerial } from "../argan.ts";
import {
  diffZoneFiles,
  diffZones,
  parseZoneRecords,
  recordsFromRows,
  serialForPublication,
  ZoneDiffError,
  type ZoneRecord,
} from "../zonediff.ts";

const ORIGIN = "example.com.";

/** A shorthand record builder. */
function record(name: string, type: string, ttl: number | undefined, data: string): ZoneRecord {
  return { name, type, ttl, data };
}

describe("zonediff parser", () => {
  it("parses absolute and relative owners, @, ttl and class in both orders", () => {
    const text = [
      "example.com.      300 IN SOA ns1.example.com. hostmaster.example.com. 1 2 3 4 5",
      "www         3600 IN A   192.0.2.10",
      "@                 IN  A   192.0.2.1",
      "mail      IN 600  A   192.0.2.20",
    ].join("\n");
    const records = parseZoneRecords(text, ORIGIN);
    assert.equal(records.length, 4);
    assert.equal(records[0].name, "example.com.");
    assert.equal(records[0].type, "SOA");
    assert.equal(records[0].ttl, 300);
    assert.equal(records[1].name, "www.example.com.");
    assert.equal(records[1].ttl, 3600);
    assert.equal(records[2].name, "example.com.");
    assert.equal(records[2].ttl, undefined);
    assert.equal(records[3].name, "mail.example.com.");
    assert.equal(records[3].ttl, 600);
  });

  it("honors $TTL, $ORIGIN, unit ttls and name normalization in rdata", () => {
    const text = [
      "$TTL 1h30m",
      "$ORIGIN example.com.",
      "www     10m  A    192.0.2.10",
      "api          CNAME www",
      "@       300  MX   10 Mail",
      "_sip._tcp    SRV  10 60 5060 sipserver",
    ].join("\n");
    const records = parseZoneRecords(text, "example.org.");
    assert.equal(records[0].ttl, 600);
    assert.equal(records[1].data, "www.example.com.");
    assert.equal(records[2].data, "10 mail.example.com.");
    assert.equal(records[3].data, "10 60 5060 sipserver.example.com.");
    // a record without its own ttl inherits the $TTL default (RFC 2308)
    assert.equal(records[1].ttl, 5400);
  });

  it("inherits the owner on indented lines and joins parenthesized continuations", () => {
    const text = [
      "$ORIGIN example.com.",
      "@   300 IN SOA ns1.example.com. hostmaster.example.com. (",
      "        2026010101 ; serial",
      "        7200       ; refresh",
      "        )",
      "www     300 IN A 192.0.2.10",
    ].join("\n");
    const records = parseZoneRecords(text, ORIGIN);
    assert.equal(records.length, 2);
    assert.equal(records[0].type, "SOA");
    assert.equal(records[0].name, "example.com.");
    assert.ok(records[0].data.includes("2026010101"));
    assert.ok(records[0].data.includes("7200"));
  });

  it("drops comments and quoted-content keeps spaces", () => {
    const text = ['chat 300 IN TXT "hello world" ; the greeting'].join("\n");
    const records = parseZoneRecords(text, ORIGIN);
    assert.equal(records[0].data, "hello world");
  });

  it("throws a traceable ZoneDiffError with the line number", () => {
    const text = ["ok 300 IN A 192.0.2.1", "broken 300 IN"].join("\n");
    assert.throws(
      () => parseZoneRecords(text, ORIGIN),
      (error: unknown) => error instanceof ZoneDiffError && error.line === 2,
    );
  });
});

describe("zonediff planner", () => {
  it("answers an empty diff for identical records", () => {
    const zone = [
      record("example.com.", "A", 300, "192.0.2.1"),
      record("www.example.com.", "A", 300, "192.0.2.10"),
      record("www.example.com.", "AAAA", 300, "2001:db8::10"),
    ];
    const diff = diffZones(zone, [...zone].reverse());
    assert.deepEqual(diff, { creates: [], deletes: [], updates: [] });
  });

  it("detects creates, deletes and target updates", () => {
    const current = [
      record("example.com.", "A", 300, "192.0.2.1"),
      record("old.example.com.", "A", 300, "192.0.2.2"),
      record("www.example.com.", "CNAME", 300, "web.example.com."),
    ];
    const desired = [
      record("example.com.", "A", 300, "192.0.2.1"),
      record("new.example.com.", "A", 300, "192.0.2.3"),
      record("www.example.com.", "CNAME", 300, "edge.example.com."),
    ];
    const diff = diffZones(current, desired);
    assert.equal(diff.creates.length, 1);
    assert.equal(diff.creates[0].after?.name, "new.example.com.");
    assert.equal(diff.deletes.length, 1);
    assert.equal(diff.deletes[0].before?.name, "old.example.com.");
    assert.equal(diff.updates.length, 1);
    assert.equal(diff.updates[0].reason, "targets");
    assert.equal(diff.updates[0].before?.data, "web.example.com.");
    assert.equal(diff.updates[0].after?.data, "edge.example.com.");
  });

  it("never changes on round robin order and reports ttl-only updates", () => {
    const current = [
      record("api.example.com.", "A", 300, "192.0.2.1"),
      record("api.example.com.", "A", 300, "192.0.2.2"),
    ];
    const reordered = [
      record("api.example.com.", "A", 300, "192.0.2.2"),
      record("api.example.com.", "A", 300, "192.0.2.1"),
    ];
    assert.deepEqual(diffZones(current, reordered), { creates: [], deletes: [], updates: [] });
    const rettl = current.map((entry) => record(entry.name, entry.type, 600, entry.data));
    const diff = diffZones(current, rettl);
    assert.equal(diff.updates.length, 1);
    assert.equal(diff.updates[0].reason, "ttl");
    assert.equal(diff.updates[0].before?.ttl, 300);
    assert.equal(diff.updates[0].after?.ttl, 600);
  });

  it("keeps the serial when the diff is empty and bumps it through argan.nextSerial", () => {
    const zone = [record("example.com.", "A", 300, "192.0.2.1")];
    const serial = "2026093001";
    assert.equal(serialForPublication(diffZones(zone, zone), serial), serial);
    assert.equal(serialForPublication(diffZones(zone, []), serial), nextSerial(serial));
    assert.equal(nextSerial("2026093001"), "2026093002");
  });

  it("diffs two verbatim zone files and bridges the RecordSetRow tables", () => {
    const currentText = "www 300 IN A 192.0.2.10";
    const desiredText = "www 300 IN A 192.0.2.11";
    const diff = diffZoneFiles(currentText, desiredText, ORIGIN);
    assert.equal(diff.updates.length, 1);
    const rows = [
      { kind: "record" as const, name: "www", type: "A", data: "192.0.2.10", line: "www 300 IN A 192.0.2.10" },
      { kind: "blank" as const, line: "" },
    ];
    const records = recordsFromRows(rows, ORIGIN);
    assert.equal(records.length, 1);
    assert.equal(records[0].name, "www.example.com.");
    assert.deepEqual(diffZones(records, parseZoneRecords(desiredText, ORIGIN)).updates.length, 1);
  });
});
