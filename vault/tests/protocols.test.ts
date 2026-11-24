// # protocols.test — the https protocols pillar of the vault, runnable with
// the house vitest suite:
//   bunx vitest run tests/protocols.test.ts
// The pillar's laws: the catalog is real (the row count above one thousand —
// the 231 curated wires of the family mesh plus the IANA service registry
// rows), the tls-capable count the family law pins above one hundred, the
// static-safe route lane resolves every scheme under the prefix through the
// one read-only handler, and an unknown scheme or a nested path refuses
// honestly (undefined, the caller's own 404).
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  findProtocol,
  PROTOCOL_COUNT,
  protocolRoute,
  PROTOCOL_ROUTE_COUNT,
  PROTOCOL_ROUTE_PREFIX,
  PROTOCOLS,
  protocolRouteOf,
  protocolsByGroup,
  tlsCapableProtocols,
} from "../protocols.ts";

describe("the catalog counts (the pillar's own numbers)", () => {
  it("carries the row count above one thousand", () => {
    assert.ok(PROTOCOL_COUNT > 1000, `the catalog carries ${PROTOCOL_COUNT} rows`);
    assert.equal(PROTOCOLS.length, PROTOCOL_COUNT);
  });

  it("serves one static-safe route per row plus the list route", () => {
    assert.equal(PROTOCOL_ROUTE_COUNT, PROTOCOL_COUNT + 1);
    assert.ok(PROTOCOL_ROUTE_COUNT > 1000, `the pillar serves ${PROTOCOL_ROUTE_COUNT} protocol routes`);
  });

  it("carries the curated mesh and the IANA service registry together", () => {
    assert.ok(protocolsByGroup("web").length > 10, "the curated web family rides the catalog");
    assert.ok(protocolsByGroup("service").length > 900, "the IANA service family rides the catalog");
  });

  it("keeps the catalog honest: no duplicate scheme, every row lowercase", () => {
    const seen = new Set<string>();
    for (const row of PROTOCOLS) {
      assert.equal(row.scheme, row.scheme.toLowerCase(), `${row.scheme} stays lowercase`);
      assert.ok(!seen.has(row.scheme), `the scheme ${row.scheme} answers once`);
      seen.add(row.scheme);
      assert.ok(row.name.length > 0, `${row.scheme} carries a name`);
      assert.ok(row.spec.length > 0, `${row.scheme} carries a governing spec`);
      assert.ok(row.group.length > 0, `${row.scheme} carries a family`);
    }
  });
});

describe("the family mesh laws", () => {
  it("carries the tls-capable count the family law pins above one hundred", () => {
    const tls = tlsCapableProtocols();
    assert.ok(tls.length > 100, `the mesh carries ${tls.length} tls-capable wires`);
    for (const row of tls) {
      assert.ok(row.security === "encrypted" || row.security === "opportunistic");
    }
  });

  it("answers the curated wires with their governing specs", () => {
    const https = findProtocol("https");
    assert.ok(https);
    assert.equal(https.port, "443");
    assert.equal(https.group, "web");
    assert.equal(https.security, "encrypted");
    assert.ok(https.spec.includes("RFC 9110"));
    const wss = findProtocol("wss");
    assert.ok(wss);
    assert.equal(wss.security, "encrypted");
    assert.equal(findProtocol("HTTPS")?.scheme, "https", "the lookup answers case-insensitively");
    assert.equal(findProtocol("no-such-wire"), undefined);
  });

  it("answers the IANA service rows with their registry ports", () => {
    const echo = findProtocol("echo");
    assert.ok(echo);
    assert.equal(echo.group, "service");
    assert.ok(echo.port.startsWith("7/"));
    assert.equal(echo.security, undefined, "the registry service rows pin no posture");
  });
});

describe("the static-safe route lane", () => {
  it("resolves every scheme route under the one prefix", () => {
    assert.equal(PROTOCOL_ROUTE_PREFIX, "/api/v1/protocols");
    assert.equal(protocolRoute("https"), "/api/v1/protocols/https");
    assert.equal(protocolRouteOf("/api/v1/protocols/https")?.scheme, "https");
    assert.equal(protocolRouteOf("/api/v1/protocols/wss")?.spec, "RFC 6455");
    assert.equal(protocolRouteOf("/api/v1/protocols/echo")?.group, "service");
  });

  it("refuses the unknown scheme, the nested path and the foreign prefix honestly", () => {
    assert.equal(protocolRouteOf("/api/v1/protocols/no-such-wire"), undefined);
    assert.equal(protocolRouteOf("/api/v1/protocols/https/extra"), undefined);
    assert.equal(protocolRouteOf("/api/v1/protocols/"), undefined);
    assert.equal(protocolRouteOf("/api/v1/protocols"), undefined);
    assert.equal(protocolRouteOf("/api/v1/protocolsX"), undefined);
  });

  it("answers the route of every catalog row (no dead routes, no stubs)", () => {
    for (const row of PROTOCOLS) {
      const resolved = protocolRouteOf(protocolRoute(row.scheme));
      assert.equal(resolved?.scheme, row.scheme, `the route of ${row.scheme} answers its row`);
    }
  });
});
