import { describe, expect, it } from "vitest";
import {
  channellive,
  closeidlechannels,
  defaultidlewindowms,
  defaultheartbeatms,
  defaulthttpstream,
  enforcemaxclients,
  heartbeat,
  httpframepipeline,
  listremotestatus,
  openstreamchannel,
  starttls,
} from "../http.js";
import { issuetoken, issuepairingcode, grantallowlistentry } from "../auth.js";
import { defaultmcpconfig } from "../mcp.js";
import type { clientrecord, mcpserverconfig, streamchannel } from "../types.js";

const now = 1_800_000_000_000;

/** Builds one connected client fixture. */
function client(id: string, transport: "stdio" | "http" = "http"): clientrecord {
  return { id, transport, paired: true, connectedat: now - 1000, pairedat: now - 500 };
}

/** Builds one open channel fixture with its last beat offset from now. */
function channel(clientid: string, beatoffset: number): streamchannel {
  return { id: `channel-${clientid}`, clientid, openedat: now - 2000, lastbeatat: now - beatoffset };
}

describe("http stream channels", () => {
  it("opens server sent event channels and heartbeats idle ones", () => {
    const open = openstreamchannel({ clientid: "client1", now, id: "channel-1" });
    expect(open.id).toBe("channel-1");
    expect(open.openedat).toBe(now);
    expect(open.lastbeatat).toBe(now);
    expect(open.closedat).toBeUndefined();
    const beaten = heartbeat({ channels: [open], clientid: "client1", now: now + 5000 });
    expect(beaten[0]?.lastbeatat).toBe(now + 5000);
    const untouched = heartbeat({ channels: [channel("other", 0)], clientid: "client1", now: now + 5000 });
    expect(untouched[0]?.lastbeatat).toBe(now);
    expect(defaulthttpstream()).toEqual({
      endpoint: "/mcp",
      streampath: "/mcp/stream",
      tls: { mode: "off" },
      heartbeatms: defaultheartbeatms,
      idlewindowms: defaultidlewindowms,
    });
    expect(defaultheartbeatms).toBe(30_000);
    expect(defaultidlewindowms).toBe(90_000);
  });

  it("closes dead channels past the idle window while live ones stay open", () => {
    const live = channel("client1", 1000);
    const dead = channel("client2", defaultidlewindowms + 1);
    const closedalready = { ...channel("client3", 500), closedat: now - 10 };
    const swept = closeidlechannels({ channels: [live, dead, closedalready], now, idlewindow: defaultidlewindowms });
    expect(swept[0]?.closedat).toBeUndefined();
    expect(swept[1]?.closedat).toBe(now);
    expect(swept[2]?.closedat).toBe(now - 10);
    expect(channellive(live, now, defaultidlewindowms)).toBe(true);
    expect(channellive(dead, now, defaultidlewindowms)).toBe(false);
    expect(channellive(closedalready, now, defaultidlewindowms)).toBe(false);
    expect(channellive(channel("client4", 5000), now, 1000)).toBe(false);
  });
});

describe("tls termination", () => {
  it("keeps the localhost default off while required mode refuses unverified peers", () => {
    expect(starttls({ config: { mode: "off" }, now }).tls).toBe(false);
    const negotiated = starttls({ config: { mode: "on" }, now });
    expect(negotiated.tls).toBe(true);
    expect(negotiated.verified).toBe(true);
    const required = starttls({ config: { mode: "required" }, now });
    expect(required.tls).toBe(false);
    expect(required.reason).toMatch(/presented no certificate/i);
    const fingerprint = starttls({
      config: { mode: "required", certificatefingerprint: "sha256:aa" },
      presented: { fingerprint: "sha256:bb" },
      now,
    });
    expect(fingerprint.verified).toBe(false);
    expect(fingerprint.reason).toMatch(/does not match the user configured fingerprint/i);
    expect(
      starttls({
        config: { mode: "required", certificatefingerprint: "sha256:aa" },
        presented: { fingerprint: "sha256:aa" },
        now,
      }),
    ).toEqual({ tls: true, verified: true });
    expect(starttls({ config: { mode: "on", certificatefingerprint: "sha256:aa" }, now }).verified).toBe(false);
  });
});

describe("client ceiling", () => {
  it("refuses connections past the user configured maximum while an absent value stays unbounded", () => {
    const clients = [client("client1"), client("client2")];
    expect(enforcemaxclients({ clients, maxclients: 2 }).allowed).toBe(false);
    expect(enforcemaxclients({ clients, maxclients: 2 }).reason).toMatch(/maximum of 2 remote clients/i);
    expect(enforcemaxclients({ clients, maxclients: 3 }).allowed).toBe(true);
    expect(enforcemaxclients({ clients }).allowed).toBe(true);
    const disconnected = [
      client("client1"),
      { ...client("client2"), disconnectedat: now },
      { ...client("client3"), disconnectedat: now },
    ];
    expect(enforcemaxclients({ clients: disconnected, maxclients: 2 }).allowed).toBe(true);
    expect(enforcemaxclients({ clients: disconnected, maxclients: 1 }).allowed).toBe(false);
  });
});

