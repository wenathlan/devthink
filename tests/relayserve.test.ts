import { describe, expect, it } from "vitest";
import {
  composeenvelope,
  contractcapabilities,
  eventpostbody,
  eventstreambody,
  parsewireframe,
  sessioncreatebody,
  sessionjoinbody,
  stableopid,
} from "../bridge.js";
import {
  newrelayserverstate,
  relayconnectionclose,
  relayconnectionopen,
  relayframeof,
  relayidleconnections,
  relaylivetokens,
  relaypendingpairings,
  relayserverframe,
} from "../http.js";
import type { relayserversession } from "../types.js";

const now = 1_000_000;
const capabilities = contractcapabilities();

/** Opens a relay state with the named connections registered. */
function statewith(...connectionids: string[]) {
  let state = newrelayserverstate();
  for (const connectionid of connectionids) state = relayconnectionopen(state, connectionid, now);
  return state;
}

/** Sends one frame from one connection and returns the parsed replies. */
function send(input: {
  state: ReturnType<typeof newrelayserverstate>;
  connectionid: string;
  frame: string;
  now?: number;
}) {
  const outcome = relayserverframe({
    state: input.state,
    connectionid: input.connectionid,
    frame: input.frame,
    now: input.now ?? now,
  });
  return {
    state: outcome.state,
    replies: outcome.replies.map((reply) => parsewireframe(reply)),
    routed: outcome.routed,
  };
}

