/** Test-only relay of the 1.1.82 site integration family: a minimal frame-level websocket server over node:net that implements the servercontract for the vitest suite — the handshake, the text frame codec, the sessioncreate and sessionjoin operations with pairing code exchange and token rotation, the per frame token authentication, the eventpost routing between the one extension member and the one site member, the eventstream subscription acks and the idle expiry sweep. No ws dependency is needed: the codec below speaks the websocket wire directly. The relay binds localhost with a random free port and exists for tests only — the production relay is always a user configured url. */
import { createHash, randomUUID } from "node:crypto";
import { createServer } from "node:net";

const websocketguid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const contractcapabilities = {
  version: 1,
  operations: ["sessioncreate", "sessionjoin", "eventpost", "eventstream"],
  events: ["chat", "planproposal", "planreview", "progress"],
  heartbeat: true,
  multiplex: true,
};

/** Encodes one server to client text frame: fin with the text opcode and the unmasked payload. */
function encodeframe(text) {
  const payload = Buffer.from(text, "utf8");
  if (payload.length < 126) return Buffer.concat([Buffer.from([0x81, payload.length]), payload]);
  if (payload.length < 65536) {
    const head = Buffer.alloc(4);
    head[0] = 0x81;
    head[1] = 126;
    head.writeUInt16BE(payload.length, 2);
    return Buffer.concat([head, payload]);
  }
  const head = Buffer.alloc(10);
  head[0] = 0x81;
  head[1] = 127;
  head.writeBigUInt64BE(BigInt(payload.length), 2);
  return Buffer.concat([head, payload]);
}

/** Decodes every complete client to server frame from the buffer: client frames arrive masked; text, close, ping and continuation opcodes surface with their payloads while the unparsed rest returns for the next chunk. */
function decodeframes(buffer) {
  const frames = [];
  let rest = buffer;
  while (rest.length >= 2) {
    const first = rest[0];
    const second = rest[1];
    const opcode = first & 0x0f;
    const masked = (second & 0x80) !== 0;
    let length = second & 0x7f;
    let offset = 2;
    if (length === 126) {
      if (rest.length < 4) break;
      length = rest.readUInt16BE(2);
      offset = 4;
    } else if (length === 127) {
      if (rest.length < 10) break;
      length = Number(rest.readBigUInt64BE(2));
      offset = 10;
    }
    let mask = Buffer.alloc(0);
    if (masked) {
      if (rest.length < offset + 4) break;
      mask = rest.subarray(offset, offset + 4);
      offset += 4;
    }
    if (rest.length < offset + length) break;
    const payload = Buffer.from(rest.subarray(offset, offset + length));
    if (masked) for (let index = 0; index < payload.length; index += 1) payload[index] ^= mask[index % 4];
    frames.push({ opcode, payload });
    rest = rest.subarray(offset + length);
  }
  return { frames, rest };
}