describe("remote status", () => {
  it("reports endpoint, tls state, client counts and channel health", async () => {
    const token = await issuetoken({ clientid: "client1", scopes: ["browser"], now, raw: "raw" });
    const config: mcpserverconfig = {
      ...defaultmcpconfig(),
      enabled: true,
      httpstream: defaulthttpstream(),
      remoteaccess: { endpoint: "https://agent.example:7436", tls: { mode: "required" }, maxclients: 5 },
    };
    const status = listremotestatus({
      config,
      channels: [channel("client1", 1000), channel("client2", defaultidlewindowms + 1)],
      clients: [client("client1"), { ...client("client2"), paired: false }],
      tokens: [token.token],
      now,
    });
    expect(status.endpoint).toBe("https://agent.example:7436");
    expect(status.tls.mode).toBe("required");
    expect(status.tls.certificaterequired).toBe(true);
    expect(status.clients).toBe(2);
    expect(status.paired).toBe(1);
    expect(status.channelsopen).toBe(1);
    expect(status.channelsdead).toBe(1);
    expect(status.tokenslive).toBe(1);
    const plain = listremotestatus({
      config: { ...defaultmcpconfig(), enabled: true },
      channels: [],
      clients: [],
      tokens: [],
      now,
    });
    expect(plain.endpoint).toBe("/mcp");
    expect(plain.tls.mode).toBe("off");
  });
});

describe("ordered remote frame pipeline", () => {
  /** Builds the full pipeline fixture set for one remote caller. */
  async function pipelinefixture(
    config: mcpserverconfig,
  ): Promise<{
    tokens: Awaited<ReturnType<typeof issuetoken>>["token"][];
    raw: string;
    allowlist: import("../types.js").allowlistentry[];
  }> {
    const issued = await issuetoken({ clientid: "client1", scopes: ["browser"], now, raw: "raw-token" });
    const allowlist = grantallowlistentry({
      entries: [],
      identity: { fingerprint: "fp-1", displayname: "Laptop agent" },
      namespaces: ["browser"],
      actor: "user",
      now,
    });
    return { tokens: [issued.token], raw: "raw-token", allowlist };
  }

  it("terminates tls before any token verification", async () => {
    const config: mcpserverconfig = {
      ...defaultmcpconfig(),
      enabled: true,
      remoteaccess: {
        endpoint: "https://agent.example",
        tls: { mode: "required", certificatefingerprint: "sha256:aa" },
      },
    };
    const fixture = await pipelinefixture(config);
    const refused = await httpframepipeline({
      config,
      presented: { fingerprint: "sha256:bb" },
      tokens: fixture.tokens,
      rawtoken: fixture.raw,
      allowlist: fixture.allowlist,
      fingerprint: "fp-1",
      toolname: "browser.readtext",
      now,
    });
    expect(refused.error?.code).toBe("consentrefused");
    expect(refused.error?.message).toMatch(/does not match the user configured fingerprint/i);
    expect(refused.token).toBeUndefined();
    const missing = await httpframepipeline({
      config,
      tokens: fixture.tokens,
      rawtoken: fixture.raw,
      allowlist: fixture.allowlist,
      fingerprint: "fp-1",
      now,
    });
    expect(missing.error?.message).toMatch(/presented no certificate/i);
  });

  it("verifies the session token on every frame and answers with the fixed refusal", async () => {
    const config: mcpserverconfig = { ...defaultmcpconfig(), enabled: true };
    const fixture = await pipelinefixture(config);
    const missing = await httpframepipeline({
      config,
      tokens: fixture.tokens,
      allowlist: fixture.allowlist,
      fingerprint: "fp-1",
      now,
    });
    expect(missing.error?.message).toBe("The remote frame failed its authentication handshake.");
    const wrong = await httpframepipeline({
      config,
      tokens: fixture.tokens,
      rawtoken: "wrong",
      allowlist: fixture.allowlist,
      fingerprint: "fp-1",
      now,
    });
    expect(wrong.error?.code).toBe("consentrefused");
    expect(wrong.error?.message).toBe("The remote frame failed its authentication handshake.");
  });

  it("refuses allowlist misses after the token verified", async () => {
    const config: mcpserverconfig = { ...defaultmcpconfig(), enabled: true };
    const fixture = await pipelinefixture(config);
    const unknown = await httpframepipeline({
      config,
      tokens: fixture.tokens,
      rawtoken: fixture.raw,
      allowlist: fixture.allowlist,
      fingerprint: "fp-unknown",
      now,
    });
    expect(unknown.error?.code).toBe("consentrefused");
    expect(unknown.error?.message).toMatch(/not on the allowlist/i);
  });

  it("fails unknown namespaces fast and ungranted scopes as consent refusals", async () => {
    const config: mcpserverconfig = { ...defaultmcpconfig(), enabled: true };
    const fixture = await pipelinefixture(config);
    const unknown = await httpframepipeline({
      config,
      tokens: fixture.tokens,
      rawtoken: fixture.raw,
      allowlist: fixture.allowlist,
      fingerprint: "fp-1",
      toolname: "carrierpigeon.readtext",
      now,
    });
    expect(unknown.error?.code).toBe("params");
    expect(unknown.error?.message).toMatch(/no reviewed namespace/i);
    const ungranted = await httpframepipeline({
      config,
      tokens: fixture.tokens,
      rawtoken: fixture.raw,
      allowlist: fixture.allowlist,
      fingerprint: "fp-1",
      toolname: "memory.list",
      now,
    });
    expect(ungranted.error?.code).toBe("consentrefused");
    expect(ungranted.error?.message).toMatch(/grants no memory tools/i);
    const clean = await httpframepipeline({
      config,
      tokens: fixture.tokens,
      rawtoken: fixture.raw,
      allowlist: fixture.allowlist,
      fingerprint: "fp-1",
      toolname: "browser.readtext",
      now,
    });
    expect(clean.error).toBeUndefined();
    expect(clean.token?.clientid).toBe("client1");
  });
});
