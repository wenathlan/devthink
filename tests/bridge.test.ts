import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { bridgepayload, chateventpayload, composeenvelope, contractcapabilities, envelopeacceptance, eventpostbody, eventstreambody, frameof, heartbeatevent, minimalplandigest, negotiatecapabilities, parseenvelope, parsewireframe, planproposaleventpayload, planrevieweventpayload, progresseventpayload, servercontractversion, sessioncreatebody, sessionjoinbody, stableopid } from "../bridge.js";
import { bridgeframerate, bridgestatusview, connectrelay, disconnectrelay, enqueuebridge, heartbeattick, idleexpired, newrelayclient, postevent, receiveframe, relayorigin, replaybridgequeue, verifyframeauth, type relayclientstate, type relaysocket, type socketopen } from "../bridge.js";
import { exchangebridgepairing, livetokensof, mintbridgepairing, pairingcountdown, revokeallsessions, rotatebridgetoken, tokenscopedkey, verifybridgetoken } from "../auth.js";
import { bridgestatuslabel, carddecision, chatrowsof, decisionpayload, reviewcardsof, reviewgateoutcome, sitemanifest, widgetview, pairingpanel, chateventof, planproposaleventof } from "../bridge.js";
import { bridgechoices, bridgeconsentgate, bridgecontentgate, bridgeframeorigingate, bridgeheartbeatvalid, bridgeidlewindowvalid, bridgekillswitchgate, bridgemembergate, bridgepairingwindowvalid, bridgeratecapvalid, serverurlgate } from "../policy.js";
import { bridgepayloadreport } from "../protocol.js";
import type { agentplan, auditkind, bridgeeventrecord, bridgequeuerecord, bridgereviewcard } from "../types.js";
import { starttestrelay } from "./testrelay.mjs";

const now = 1_800_000_000_000;
const capabilities = contractcapabilities();

/** Builds one fake relay socket that answers every frame with the reply body the fixture names, so the connect flow reads a scripted handshake. */
function replyingsocket(reply: (envelope: Record<string, unknown>) => Record<string, unknown>): relaysocket {
  const socket: relaysocket = {
    send: frame => {
      const envelope = JSON.parse(frame) as Record<string, unknown>;
      setTimeout(() => socket.onmessage?.(JSON.stringify({ version: 1, op: envelope.op, opid: envelope.opid, sessionid: "session-e2e", token: "tok-e2e", at: 1, body: reply(envelope) })), 0);
    },
    close: () => { /* the fake close needs no wire */ },
  };
  return socket;
}

describe("servercontract envelope accept and reject per operation", () => {
  it("accepts the four operation bodies and rejects every schema failure with the field that named it", () => {
    expect(servercontractversion).toBe(1);
    const create = composeenvelope({ op: "sessioncreate", opid: stableopid("ext", 1), at: now, body: sessioncreatebody({ role: "extension", memberid: "ext", capabilities, pairingcode: "DT-TESTCODE" }) });
    expect(parseenvelope(create).op).toBe("sessioncreate");
    expect(parseenvelope(create).body?.pairingcode).toBe("DT-TESTCODE");
    const join = composeenvelope({ op: "sessionjoin", opid: stableopid("site", 1), at: now, sessionid: "session-e2e", token: "tok-e2e", body: sessionjoinbody({ sessionid: "session-e2e", role: "site", memberid: "site", capabilities, pairingcode: "DT-TESTCODE" }) });
    expect(parseenvelope(join).sessionid).toBe("session-e2e");
    expect(parseenvelope(join).token).toBe("tok-e2e");
    const post = composeenvelope({ op: "eventpost", opid: stableopid("site", 2), at: now, sessionid: "session-e2e", token: "tok-e2e", body: eventpostbody({ event: chateventof("collect the pricing table", "site reviewer") }) });
    expect(parseenvelope(post).body?.kind).toBe("chat");
    const stream = composeenvelope({ op: "eventstream", opid: stableopid("site", 3), at: now, sessionid: "session-e2e", token: "tok-e2e", body: eventstreambody({ streams: ["chat", "review"], since: now - 1000 }) });
    expect(parseenvelope(stream).body?.streams).toEqual(["chat", "review"]);
    for (const bad of [
      { version: 0, op: "eventpost", opid: "op-x-1", at: now },
      { version: 1, op: "nosuchop", opid: "op-x-1", at: now },
      { version: 1, op: "eventpost", opid: "  ", at: now },
      { version: 1, op: "eventpost", opid: "op-x-1", at: Number.NaN },
      { version: 1, op: "eventpost", opid: "op-x-1", at: now, sessionid: " " },
      { version: 1, op: "eventpost", opid: "op-x-1", at: now, token: " " },
      { version: 1, op: "eventpost", opid: "op-x-1", at: now, body: ["not", "an", "object"] },
      "not-an-object",
      null,
    ]) {
      const verdict = envelopeacceptance(bad);
      expect(verdict.ok).toBe(false);
      expect(verdict.reason ?? "").not.toBe("");
    }
    expect(() => parseenvelope(undefined)).toThrow(/must be a json object/);
    expect(envelopeacceptance(post).ok).toBe(true);
    expect(parsewireframe(frameof(post)).opid).toBe(post.opid);
    expect(() => parsewireframe("not json")).toThrow(/json text/);
    expect(() => stableopid("  ", 1)).toThrow(/names its sender seed/);
    expect(() => stableopid("ext", 0)).toThrow(/positive whole number/);
    expect(() => sessioncreatebody({ role: "extension", memberid: " ", capabilities })).toThrow(/names its member id/);
    expect(() => sessionjoinbody({ role: "site", memberid: "site", capabilities })).toThrow(/names its session id or rides its pairing code/);
    expect(() => eventpostbody({ event: { kind: "nosuchkind" as "chat", stream: "chat", payload: {} } })).toThrow(/outside the servercontract event types/);
    expect(() => eventpostbody({ event: { kind: "chat", stream: " ", payload: {} } })).toThrow(/names its multiplexed stream/);
    expect(() => eventstreambody({ streams: [] })).toThrow(/at least one multiplexed stream/);
  });
});

