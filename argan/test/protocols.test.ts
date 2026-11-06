// # protocols.test — honest unit tests for the gateway protocol mesh, runnable with
// the vitest runner:
//   pnpm test
// The suite pins the owner law of wave 2-a: more than one hundred protocols on the
// internal api surface (144 tls-capable wires over the hundred line, 231 rows above
// the two hundred line), the canonical schemes of the mesh, the family grouping, the
// tone derivation and the catalog accessor that serves the mesh offline.
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { listProtocols } from "../catalog.ts";
import {
  findProtocol,
  PROTOCOLS,
  PROTOCOL_COUNT,
  protocolGroups,
  protocolsByGroup,
  protocolSchemes,
  protocolTone,
  tlsCapableProtocols,
} from "../protocols.ts";

/** The schemes the owner law names (the transfer and application wires of the mesh). */
const LAW_SCHEMES: readonly string[] = [
  "https", "wss", "webtransport", "webcodecs", "webrtc", "webdav", "webdavs", "sftp",
  "ftps", "smtp", "smtps", "imap", "imaps", "pop3", "pop3s", "dns", "doh", "dot",
  "quic", "h3", "h2", "h2c", "spdy", "socks5", "socks5h", "tor", "i2p", "ipfs",
  "hypercore", "gemini", "gopher", "ldap", "ldaps", "rdp", "vnc", "ssh", "telnet",
  "mqtt", "mqtts", "amqp", "amqps", "stomp", "nats", "grpc", "grpcs", "capnproto",
  "msgpack-rpc", "thrift", "xmlrpc", "jsonrpc", "soap", "graphql-ws", "sse", "longpoll",
  "echo", "discard", "chargen", "daytime", "ntp", "snmp", "syslog", "tftp",
];

describe("protocol mesh scale (the hundred law)", () => {
  it("answers 231 protocols — more than one hundred, above the two hundred line", () => {
    assert.equal(PROTOCOL_COUNT, 231);
    assert.ok(PROTOCOL_COUNT > 100, "the mesh must clear one hundred");
    assert.ok(PROTOCOL_COUNT >= 200, "the mesh must clear the two hundred line");
  });

  it("carries 144 tls-capable wires — the https-grade count clears one hundred", () => {
    const capable = tlsCapableProtocols();
    assert.equal(capable.length, 144);
    assert.ok(capable.length > 100, "the tls-capable count must clear one hundred");
  });

  it("registers every scheme of the owner law", () => {
    const schemes = new Set(protocolSchemes());
    for (const scheme of LAW_SCHEMES) {
      assert.ok(schemes.has(scheme), `the mesh must register ${scheme}`);
    }
  });

  it("answers one row per scheme with a name, port, spec, family and state", () => {
    const seen = new Set<string>();
    for (const row of PROTOCOLS) {
      assert.ok(!seen.has(row.scheme), `the scheme ${row.scheme} rides twice`);
      seen.add(row.scheme);
      assert.ok(row.name.length > 0, `${row.scheme} needs a name`);
      assert.ok(row.port.length > 0, `${row.scheme} needs a port answer`);
      assert.ok(row.spec.length > 0, `${row.scheme} needs a spec`);
      assert.ok(row.state.length > 0, `${row.scheme} needs a state`);
    }
    assert.equal(seen.size, PROTOCOL_COUNT);
  });
});

describe("protocol mesh grouping and lookups", () => {
  it("groups the mesh into the fifteen family keywords", () => {
    const groups = protocolGroups();
    assert.equal(groups.length, 15);
    for (const group of groups) {
      assert.ok(protocolsByGroup(group).length > 0, `the ${group} family carries rows`);
    }
  });

  it("answers the dns family with the argan home transports", () => {
    const dns = protocolsByGroup("dns");
    assert.equal(dns.length, 12);
    assert.ok(dns.every((row) => row.group === "dns"));
    const doh = dns.find((row) => row.scheme === "doh");
    assert.equal(doh?.spec, "RFC 8484");
    assert.equal(doh?.state, "preferred");
  });

  it("resolves schemes case-insensitively and answers unknowns with undefined", () => {
    assert.equal(findProtocol("WSS")?.name, "WebSocket Secure");
    assert.equal(findProtocol(" https ")?.port, "443");
    assert.equal(findProtocol("gopher")?.security, "cleartext");
    assert.equal(findProtocol("telstar"), undefined);
  });

  it("derives the pane tone from the security posture", () => {
    assert.equal(protocolTone(findProtocol("wss")!), "success");
    assert.equal(protocolTone(findProtocol("imap")!), "info");
    assert.equal(protocolTone(findProtocol("telnet")!), "default");
    assert.equal(protocolTone(findProtocol("http")!), "warning");
  });
});

describe("protocol mesh on the catalog surface", () => {
  it("serves the mesh through the typed accessor offline (the registry seed)", async () => {
    const rows = await listProtocols();
    assert.equal(rows.length, PROTOCOL_COUNT);
    assert.ok(rows.some((row) => row.scheme === "webtransport"));
  });
});
