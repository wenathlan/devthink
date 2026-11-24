// # zones.test — the domains ledger of argan, runnable with the vitest
// runner:
//   pnpm test
// The ledger is the domains-under-management table of the dns library: the
// seed rows ride the zones db table through seedIfEmpty and reach the home
// and zones faces over the catalog accessor. The battery pins the
// restoration the complaint register ordered (complaint #72 — "de sete
// domínios dois foram arrancados indevidamente": of seven domains, two were
// ripped, and the name, type and content properties never belonged in a
// removal): the gateway and the os domains of the devthink.pro family ride
// the ledger again, treated exactly like the standing domains — the same
// ZoneSnapshot grammar, argan primary (master) and signed from day one per
// the family law, hanging under the devthink.pro apex.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { findZone } from "../argan.ts";
import { seedZones } from "../seed.ts";

/** the two family domains the complaint register ordered restored. */
const RESTORED = ["gateway.devthink.pro", "os.devthink.pro"];

describe("domains ledger", () => {
  it("carries the two ripped family domains restored, beside the standing five", () => {
    // the ledger answers seven domains: the five standing rows plus the two
    // the complaint register orders back
    assert.equal(seedZones.length, 7);
    for (const origin of RESTORED) {
      const zone = findZone(seedZones, origin);
      assert.ok(zone, `the ledger lost the restored domain ${origin}`);
    }
  });

  it("treats the restored domains like the standing ones — the same grammar", () => {
    for (const origin of RESTORED) {
      const zone = findZone(seedZones, origin);
      assert.ok(zone);
      // the row type is the standing one: origin, kind, serial, state — no
      // extra shape, no invented fields
      assert.deepEqual(Object.keys(zone).sort(), ["kind", "origin", "serial", "state"]);
      // argan is primary for the family domains (the registry law: one
      // primary; the secondaries ride authenticated transfer)
      assert.equal(zone.kind, "master");
      // the family law: the domains in the account are signed from day one
      assert.equal(zone.state, "signed");
      // the zone law: the serial rides the YYYYMMDDNN shape (date plus the
      // revision of the day)
      assert.match(zone.serial, /^\d{8}\d{2}$/);
    }
  });

  it("hangs the restored domains under the devthink.pro apex the ledger keeps", () => {
    // the family domains of the complaint live under the bought apex — the
    // hung model law: one purchased domain anchors everything
    const apex = findZone(seedZones, "devthink.pro");
    assert.ok(apex, "the ledger lost the devthink.pro apex");
    for (const origin of RESTORED) {
      assert.ok(origin.endsWith(".devthink.pro"), `${origin} hangs under the apex`);
    }
    // the restored rows never shadow the apex or each other
    const origins = seedZones.map((zone) => zone.origin);
    assert.equal(new Set(origins).size, origins.length, "the ledger carries a duplicate origin");
  });
});