describe("servercontract capability negotiation and event payloads", () => {
  it("negotiates the shared version with the intersected operations and events while refusing empty intersections", () => {
    const negotiation = negotiatecapabilities(capabilities, { version: 1, operations: ["sessionjoin", "eventpost"], events: ["chat", "planreview"], heartbeat: true, multiplex: true });
    expect(negotiation.ok).toBe(true);
    expect(negotiation.version).toBe(1);
    expect(negotiation.operations).toEqual(["sessionjoin", "eventpost"]);
    expect(negotiation.events).toEqual(["chat", "planreview"]);
    expect(negotiation.heartbeat).toBe(true);
    expect(negotiation.multiplex).toBe(true);
    expect(negotiatecapabilities(capabilities, { version: 1, operations: [], events: ["chat"] }).ok).toBe(false);
    expect(negotiatecapabilities(capabilities, { version: 1, operations: ["eventpost"], events: [] }).ok).toBe(false);
    expect(negotiatecapabilities(capabilities, { version: 0, operations: ["eventpost"], events: ["chat"] }).ok).toBe(false);
    expect(negotiatecapabilities({ ...capabilities, heartbeat: false }, { version: 1, operations: ["eventpost"], events: ["chat"], heartbeat: true }).heartbeat).toBe(false);
    const chat = chateventpayload({ text: "  collect the pricing table  ", from: "site reviewer" });
    expect(chat).toEqual({ text: "collect the pricing table", from: "site reviewer" });
    expect(() => chateventpayload({ text: " ", from: "site" })).toThrow(/carries its task text/);
    const card: bridgereviewcard = { proposalid: "plan-1", title: "Collect the pricing table", steps: [{ id: "s1", kind: "readtext", origin: "https://shop.example", sensitive: false }, { id: "s2", kind: "submitticket", origin: "https://shop.example", sensitive: true }], at: now };
    const proposal = planproposaleventpayload(card);
    expect(proposal.steps).toEqual(card.steps);
    expect(() => planproposaleventpayload({ ...card, title: " " })).toThrow(/names its plan title/);
    const review = planrevieweventpayload({ proposalid: "plan-1", decision: "changes", by: "site reviewer", note: "skip the checkout", at: now });
    expect(review.decision).toBe("changes");
    expect(() => planrevieweventpayload({ proposalid: "plan-1", decision: "later" as "approved", by: "site", at: now })).toThrow(/approved, changes or refused/);
    expect(progresseventpayload({ stepid: "s1", status: "done" })).toEqual({ stepid: "s1", status: "done" });
    expect(heartbeatevent(now)).toEqual({ kind: "progress", stream: "heartbeat", payload: { stepid: "heartbeat", status: "alive" } });
    const plan: agentplan = { id: "plan-1", objective: "Collect the pricing table", origin: "https://shop.example", steps: [{ id: "s1", kind: "readtext", target: "main", state: "pending" } as never, { id: "s2", kind: "readforms", target: "form", state: "pending" } as never], createdat: now, expiresat: now + 60000, state: "approved" };
    const digest = minimalplandigest(plan, { s1: "done" });
    expect(digest.title).toBe("Collect the pricing table");
    expect(digest.steps).toEqual([{ id: "s1", kind: "readtext", status: "done" }, { id: "s2", kind: "readforms", status: "pending" }]);
    expect(sitemanifest().servercontract).toBe(1);
    expect(sitemanifest().capabilities.operations).toContain("eventstream");
  });
});