describe("relayserve", () => {
  it("opens a session for the extension member and issues its token and pairing code", () => {
    let state = statewith("conn-1", "conn-2");
    const create = composeenvelope({
      op: "sessioncreate",
      opid: stableopid("ext", 1),
      at: now,
      body: sessioncreatebody({ role: "extension", memberid: "ext", capabilities, pairingcode: "PAIR-CODE" }),
    });
    const outcome = send({ state, connectionid: "conn-1", frame: JSON.stringify(create) });
    state = outcome.state;
    const reply = outcome.replies[0];
    expect(reply?.op).toBe("sessioncreate");
    const body = reply?.body as { sessionid?: string; token?: string; members?: Array<{ role: string }> };
    expect(body.sessionid ?? "").not.toBe("");
    expect(body.token ?? "").not.toBe("");
    expect(body.members?.[0]?.role).toBe("extension");
    /* the pairing code stays pending until the site member redeems it */
    expect(relaypendingpairings(state, now)).toEqual(["PAIR-CODE"]);
    /* the raw token lives only in the memory-only issuance map; the session records carry the hash */
    const session = state.sessions[0];
    expect(session?.tokenhashes).toHaveLength(1);
    expect(session?.tokenhashes[0]).toBe(body.token);
    expect(state.tokens).toContainEqual({ connectionid: "conn-1", token: body.token });
  });

  it("refuses a sessioncreate frame that does not come from the extension member", () => {
    const state = statewith("conn-1");
    const create = composeenvelope({
      op: "sessioncreate",
      opid: stableopid("site", 1),
      at: now,
      body: sessioncreatebody({ role: "site", memberid: "site", capabilities }),
    });
    const outcome = send({ state, connectionid: "conn-1", frame: JSON.stringify(create) });
    expect(outcome.replies[0]?.body).toEqual({
      error: "The sessioncreate operation serves the extension member only.",
    });
    expect(outcome.state.sessions).toHaveLength(0);
  });

  it("redeems the pairing code for the site member and issues its own token", () => {
    let state = statewith("conn-1", "conn-2");
    const create = composeenvelope({
      op: "sessioncreate",
      opid: stableopid("ext", 1),
      at: now,
      body: sessioncreatebody({ role: "extension", memberid: "ext", capabilities, pairingcode: "PAIR-CODE" }),
    });
    const created = send({ state, connectionid: "conn-1", frame: JSON.stringify(create) });
    state = created.state;
    const sessionid = (created.replies[0]?.body as { sessionid?: string }).sessionid ?? "";
    const join = composeenvelope({
      op: "sessionjoin",
      opid: stableopid("site", 1),
      at: now,
      body: sessionjoinbody({ sessionid, role: "site", memberid: "site", capabilities, pairingcode: "PAIR-CODE" }),
    });
    const joined = send({ state, connectionid: "conn-2", frame: JSON.stringify(join) });
    state = joined.state;
    const body = joined.replies[0]?.body as { sessionid?: string; token?: string };
    expect(joined.replies[0]?.op).toBe("sessionjoin");
    expect(body.sessionid).toBe(sessionid);
    expect(body.token ?? "").not.toBe("");
    /* the pairing is spent and the session holds its site member */
    expect(relaypendingpairings(state, now)).toEqual([]);
    expect(state.sessions[0]?.site).toBe("conn-2");
    /* a second redemption of the same pairing refuses */
    const again = send({ state, connectionid: "conn-2", frame: JSON.stringify(join) });
    expect((again.replies[0]?.body as { error?: string }).error).toContain("matches no pending session");
  });

  it("routes an event post to the other member of the session and keeps the event log", () => {
    let state = statewith("conn-1", "conn-2");
    const create = composeenvelope({
      op: "sessioncreate",
      opid: stableopid("ext", 1),
      at: now,
      body: sessioncreatebody({ role: "extension", memberid: "ext", capabilities, pairingcode: "PAIR-CODE" }),
    });
    const created = send({ state, connectionid: "conn-1", frame: JSON.stringify(create) });
    state = created.state;
    const sessionid = (created.replies[0]?.body as { sessionid?: string }).sessionid ?? "";
    const extensiontoken = (created.replies[0]?.body as { token?: string }).token ?? "";
    const join = composeenvelope({
      op: "sessionjoin",
      opid: stableopid("site", 1),
      at: now,
      body: sessionjoinbody({ sessionid, role: "site", memberid: "site", capabilities, pairingcode: "PAIR-CODE" }),
    });
    const joined = send({ state, connectionid: "conn-2", frame: JSON.stringify(join) });
    state = joined.state;
    const post = composeenvelope({
      op: "eventpost",
      opid: stableopid("ext", 2),
      at: now,
      sessionid,
      token: extensiontoken,
      body: eventpostbody({
        event: { kind: "chat", stream: "chat", payload: { message: "collect the pricing table" } },
      }),
    });
    const outcome = send({ state, connectionid: "conn-1", frame: JSON.stringify(post) });
    /* the sender receives its ack and the site member receives the routed frame */
    expect(outcome.replies[0]?.body).toEqual({ accepted: true });
    expect(outcome.routed).toHaveLength(1);
    expect(outcome.routed[0]?.connectionid).toBe("conn-2");
    const routedframe = parsewireframe(outcome.routed[0]?.frame ?? "{}");
    expect(routedframe.op).toBe("eventpost");
    expect((routedframe.body as { kind?: string }).kind).toBe("chat");
    expect((routedframe.body as { payload?: { message?: string } }).payload?.message).toBe("collect the pricing table");
    expect(outcome.state.sessions[0]?.events).toHaveLength(1);
  });

  it("answers an event stream subscription with the ack over the subscribed streams", () => {
    let state = statewith("conn-1");
    const create = composeenvelope({
      op: "sessioncreate",
      opid: stableopid("ext", 1),
      at: now,
      body: sessioncreatebody({ role: "extension", memberid: "ext", capabilities }),
    });
    const created = send({ state, connectionid: "conn-1", frame: JSON.stringify(create) });
    state = created.state;
    const sessionid = (created.replies[0]?.body as { sessionid?: string }).sessionid ?? "";
    const token = (created.replies[0]?.body as { token?: string }).token ?? "";
    const stream = composeenvelope({
      op: "eventstream",
      opid: stableopid("ext", 2),
      at: now,
      sessionid,
      token,
      body: eventstreambody({ streams: ["chat", "review"], since: now - 500 }),
    });
    const outcome = send({ state, connectionid: "conn-1", frame: JSON.stringify(stream) });
    expect(outcome.replies[0]?.body).toEqual({ streams: ["chat", "review"], subscribed: true });
  });

  it("refuses every frame that fails the token authentication without touching the session state", () => {
    let state = statewith("conn-1", "conn-2");
    const create = composeenvelope({
      op: "sessioncreate",
      opid: stableopid("ext", 1),
      at: now,
      body: sessioncreatebody({ role: "extension", memberid: "ext", capabilities }),
    });
    const created = send({ state, connectionid: "conn-1", frame: JSON.stringify(create) });
    state = created.state;
    const sessionid = (created.replies[0]?.body as { sessionid?: string }).sessionid ?? "";
    const post = composeenvelope({
      op: "eventpost",
      opid: stableopid("ext", 2),
      at: now,
      sessionid,
      token: "forged-token",
      body: eventpostbody({ event: { kind: "chat", stream: "chat", payload: { message: "no" } } }),
    });
    const refused = send({ state, connectionid: "conn-1", frame: JSON.stringify(post) });
    expect((refused.replies[0]?.body as { error?: string }).error).toContain("token authentication");
    expect(refused.routed).toHaveLength(0);
    expect(refused.state.sessions[0]?.events).toHaveLength(0);
    /* an unknown session id answers the same refusal */
    const ghost = composeenvelope({
      op: "eventpost",
      opid: stableopid("ext", 3),
      at: now,
      sessionid: "session-ghost",
      token: "any",
      body: eventpostbody({ event: { kind: "chat", stream: "chat", payload: { message: "no" } } }),
    });
    const ghostoutcome = send({ state, connectionid: "conn-1", frame: JSON.stringify(ghost) });
    expect((ghostoutcome.replies[0]?.body as { error?: string }).error).toContain("token authentication");
  });

  it("rotates the token of a returning member and revokes the previous one", () => {
    let state = statewith("conn-1");
    const create = composeenvelope({
      op: "sessioncreate",
      opid: stableopid("ext", 1),
      at: now,
      body: sessioncreatebody({ role: "extension", memberid: "ext", capabilities }),
    });
    const created = send({ state, connectionid: "conn-1", frame: JSON.stringify(create) });
    state = created.state;
    const sessionid = (created.replies[0]?.body as { sessionid?: string }).sessionid ?? "";
    const firsttoken = (created.replies[0]?.body as { token?: string }).token ?? "";
    const rejoin = composeenvelope({
      op: "sessionjoin",
      opid: stableopid("ext", 2),
      at: now,
      sessionid,
      token: firsttoken,
      body: sessionjoinbody({ sessionid, role: "extension", memberid: "ext", capabilities }),
    });
    const rejoined = send({ state, connectionid: "conn-1", frame: JSON.stringify(rejoin) });
    state = rejoined.state;
    const secondtoken = (rejoined.replies[0]?.body as { token?: string; rotated?: boolean }).token ?? "";
    expect((rejoined.replies[0]?.body as { rotated?: boolean }).rotated).toBe(true);
    expect(secondtoken).not.toBe(firsttoken);
    /* the old token left the live set */
    const session: relayserversession = state.sessions[0] ?? {
      id: "missing",
      extension: undefined,
      site: undefined,
      events: [],
      tokenhashes: [],
      revoked: [],
    };
    expect(relaylivetokens(session)).toEqual([secondtoken]);
    expect(session.revoked).toEqual([firsttoken]);
    /* the revoked token no longer authenticates */
    const post = composeenvelope({
      op: "eventpost",
      opid: stableopid("ext", 3),
      at: now,
      sessionid,
      token: firsttoken,
      body: eventpostbody({ event: { kind: "chat", stream: "chat", payload: { message: "no" } } }),
    });
    const refused = send({ state, connectionid: "conn-1", frame: JSON.stringify(post) });
    expect((refused.replies[0]?.body as { error?: string }).error).toContain("token authentication");
  });

  it("answers a frame that does not parse with the parse error and ignores an unregistered connection", () => {
    const state = statewith("conn-1");
    const outcome = send({ state, connectionid: "conn-1", frame: "not json" });
    expect((outcome.replies[0]?.body as { error?: string }).error).toContain("does not parse");
    expect(outcome.state).toBe(state);
    const ghost = relayserverframe({ state, connectionid: "conn-ghost", frame: "not json", now });
    expect(ghost.replies).toHaveLength(0);
  });

  it("closes the connections the idle sweep selects inside the operator chosen window", () => {
    let state = statewith("conn-1", "conn-2");
    state = relayconnectionopen(state, "conn-1", now);
    /* an absent window never expires a connection because the bound stays the operator's choice */
    expect(relayidleconnections(state, now + 10_000)).toEqual([]);
    expect(relayidleconnections(state, now + 10_000, 5_000)).toEqual(["conn-1", "conn-2"]);
    const closed = relayconnectionclose(state, "conn-1");
    expect(closed.connections.map((connection) => connection.id)).toEqual(["conn-2"]);
    expect(closed.tokens).toHaveLength(0);
  });

  it("encodes every reply as the plain json wire frame of the servercontract", () => {
    const frame = relayframeof({ op: "eventpost", opid: "op-relay-1", at: now, body: { accepted: true } });
    const parsed = parsewireframe(frame);
    expect(parsed.op).toBe("eventpost");
    expect(parsed.opid).toBe("op-relay-1");
    expect(parsed.body).toEqual({ accepted: true });
  });
});