/** Starts the test relay on a localhost random port. The options carry the pairing code the extension side registers, the token lifetime, the idle window of the expiry sweep and the clock. The returned handle exposes the ws url, the port, the session log, the close and the wait helper. */
export async function starttestrelay(options = {}) {
  const pairingcode = options.pairingcode ?? `DT-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  const idlewindow = options.idlewindow;
  const now = options.now ?? Date.now;
  const sessions = new Map();
  const pairings = new Map();
  const connections = [];
  const log = [];
  let closer = null;

  const reply = (connection, envelope) => {
    try {
      connection.socket.write(encodeframe(JSON.stringify(envelope)));
    } catch {
      /* a closed socket needs no reply */
    }
  };

  const memberconnections = (session) =>
    [session.extension, session.site].filter((entry) => entry !== undefined && entry.socket.writable);

  const handleframe = (connection, text) => {
    let envelope;
    try {
      envelope = JSON.parse(text);
    } catch {
      return;
    }
    if (envelope === null || typeof envelope !== "object" || typeof envelope.op !== "string") return;
    const at = now();
    connection.lastframeat = at;
    if (envelope.op === "sessioncreate") {
      if (typeof envelope.body !== "object" || envelope.body === null || envelope.body.role !== "extension") {
        reply(connection, {
          version: 1,
          op: "sessioncreate",
          opid: envelope.opid,
          at,
          body: { error: "The sessioncreate operation serves the extension member only." },
        });
        return;
      }
      const session = {
        id: `session-${randomUUID().slice(0, 8)}`,
        extension: undefined,
        site: undefined,
        events: [],
        tokens: new Map(),
      };
      const token = `token-${randomUUID()}`;
      session.tokens.set(createHash("sha256").update(token).digest("hex"), { revoked: false });
      connection.sessionid = session.id;
      connection.tokenhash = createHash("sha256").update(token).digest("hex");
      connection.token = token;
      connection.role = "extension";
      connection.authenticated = true;
      session.extension = connection;
      sessions.set(session.id, session);
      if (typeof envelope.body.pairingcode === "string" && envelope.body.pairingcode.trim() !== "")
        pairings.set(envelope.body.pairingcode.trim(), { sessionid: session.id, expiresat: at + 300000, used: false });
      reply(connection, {
        version: 1,
        op: "sessioncreate",
        opid: envelope.opid,
        sessionid: session.id,
        at,
        body: {
          sessionid: session.id,
          token,
          capabilities: contractcapabilities,
          members: [{ role: "extension", id: envelope.body.memberid ?? "", joinedat: at }],
        },
      });
      log.push({ op: "sessioncreate", sessionid: session.id, at });
      return;
    }
    if (envelope.op === "sessionjoin") {
      const body = typeof envelope.body === "object" && envelope.body !== null ? envelope.body : {};
      if (typeof body.pairingcode === "string" && body.pairingcode.trim() !== "" && body.role === "site") {
        const pairing = pairings.get(body.pairingcode.trim());
        if (pairing === undefined || pairing.used || at >= pairing.expiresat) {
          reply(connection, {
            version: 1,
            op: "sessionjoin",
            opid: envelope.opid,
            at,
            body: { error: "The pairing code matches no pending session of this relay." },
          });
          return;
        }
        const session = sessions.get(pairing.sessionid);
        if (session === undefined || session.site !== undefined) {
          reply(connection, {
            version: 1,
            op: "sessionjoin",
            opid: envelope.opid,
            at,
            body: { error: "The relay session holds at most one site member." },
          });
          return;
        }
        pairing.used = true;
        const token = `token-${randomUUID()}`;
        const hash = createHash("sha256").update(token).digest("hex");
        session.tokens.set(hash, { revoked: false });
        connection.sessionid = session.id;
        connection.tokenhash = hash;
        connection.token = token;
        connection.role = "site";
        connection.authenticated = true;
        session.site = connection;
        reply(connection, {
          version: 1,
          op: "sessionjoin",
          opid: envelope.opid,
          sessionid: session.id,
          at,
          body: { sessionid: session.id, token, capabilities: contractcapabilities },
        });
        log.push({ op: "sessionjoin", sessionid: session.id, role: "site", at });
        return;
      }
      const session = sessions.get(envelope.sessionid);
      const hash = typeof envelope.token === "string" ? createHash("sha256").update(envelope.token).digest("hex") : "";
      const record = session !== undefined ? session.tokens.get(hash) : undefined;
      if (session === undefined || record === undefined || record.revoked) {
        reply(connection, {
          version: 1,
          op: "sessionjoin",
          opid: envelope.opid,
          at,
          body: { error: "The sessionjoin frame failed the token authentication." },
        });
        return;
      }
      record.revoked = true;
      const token = `token-${randomUUID()}`;
      session.tokens.set(createHash("sha256").update(token).digest("hex"), { revoked: false });
      connection.tokenhash = createHash("sha256").update(token).digest("hex");
      connection.token = token;
      connection.authenticated = true;
      const role = body.role === "extension" || body.role === "site" ? body.role : connection.role;
      connection.role = role;
      if (role === "extension") session.extension = connection;
      else if (role === "site") session.site = connection;
      reply(connection, {
        version: 1,
        op: "sessionjoin",
        opid: envelope.opid,
        sessionid: session.id,
        at,
        body: { sessionid: session.id, token, capabilities: contractcapabilities, rotated: true },
      });
      log.push({ op: "sessionjoin", sessionid: session.id, rotated: true, at });
      return;
    }
    if (envelope.op === "eventpost" || envelope.op === "eventstream") {
      const session = sessions.get(envelope.sessionid);
      const hash = typeof envelope.token === "string" ? createHash("sha256").update(envelope.token).digest("hex") : "";
      const record = session !== undefined ? session.tokens.get(hash) : undefined;
      if (session === undefined || record === undefined || record.revoked) {
        reply(connection, {
          version: 1,
          op: envelope.op,
          opid: envelope.opid,
          at,
          body: { error: "The frame failed the token authentication of its session." },
        });
        return;
      }
      if (envelope.op === "eventstream") {
        reply(connection, {
          version: 1,
          op: "eventstream",
          opid: envelope.opid,
          sessionid: session.id,
          token: envelope.token,
          at,
          body: { streams: typeof envelope.body?.streams === "object" ? envelope.body.streams : [], subscribed: true },
        });
        log.push({ op: "eventstream", sessionid: session.id, at });
        return;
      }
      session.events.push({
        opid: envelope.opid,
        kind: envelope.body?.kind ?? "",
        stream: envelope.body?.stream ?? "",
        at,
      });
      log.push({ op: "eventpost", sessionid: session.id, kind: envelope.body?.kind ?? "", opid: envelope.opid, at });
      for (const member of memberconnections(session)) {
        if (member === connection) continue;
        try {
          member.socket.write(
            encodeframe(
              JSON.stringify({ ...envelope, token: member.token, body: envelope.body, sessionid: session.id, at }),
            ),
          );
        } catch {
          /* a closed member receives nothing */
        }
      }
      reply(connection, {
        version: 1,
        op: "eventpost",
        opid: envelope.opid,
        sessionid: session.id,
        token: envelope.token,
        at,
        body: { accepted: true },
      });
      return;
    }
    reply(connection, {
      version: 1,
      op: envelope.op,
      opid: envelope.opid,
      at,
      body: { error: "The operation sits outside the servercontract." },
    });
  };

  const server = createServer((socket) => {
    const connection = {
      socket,
      sessionid: "",
      tokenhash: "",
      token: "",
      role: "",
      authenticated: false,
      lastframeat: now(),
    };
    connections.push(connection);
    let buffer = Buffer.alloc(0);
    let fragment = "";
    socket.on("data", (chunk) => {
      if (buffer.length === 0 && chunk.subarray(0, 3).toString("utf8") === "GET") {
        const headerend = chunk.indexOf("\r\n\r\n");
        if (headerend === -1) {
          buffer = Buffer.concat([buffer, chunk]);
          return;
        }
        const head = chunk.subarray(0, headerend).toString("utf8");
        const keymatch = head.match(/sec-websocket-key:\s*([^\r\n]+)/i);
        if (keymatch === null) {
          socket.destroy();
          return;
        }
        const accept = createHash("sha1").update(`${keymatch[1].trim()}${websocketguid}`).digest("base64");
        socket.write(
          `HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`,
        );
        buffer = Buffer.concat([buffer, chunk.subarray(headerend + 4)]);
        return;
      }
      buffer = Buffer.concat([buffer, chunk]);
    });
    socket.on("data", () => {
      const decoded = decodeframes(buffer);
      buffer = decoded.rest;
      for (const frame of decoded.frames) {
        if (frame.opcode === 1) {
          const text = fragment + frame.payload.toString("utf8");
          fragment = "";
          handleframe(connection, text);
        } else if (frame.opcode === 0) {
          fragment += frame.payload.toString("utf8");
        } else if (frame.opcode === 8) {
          try {
            socket.end();
          } catch {
            /* an already closed socket needs no close */
          }
        } else if (frame.opcode === 9) {
          try {
            socket.write(Buffer.concat([Buffer.from([0x8a, frame.payload.length]), frame.payload]));
          } catch {
            /* a closed socket needs no pong */
          }
        }
      }
    });
    socket.on("error", () => {
      /* a broken connection closes below */
    });
    socket.on("close", () => {
      const index = connections.indexOf(connection);
      if (index >= 0) connections.splice(index, 1);
    });
  });

  const sweep =
    idlewindow !== undefined
      ? setInterval(
          () => {
            for (const connection of connections) {
              if (now() - connection.lastframeat >= idlewindow) {
                try {
                  connection.socket.destroy();
                } catch {
                  /* an already dead socket needs nothing */
                }
              }
            }
          },
          Math.max(50, Math.floor(idlewindow / 4)),
        )
      : null;

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  const port = server.address().port;
  closer = async () => {
    if (sweep !== null) clearInterval(sweep);
    for (const connection of connections) {
      try {
        connection.socket.destroy();
      } catch {
        /* an already dead socket needs nothing */
      }
    }
    await new Promise((resolve) => {
      server.close(() => resolve(null));
    });
  };
  return {
    url: `ws://127.0.0.1:${port}`,
    port,
    pairingcode,
    log,
    close: closer,
    sessions: () =>
      [...sessions.values()].map((session) => ({
        id: session.id,
        events: [...session.events],
        members: [session.extension?.role, session.site?.role].filter((role) => role !== undefined),
      })),
  };
}