describe("socketrelay connect, reconnect and backoff", () => {
  it("connects through the seam, retries the failed opens with the exponential backoff waits and rotates the token on every retry", async () => {
    let failures = 2;
    let rotations = 0;
    const sleeps: number[] = [];
    const open: socketopen = url => {
      void url;
      failures -= 1;
      if (failures >= 0) return Promise.reject(new Error("connection refused"));
      return Promise.resolve(replyingsocket(() => ({ sessionid: "session-e2e", token: "tok-e2e", capabilities })));
    };
    const state = newrelayclient({ url: "wss://relay.example", memberid: "ext", role: "extension", capabilities, now });
    const connected = await connectrelay({ state, open, attempts: 3, backoffbase: 100, backoffceiling: 400, sleep: async ms => { sleeps.push(ms); }, rotate: async () => { rotations += 1; return "tok-rotated"; }, now: () => now });
    expect(connected.error).toBeUndefined();
    expect(connected.state.state).toBe("connected");
    expect(connected.state.sessionid).toBe("session-e2e");
    expect(connected.state.token).toBe("tok-e2e");
    expect(connected.state.attempts).toBe(2);
    expect(rotations).toBe(2);
    expect(sleeps).toEqual([100, 200]);
    const refused = await connectrelay({ state: newrelayclient({ url: "wss://relay.example", memberid: "ext", role: "extension", capabilities, now }), open: () => Promise.reject(new Error("connection refused")), attempts: 3, backoffbase: 10, sleep: async () => { /* the fake sleep waits nothing */ }, now: () => now });
    expect(refused.socket).toBeUndefined();
    expect(refused.error).toContain("connection refused");
    expect(refused.state.state).toBe("closed");
    const disabled = await connectrelay({ state: newrelayclient({ url: "", memberid: "ext", role: "extension", capabilities, now }), open, now: () => now });
    expect(disabled.state.state).toBe("idle");
    expect(disabled.error).toContain("no relay url is configured");
    expect(relayorigin("wss://relay.example:8443/path")).toBe("https://relay.example:8443");
    expect(relayorigin("ws://127.0.0.1:8080")).toBe("http://127.0.0.1:8080");
    expect(relayorigin("https://relay.example")).toBe("");
    expect(() => newrelayclient({ url: "https://relay.example", memberid: "ext", role: "extension", capabilities, now })).toThrow(/wss or ws url/);
    expect(() => newrelayclient({ url: "wss://relay.example", memberid: " ", role: "extension", capabilities, now })).toThrow(/names its member id/);
  });
});

describe("socketrelay frame authentication, multiplexing and rate caps", () => {
  it("verifies the session token on every frame, routes the streams and caps the frames of one window", () => {
    const state = newrelayclient({ url: "wss://relay.example", memberid: "ext", role: "extension", capabilities, sessionid: "session-e2e", token: "tok-e2e", now });
    expect(verifyframeauth({ version: 1, op: "eventpost", opid: "op-site-1", sessionid: "session-e2e", token: "tok-e2e", at: now }, state)).toBe(true);
    expect(verifyframeauth({ version: 1, op: "eventpost", opid: "op-site-1", sessionid: "session-other", token: "tok-e2e", at: now }, state)).toBe(false);
    expect(verifyframeauth({ version: 1, op: "eventpost", opid: "op-site-1", sessionid: "session-e2e", token: "tok-wrong", at: now }, state)).toBe(false);
    const connected: relayclientstate = { ...state, state: "connected" };
    const chatframe = frameof({ version: 1, op: "eventpost", opid: "op-site-1", sessionid: "session-e2e", token: "tok-e2e", at: now, body: eventpostbody({ event: chateventof("collect the pricing table", "site reviewer") }) });
    const received = receiveframe(connected, chatframe, now);
    expect(received.rejection).toBeUndefined();
    expect(received.state.streams.chat?.length).toBe(1);
    expect(received.state.streams.chat?.[0]?.payload.text).toBe("collect the pricing table");
    expect(received.state.acks.length).toBe(1);
    const progressframe = frameof({ version: 1, op: "eventpost", opid: "op-site-2", sessionid: "session-e2e", token: "tok-e2e", at: now, body: eventpostbody({ event: heartbeatevent(now) }) });
    const routed = receiveframe(received.state, progressframe, now);
    expect(routed.state.streams.heartbeat?.length).toBe(1);
    expect(receiveframe(routed.state, "not json", now).rejection).toContain("json text");
    const forged = frameof({ version: 1, op: "eventpost", opid: "op-site-3", sessionid: "session-e2e", token: "tok-wrong", at: now, body: eventpostbody({ event: chateventof("hello", "site") }) });
    expect(receiveframe(routed.state, forged, now).rejection).toContain("failed the frame authentication");
    const rates = bridgeframerate({ rate: { used: 0, windowstartedat: now }, cap: 2, window: 1000, now });
    expect(rates.allowed).toBe(true);
    expect(bridgeframerate({ rate: { used: 1, windowstartedat: now }, cap: 2, window: 1000, now: now + 500 }).allowed).toBe(true);
    const capped = bridgeframerate({ rate: { used: 2, windowstartedat: now }, cap: 2, window: 1000, now: now + 500 });
    expect(capped.allowed).toBe(false);
    expect(capped.resetsat).toBe(now + 1000);
    expect(bridgeframerate({ rate: { used: 5, windowstartedat: now }, cap: 2, window: 1000, now: now + 1000 }).allowed).toBe(true);
    expect(bridgeframerate({ rate: { used: 5, windowstartedat: now }, now: now + 1 }).allowed).toBe(true);
  });
});

describe("sharedauth pairing, rotation and revocation", () => {
  it("mints the code with the countdown, exchanges it once per origin, rotates on reconnect and revokes all sessions with one click", async () => {
    const origin = "https://relay.example";
    const minted = mintbridgepairing({ origin, now, lifetime: 120000 });
    expect(minted.code.code).toMatch(/^DT-/);
    expect(minted.code.scopes).toEqual(["browser"]);
    expect(pairingcountdown(minted, now + 30000).label).toContain("1m 30s");
    const expired = mintbridgepairing({ origin, now: now - 300000, lifetime: 60000 });
    expect(pairingcountdown(expired, now).expired).toBe(true);
    expect(pairingcountdown({ ...minted, code: { ...minted.code, usedat: now } }, now).expired).toBe(true);
    expect(() => mintbridgepairing({ origin: " ", now })).toThrow(/names its relay origin/);
    const wrongorigin = await exchangebridgepairing({ records: [minted], origin: "https://other.example", code: minted.code.code, sessionid: "session-e2e", now });
    expect(wrongorigin.reason).toContain("No pending pairing code");
    const late = await exchangebridgepairing({ records: [minted], origin, code: minted.code.code, sessionid: "session-e2e", now: now + 130000 });
    expect(late.reason).toContain("expired");
    const exchange = await exchangebridgepairing({ records: [minted], origin, code: minted.code.code, sessionid: "session-e2e", now });
    expect(exchange.raw).toBeDefined();
    expect(exchange.record?.hash.startsWith("sha256:")).toBe(true);
    expect(exchange.record?.sessionid).toBe("session-e2e");
    const reused = await exchangebridgepairing({ records: [{ ...minted, code: exchange.used ?? minted.code }], origin, code: minted.code.code, sessionid: "session-e2e", now: now + 1000 });
    expect(reused.reason).toContain("already used");
    const tokens = [exchange.record!];
    const verified = await verifybridgetoken({ tokens, origin, sessionid: "session-e2e", raw: exchange.raw!, now });
    expect(verified.ok).toBe(true);
    expect((await verifybridgetoken({ tokens, origin: "https://other.example", sessionid: "session-e2e", raw: exchange.raw!, now })).ok).toBe(false);
    expect((await verifybridgetoken({ tokens, origin, sessionid: "session-other", raw: exchange.raw!, now })).ok).toBe(false);
    const rotation = await rotatebridgetoken({ tokens, sessionid: "session-e2e", origin, now: now + 5000 });
    expect(rotation.record.rotatedfrom).toBe(exchange.record!.id);
    expect(rotation.tokens.find(token => token.id === exchange.record!.id)?.revokedat).toBe(now + 5000);
    expect((await verifybridgetoken({ tokens: rotation.tokens, origin, sessionid: "session-e2e", raw: exchange.raw!, now: now + 5000 })).ok).toBe(false);
    expect((await verifybridgetoken({ tokens: rotation.tokens, origin, sessionid: "session-e2e", raw: rotation.raw, now: now + 5000 })).ok).toBe(true);
    const revoked = revokeallsessions(rotation.tokens, now + 10000);
    expect(revoked.every(token => token.revokedat !== undefined)).toBe(true);
    expect(livetokensof(revoked, origin, now + 10000).length).toBe(0);
    expect(livetokensof(rotation.tokens, origin, now + 5000).length).toBe(1);
    expect(tokenscopedkey(origin)).toBe("bridgetokens:https://relay.example");
    expect(() => tokenscopedkey(" ")).toThrow(/names its relay origin/);
  });
});

describe("bridge consent gate, kill switch, member shape and url validation", () => {
  it("blocks the first connection without the recorded consent, refuses every operation under the engaged kill switch and validates the serverurl shape", () => {
    expect(bridgeconsentgate({ connected: false }).allowed).toBe(false);
    expect(bridgeconsentgate({ consent: false, connected: false }).allowed).toBe(false);
    expect(bridgeconsentgate({ consent: true, connected: false }).allowed).toBe(true);
    expect(bridgeconsentgate({ consent: false, connected: true }).allowed).toBe(true);
    expect(bridgekillswitchgate({ engaged: true, operation: "pairing code mint" }).allowed).toBe(false);
    expect(bridgekillswitchgate({ engaged: false, operation: "pairing code mint" }).allowed).toBe(true);
    expect(bridgemembergate({ extension: 1, site: 1 }).allowed).toBe(true);
    expect(bridgemembergate({ extension: 1, site: 0 }).allowed).toBe(true);
    expect(bridgemembergate({ extension: 2, site: 1 }).allowed).toBe(false);
    expect(bridgemembergate({ extension: 1, site: 2 }).allowed).toBe(false);
    expect(serverurlgate("").allowed).toBe(true);
    expect(serverurlgate("wss://relay.example").allowed).toBe(true);
    expect(serverurlgate("wss://relay.example:8443/bridge").allowed).toBe(true);
    expect(serverurlgate("ws://127.0.0.1:8080").allowed).toBe(true);
    expect(serverurlgate("ws://relay.example").allowed).toBe(false);
    expect(serverurlgate("https://relay.example").allowed).toBe(false);
    expect(serverurlgate("wss://relay.example:notaport").allowed).toBe(false);
    expect(serverurlgate("not a url").allowed).toBe(false);
    expect(bridgepairingwindowvalid(0).allowed).toBe(false);
    expect(bridgepairingwindowvalid(300000).allowed).toBe(true);
    expect(bridgeidlewindowvalid(-1).allowed).toBe(false);
    expect(bridgeidlewindowvalid(60000).allowed).toBe(true);
    expect(bridgeheartbeatvalid(0).allowed).toBe(false);
    expect(bridgeheartbeatvalid(30000).allowed).toBe(true);
    expect(bridgeratecapvalid(0, 1000).allowed).toBe(false);
    expect(bridgeratecapvalid(10, 0).allowed).toBe(false);
    expect(bridgeratecapvalid(10, 1000).allowed).toBe(true);
    expect(bridgechoices({ serverurl: "wss://relay.example", bridgeratelimit: 10, bridgeratewindow: 1000 })).toEqual({ serverurl: "wss://relay.example", bridgeratelimit: 10, bridgeratewindow: 1000 });
    expect(bridgechoices(undefined)).toEqual({});
  });
});

describe("bridge origin checks reject unpaired senders", () => {
  it("refuses frames of foreign sessions, anonymous senders and unpaired origins while the paired frame passes", () => {
    const origin = "https://relay.example";
    expect(bridgeframeorigingate({ framesession: "session-e2e", sessionid: "session-e2e", origin, paired: true }).allowed).toBe(true);
    expect(bridgeframeorigingate({ framesession: "session-other", sessionid: "session-e2e", origin, paired: true }).allowed).toBe(false);
    expect(bridgeframeorigingate({ sessionid: "session-e2e", origin, paired: false }).allowed).toBe(false);
    expect(bridgeframeorigingate({ framesender: " ", sessionid: "session-e2e", origin, paired: true }).allowed).toBe(false);
    expect(bridgeframeorigingate({ framesender: "site member", sessionid: "session-e2e", origin, paired: true }).allowed).toBe(true);
  });
});

describe("bridge data minimization keeps page content off the wire", () => {
  it("holds the page content keys without the explicit consent flag, keeps the chat task text and records the bridge audit kind", () => {
    const chatpass = bridgepayload("chat", { text: "collect the pricing table", from: "site" });
    expect(chatpass.payload.text).toBe("collect the pricing table");
    expect(chatpass.held).toEqual([]);
    const proposal = bridgepayload("planproposal", { proposalid: "plan-1", title: "Collect the pricing table", steps: [], html: "<main>the whole page</main>", pagetext: "captured text", status: "pending" });
    expect(proposal.held.sort()).toEqual(["html", "pagetext"]);
    expect(Object.keys(proposal.payload).includes("html")).toBe(false);
    const consented = bridgepayload("planproposal", { html: "<main>the whole page</main>" }, true);
    expect(consented.held).toEqual([]);
    expect(consented.payload.html).toBe("<main>the whole page</main>");
    const progress = bridgepayload("progress", { stepid: "s1", status: "done", dom: "the dom snapshot" });
    expect(progress.held).toEqual(["dom"]);
    expect(bridgecontentgate({ payload: { html: "x" } }).allowed).toBe(false);
    expect(bridgecontentgate({ payload: { html: "x" }, pageconsent: true }).allowed).toBe(true);
    expect(bridgecontentgate({ payload: { stepid: "s1", status: "done" } }).allowed).toBe(true);
    const report = bridgepayloadreport({ kind: "progress", payload: { stepid: "s1", status: "done" } });
    expect(report.held).toEqual([]);
    expect(report.version).toBe(servercontractversion);
    expect(() => bridgepayloadreport({ kind: "progress", payload: { stepid: "s1", status: "done", screenshot: "data:image/png;base64,bytes" } })).toThrow(/page content never crosses the bridge/);
    const kinds: auditkind[] = ["bridge", "syncbridge", "socket"];
    expect(kinds).toContain("bridge");
  });
});

describe("bridge offline queue buffering and replay deduplication", () => {
  it("buffers the frames while the socket is down, deduplicates the operation ids and replays each frame exactly once", () => {
    const down = newrelayclient({ url: "wss://relay.example", memberid: "ext", role: "extension", capabilities, sessionid: "session-e2e", token: "tok-e2e", now });
    const first = postevent(down, undefined, chateventof("collect the pricing table", "site reviewer"), now);
    expect(first.sent).toBe(false);
    expect(first.queued).toBe(true);
    expect(first.state.queue.length).toBe(1);
    const duplicate = enqueuebridge(first.state, { op: "eventpost", opid: first.state.queue[0]!.opid, body: {}, now });
    expect(duplicate.queue.length).toBe(1);
    const second = postevent(duplicate, undefined, planproposaleventof({ proposalid: "plan-1", title: "Collect", steps: [{ id: "s1", kind: "readtext", origin: "https://shop.example", sensitive: false }], at: now }), now + 1);
    expect(second.state.queue.length).toBe(2);
    expect(second.state.queue.filter(record => record.sentat === undefined).length).toBe(2);
    const sent: string[] = [];
    const socket: relaysocket = { send: frame => sent.push(frame), close: () => { /* the fake close needs no wire */ } };
    const reconnected: relayclientstate = { ...second.state, state: "connected" };
    const replay = replaybridgequeue(reconnected, socket, now + 2);
    expect(replay.replayed).toBe(2);
    expect(replay.deduped).toBe(0);
    expect(replay.state.queue.every(record => record.sentat === now + 2)).toBe(true);
    expect(sent.length).toBe(2);
    const again = replaybridgequeue(replay.state, socket, now + 3);
    expect(again.replayed).toBe(0);
    expect(sent.length).toBe(2);
    const { sentat: used, ...unsent } = reconnected.queue[0]!;
    void used;
    const duplicated: relayclientstate = { ...replay.state, queue: [...replay.state.queue, { ...unsent, attempts: 0 }] };
    const deduped = replaybridgequeue(duplicated, socket, now + 4);
    expect(deduped.replayed).toBe(0);
    expect(deduped.deduped).toBe(1);
    const closed = disconnectrelay(reconnected, now + 5, "The relay session expired.");
    expect(closed.state).toBe("closed");
    expect(closed.closedat).toBe(now + 5);
  });
});

describe("bridge heartbeat and idle expiry lifecycle", () => {
  it("sends the heartbeat frame on the user interval and expires the quiet session inside the idle window", () => {
    const sent: string[] = [];
    const socket: relaysocket = { send: frame => sent.push(frame), close: () => { /* the fake close needs no wire */ } };
    const state: relayclientstate = { ...newrelayclient({ url: "wss://relay.example", memberid: "ext", role: "extension", capabilities, sessionid: "session-e2e", token: "tok-e2e", now }), state: "connected" };
    expect(heartbeattick(state, socket, now + 999, 1000).beat).toBe(false);
    const beat = heartbeattick(state, socket, now + 1000, 1000);
    expect(beat.beat).toBe(true);
    expect(sent.length).toBe(1);
    expect(JSON.parse(sent[0]!).body.stream).toBe("heartbeat");
    expect(beat.state.lastheartbeatat).toBe(now + 1000);
    expect(heartbeattick(state, undefined, now + 2000, 1000).beat).toBe(false);
    expect(heartbeattick(state, socket, now + 2000).beat).toBe(false);
    expect(idleexpired(state, now + 29999, 30000)).toBe(false);
    expect(idleexpired(state, now + 30000, 30000)).toBe(true);
    expect(idleexpired(state, now + 999999)).toBe(false);
    const active = receiveframe(state, frameof({ version: 1, op: "eventpost", opid: "op-site-9", sessionid: "session-e2e", token: "tok-e2e", at: now + 20000, body: eventpostbody({ event: chateventof("still here", "site") }) }), now + 20000);
    expect(idleexpired(active.state, now + 49999, 30000)).toBe(false);
  });
});

describe("chatbridge widget render and review decisions never execute", () => {
  it("renders the chat rows and review cards, collects the decisions and maps them onto the review gate without executing anything", () => {
    const events: bridgeeventrecord[] = [
      { id: "op-site-1", sessionid: "session-e2e", kind: "chat", opid: "op-site-1", stream: "chat", payload: { text: "collect the pricing table", from: "site reviewer" }, at: now, delivered: true },
      { id: "op-ext-1", sessionid: "session-e2e", kind: "chat", opid: "op-ext-1", stream: "chat", payload: { text: "the plan proposes two steps", from: "extension" }, at: now + 1, delivered: true },
      { id: "op-ext-2", sessionid: "session-e2e", kind: "planproposal", opid: "op-ext-2", stream: "review", payload: { proposalid: "plan-1", title: "Collect the pricing table", steps: [{ id: "s1", kind: "readtext", origin: "https://shop.example", sensitive: false }, { id: "s2", kind: "submitticket", origin: "https://shop.example", sensitive: true }] }, at: now + 2, delivered: true },
      { id: "op-site-2", sessionid: "session-e2e", kind: "planreview", opid: "op-site-2", stream: "review", payload: { proposalid: "plan-1", decision: "approved", by: "site reviewer" }, at: now + 3, delivered: true },
      { id: "op-ext-3", sessionid: "session-e2e", kind: "progress", opid: "op-ext-3", stream: "progress", payload: { stepid: "s1", status: "done" }, at: now + 4, delivered: true },
    ];
    const rows = chatrowsof(events, "extension");
    expect(rows.length).toBe(2);
    expect(rows[0]?.mine).toBe(false);
    expect(rows[1]?.mine).toBe(true);
    const cards = reviewcardsof(events);
    expect(cards.length).toBe(1);
    expect(cards[0]?.steps[1]?.sensitive).toBe(true);
    const view = widgetview({ status: "connected", events, memberid: "extension" });
    expect(view.rows.length).toBe(2);
    expect(view.cards.length).toBe(1);
    expect(view.pending).toBe(0);
    const openview = widgetview({ status: "connected", events: events.slice(0, 3), memberid: "extension" });
    expect(openview.pending).toBe(1);
    const decision = carddecision(cards[0]!, "changes", "site reviewer", now + 5, "skip the checkout step");
    expect(decision.proposalid).toBe("plan-1");
    expect(() => carddecision({ ...cards[0]!, proposalid: " " }, "approved", "site", now)).toThrow(/names its proposal/);
    expect(() => carddecision(cards[0]!, "later" as "approved", "site", now)).toThrow(/approved, changes or refused/);
    expect(decisionpayload(decision).decision).toBe("changes");
    const approved = reviewgateoutcome({ proposalid: "plan-1", decision: "approved", by: "site reviewer", at: now });
    expect(approved.state).toBe("approved");
    expect(approved.reason).toContain("the extension stays the only executor");
    expect(reviewgateoutcome(decision).state).toBe("refused");
    expect(reviewgateoutcome(decision).reason).toContain("no step executes");
    const pairing = pairingpanel(mintbridgepairing({ origin: "https://relay.example", now, lifetime: 120000 }), now + 30000);
    expect(pairing.code).toMatch(/^DT-/);
    expect(pairing.label).toContain("1m 30s");
    expect(sitemanifest().name).toBe("devthink site");
  });
});

describe("popup bridge states", () => {
  it("reads the connected, paired, offline and disabled states with the queued frame count", () => {
    const base = newrelayclient({ url: "wss://relay.example", memberid: "ext", role: "extension", capabilities, sessionid: "session-e2e", token: "tok-e2e", now });
    expect(bridgestatusview({ ...base, state: "connected" }).status).toBe("connected");
    expect(bridgestatusview({ ...base, state: "reconnecting" }).status).toBe("paired");
    expect(bridgestatuslabel(bridgestatusview({ ...base, state: "reconnecting" }))).toContain("paired, socket offline");
    expect(bridgestatuslabel(bridgestatusview({ ...base, state: "connected" }))).toContain("connected and paired");
    const offline = newrelayclient({ url: "wss://relay.example", memberid: "ext", role: "extension", capabilities, now });
    expect(bridgestatusview({ ...offline, state: "connecting" }).status).toBe("offline");
    expect(bridgestatuslabel(bridgestatusview({ ...offline, state: "connecting" }))).toBe("Bridge: offline.");
    const disabled = newrelayclient({ url: "", memberid: "ext", role: "extension", capabilities, now });
    expect(bridgestatusview(disabled).status).toBe("disabled");
    expect(bridgestatuslabel(bridgestatusview(disabled))).toContain("no relay url set");
    const queued = postevent(offline, undefined, chateventof("collect the pricing table", "site reviewer"), now);
    expect(bridgestatusview(queued.state).queued).toBe(1);
    expect(bridgestatuslabel(bridgestatusview(queued.state))).toContain("1 queued frame");
  });
});

describe("static site scan refuses serverless functions", () => {
  it("asserts the site ships static file types only and no function directory exists anywhere in the repository", () => {
    const root = process.cwd();
    const sitedir = join(root, "web");
    /* the merged site tree: the devthink web application, the extension platform folder and the gateway console folder all ship static source types the build compiles — the type ceiling refuses every executable or binary a serverless platform would need (the web tree stays zero js: the compiled artifacts live in the build output, never in the sources) */
    const statictypes = new Set(["ts", "tsx", "css", "html", "json", "toml", "yaml", "yml", "md", "gitkeep", "prisma"]);
    const sitefiles: string[] = [];
    const walksites = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        if (entry === "node_modules" || entry === "dist") continue; /* the installed toolchain and the build output never ship with the site sources */
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) { walksites(path); continue; }
        sitefiles.push(path);
      }
    };
    walksites(sitedir);
    expect(sitefiles.length).toBeGreaterThan(0);
    for (const file of sitefiles) {
      const type = file.slice(file.lastIndexOf(".") + 1).toLowerCase();
      expect(statictypes.has(type), `${file} ships the non static file type ${type}`).toBe(true);
    }
    const functionnames = new Set(["api", "functions", "serverless", "netlify", "vercel", "edge", ".serverless", ".netlify", ".vercel"]);
    const functionfiles = new Set(["serverless.yml", "serverless.yaml", "_worker.js", "_routes.json"]);
    const skip = new Set(["node_modules", ".git", "dist", "web"]);
    const found: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        const stats = statSync(path);
        if (stats.isDirectory()) {
          if (skip.has(entry)) continue;
          if (functionnames.has(entry.toLowerCase())) found.push(path);
          walk(path);
        } else if (functionfiles.has(entry.toLowerCase())) found.push(path);
      }
    };
    walk(root);
    expect(found).toEqual([]);
  });
});

describe("hardcoded relay url scan of the source tree", () => {
  it("asserts no wss or ws endpoint literal and no url at all inside the four bridge modules", () => {
    const root = process.cwd();
    const bridgefiles = ["bridge.ts", "auth.ts"].map(name => join(root, name));
    for (const path of bridgefiles) expect(readFileSync(path, "utf8").replaceAll('indexOf("://")', "").includes("://"), `${path} carries a url literal`).toBe(false);
    const codefiles = [
      ...readdirSync(root).filter(file => file.endsWith(".ts") && statSync(join(root, file)).isFile()).map(file => join(root, file)),
      ...readdirSync(sitedirOf(root)).filter(file => file.endsWith(".html") || file.endsWith(".js") || file.endsWith(".json")).map(file => join(sitedirOf(root), file)),
    ];
    for (const path of codefiles) {
      const content = readFileSync(path, "utf8");
      const scanned = content.replaceAll("wss://your-relay.example", "").replaceAll("ws://your-relay.example", "");
      expect(/wss?:\/\/[^\s"')<]/.test(scanned), `${path} carries a hardcoded ws or wss endpoint`).toBe(false);
    }
  });
});

function sitedirOf(root: string): string { return join(root, "web"); }

describe("chatbridge e2e against the testrelay on localhost", () => {
  it("pairs the site with the extension, runs the chat and plan review round trip, rotates the token on reconnect and refuses the reused pairing code", async () => {
    const relay = await starttestrelay({ idlewindow: 20000 });
    try {
      const open: socketopen = url => new Promise((resolve, reject) => {
        const websocket = new WebSocket(url);
        const socket: relaysocket = { send: frame => websocket.send(frame), close: code => websocket.close(code ?? 1000) };
        websocket.onopen = () => resolve(socket);
        websocket.onmessage = event => socket.onmessage?.(String((event as MessageEvent).data));
        websocket.onclose = event => socket.onclose?.((event as CloseEvent).code);
        websocket.onerror = () => reject(new Error("The relay socket failed to open."));
      });
      const extstate = newrelayclient({ url: relay.url, memberid: "ext", role: "extension", capabilities, now: Date.now() });
      const extensionconnected = await connectrelay({ state: extstate, open, pairingcode: relay.pairingcode, now: () => Date.now() });
      expect(extensionconnected.error).toBeUndefined();
      expect(extensionconnected.state.state).toBe("connected");
      expect(extensionconnected.state.sessionid).not.toBe("");
      const extsocket = extensionconnected.socket!;
      let extclient = extensionconnected.state;
      extsocket.onmessage = frame => { const received = receiveframe(extclient, frame, Date.now()); extclient = received.state; };
      const sitestate = newrelayclient({ url: relay.url, memberid: "site-reviewer", role: "site", capabilities, now: Date.now() });
      const siteconnected = await connectrelay({ state: sitestate, open, pairingcode: relay.pairingcode, now: () => Date.now() });
      expect(siteconnected.error).toBeUndefined();
      expect(siteconnected.state.sessionid).toBe(extensionconnected.state.sessionid);
      const sitesocket = siteconnected.socket!;
      let siteclient = siteconnected.state;
      sitesocket.onmessage = frame => { const received = receiveframe(siteclient, frame, Date.now()); siteclient = received.state; };
      const posted = postevent(siteclient, sitesocket, chateventof("collect the pricing table of this page", "site reviewer"), Date.now());
      expect(posted.sent).toBe(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      expect(extclient.streams.chat?.length).toBe(1);
      expect(extclient.streams.chat?.[0]?.payload.text).toBe("collect the pricing table of this page");
      const card: bridgereviewcard = { proposalid: "plan-e2e", title: "Collect the pricing table", steps: [{ id: "s1", kind: "readtext", origin: "https://shop.example", sensitive: false }, { id: "s2", kind: "submitticket", origin: "https://shop.example", sensitive: true }], at: Date.now() };
      const proposal = postevent(extclient, extsocket, planproposaleventof(card), Date.now());
      expect(proposal.sent).toBe(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      const siteevents = Object.values(siteclient.streams).flat();
      const cards = reviewcardsof(siteevents);
      expect(cards.length).toBe(1);
      expect(cards[0]?.proposalid).toBe("plan-e2e");
      expect(cards[0]?.steps.length).toBe(2);
      const decision = carddecision(cards[0]!, "changes", "site reviewer", Date.now(), "skip the sensitive step");
      const review = postevent(siteclient, sitesocket, { kind: "planreview", stream: "review", payload: decisionpayload(decision) }, Date.now());
      expect(review.sent).toBe(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      const extevents = Object.values(extclient.streams).flat();
      const decisions = extevents.filter(event => event.kind === "planreview");
      expect(decisions.length).toBe(1);
      const outcome = reviewgateoutcome(decision);
      expect(outcome.state).toBe("refused");
      expect(outcome.reason).toContain("no step executes");
      const rotatedtokenbefore = extclient.token;
      extsocket.close(1000);
      await new Promise(resolve => setTimeout(resolve, 300));
      const reconnected = await connectrelay({ state: { ...extclient, state: "reconnecting" }, open, now: () => Date.now() });
      expect(reconnected.error).toBeUndefined();
      expect(reconnected.state.state).toBe("connected");
      expect(reconnected.state.token).not.toBe(rotatedtokenbefore);
      expect(reconnected.state.rotations).toBeGreaterThan(extensionconnected.state.rotations);
      const replaystate = replaybridgequeue({ ...reconnected.state, queue: [{ opid: "op-ext-replay-1", op: "eventpost", sessionid: reconnected.state.sessionid, body: eventpostbody({ event: chateventof("queued while the socket was down", "extension") }), queuedat: Date.now(), attempts: 0 }] }, reconnected.socket!, Date.now());
      expect(replaystate.replayed).toBe(1);
      await new Promise(resolve => setTimeout(resolve, 300));
      const reused = await connectrelay({ state: newrelayclient({ url: relay.url, memberid: "late-site", role: "site", capabilities, now: Date.now() }), open, pairingcode: relay.pairingcode, now: () => Date.now() });
      expect(reused.error).toContain("pairing code");
      const session = relay.sessions()[0]!;
      expect(session.members.sort()).toEqual(["extension", "site"]);
      expect(session.events.filter(event => event.kind === "chat").length).toBe(2); /* the original round trip plus the replayed queued frame */
      expect(session.events.filter(event => event.kind === "planproposal").length).toBe(1);
      expect(session.events.filter(event => event.kind === "planreview").length).toBe(1);
      reconnected.socket?.close(1000);
      sitesocket.close(1000);
    } finally {
      await relay.close();
    }
  }, 20000);
});
