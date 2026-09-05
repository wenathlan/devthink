/*! devthink 2.0.0 companion — the optional native host of the native bridge — GPL-3.0-only — built with plain node, no native compiler */

// companion.ts
import { createHash, randomBytes } from "node:crypto";
import { appendFileSync, renameSync, statSync } from "node:fs";
import { createServer } from "node:net";
import { pathToFileURL } from "node:url";
var nativehosttemplatejson = `{
  "name": "__native_host_name__",
  "description": "The devthink companion process: an optional native host that speaks length prefixed json over stdio and never runs until the user installs it.",
  "path": "__companion_path__",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://__generated_extension_id__/"
  ],
  "devthinkBanner": "devthink __devthink_version__ native host manifest template \u2014 GPL-3.0-only \u2014 the chromium host manifest of the optional companion process"
}
`;
var companionbuild = "2.0.0";
var companionprotocol = 1;
var companionsurfaces = ["osdialog", "notification"];
var maxnativemessage = 1024 * 1024;
var websocketguid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
var logpath = process.env.DEVTHINKCOMPANIONLOG ?? "";
var logbound = Number.parseInt(process.env.DEVTHINKCOMPANIONLOGBOUND ?? "", 10);
function logline(line) {
  if (logpath === "") return;
  const text = `${line}
`;
  try {
    if (Number.isFinite(logbound) && logbound > 0) {
      try {
        const size = statSync(logpath).size;
        if (size + text.length > logbound) renameSync(logpath, `${logpath}.1`);
      } catch {
      }
    }
    appendFileSync(logpath, text);
  } catch {
  }
}
function encodenativemessage(frame) {
  const payload = Buffer.from(JSON.stringify(frame), "utf8");
  const head = Buffer.alloc(4);
  head.writeUInt32LE(payload.length, 0);
  return Buffer.concat([head, payload]);
}
function encodeframe(text) {
  const payload = Buffer.from(text, "utf8");
  if (payload.length < 126) return Buffer.concat([Buffer.from([129, payload.length]), payload]);
  if (payload.length < 65536) {
    const head2 = Buffer.alloc(4);
    head2[0] = 129;
    head2[1] = 126;
    head2.writeUInt16BE(payload.length, 2);
    return Buffer.concat([head2, payload]);
  }
  const head = Buffer.alloc(10);
  head[0] = 129;
  head[1] = 127;
  head.writeBigUInt64BE(BigInt(payload.length), 2);
  return Buffer.concat([head, payload]);
}
function decodeframes(buffer) {
  const frames = [];
  let rest = buffer;
  while (rest.length >= 2) {
    const opcode = (rest[0] ?? 0) & 15;
    const masked = ((rest[1] ?? 0) & 128) !== 0;
    let length = (rest[1] ?? 0) & 127;
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
    if (masked) for (let index = 0; index < payload.length; index += 1) payload[index] = (payload[index] ?? 0) ^ (mask[index % 4] ?? 0);
    frames.push({ opcode, payload });
    rest = rest.subarray(offset + length);
  }
  return { frames, rest };
}
var bridge = { port: 0, token: "", idlewindow: void 0, started: false, extension: null, clients: /* @__PURE__ */ new Set(), lastframeat: Date.now() };
function bridgerelay(text) {
  for (const client of bridge.clients) {
    try {
      client.write(encodeframe(text));
    } catch {
    }
  }
}
function startbridge(advertise) {
  if (bridge.started) return;
  const server = createServer((socket) => {
    let buffer = Buffer.alloc(0);
    let handshaked = false;
    let authenticated = false;
    let role = "client";
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      if (!handshaked) {
        const head = buffer.toString("latin1");
        const split = head.indexOf("\r\n\r\n");
        if (split < 0) return;
        const request = head.slice(0, split);
        const keymatch = request.match(/sec-websocket-key:\s*(.+)/i);
        if (keymatch === null) {
          socket.destroy();
          return;
        }
        const accept = createHash("sha1").update(`${keymatch[1]?.trim() ?? ""}${websocketguid}`).digest("base64");
        socket.write(`HTTP/1.1 101 Switching Protocols\r
Upgrade: websocket\r
Connection: Upgrade\r
Sec-WebSocket-Accept: ${accept}\r
\r
`);
        buffer = buffer.subarray(Buffer.byteLength(`${request}\r
\r
`, "latin1"));
        handshaked = true;
      }
      const { frames, rest } = decodeframes(buffer);
      buffer = rest;
      for (const frame of frames) {
        if (frame.opcode === 8) {
          socket.destroy();
          return;
        }
        if (frame.opcode !== 1) continue;
        let envelope;
        try {
          envelope = JSON.parse(frame.payload.toString("utf8"));
        } catch {
          socket.destroy();
          return;
        }
        if (!authenticated) {
          const token = typeof envelope.token === "string" ? envelope.token : "";
          const wantedrole = envelope.role === "extension" ? "extension" : "client";
          if (token === "" || createHash("sha256").update(token).digest("hex") !== createHash("sha256").update(bridge.token).digest("hex")) {
            try {
              socket.write(encodeframe(JSON.stringify({ error: "The wsbridge frame token failed the session authentication." })));
            } catch {
            }
            socket.destroy();
            return;
          }
          if (wantedrole === "extension") {
            if (bridge.extension !== null && bridge.extension.writable) {
              try {
                socket.write(encodeframe(JSON.stringify({ error: "The wsbridge session holds one extension connection at a time." })));
              } catch {
              }
              socket.destroy();
              return;
            }
            bridge.extension = socket;
            role = "extension";
          }
          authenticated = true;
          bridge.clients.add(socket);
          bridge.lastframeat = Date.now();
          continue;
        }
        bridge.lastframeat = Date.now();
        bridgerelay(JSON.stringify(envelope));
        writeframe({ kind: "event", correlationid: typeof envelope.correlationid === "string" ? envelope.correlationid : "run-bridge-1", body: { relayed: true, role } });
      }
    });
    socket.on("close", () => {
      bridge.clients.delete(socket);
      if (bridge.extension === socket) bridge.extension = null;
    });
    socket.on("error", () => {
      bridge.clients.delete(socket);
    });
  });
  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    bridge.port = typeof address === "object" && address !== null ? address.port : 0;
    bridge.token = randomBytes(24).toString("hex");
    bridge.started = true;
    logline(`wsbridge bound 127.0.0.1:${bridge.port}`);
    advertise();
  });
  const sweep = setInterval(() => {
    if (bridge.idlewindow !== void 0 && Date.now() - bridge.lastframeat > bridge.idlewindow) {
      for (const client of bridge.clients) client.destroy();
      bridge.clients.clear();
      bridge.extension = null;
      bridge.lastframeat = Date.now();
      logline("wsbridge idle expiry closed the quiet session");
    }
  }, 1e3);
  sweep.unref();
}
function writeframe(frame) {
  process.stdout.write(encodenativemessage(frame));
  logline(`native ${frame.kind} ${frame.correlationid}`);
}
function runsurface(frame) {
  const body = frame.body ?? {};
  const surface = typeof body.surface === "string" ? body.surface : "";
  if (!companionsurfaces.includes(surface)) {
    return { kind: "error", correlationid: frame.correlationid, body: { family: "surface", message: `The native surface ${surface} sits outside the surface catalog.`, retry: "none" } };
  }
  if (body.classconsent !== true || body.surfaceconsent !== true) {
    return { kind: "error", correlationid: frame.correlationid, body: { family: "surface", message: `The ${surface} surface refuses execution without an active consent grant.`, retry: "none" } };
  }
  const presenter = typeof body.presenter === "string" ? body.presenter.trim() : "";
  if (presenter === "") {
    return { kind: "call", correlationid: frame.correlationid, body: { surface, delivered: false, reason: "No presenter configured for the surface; the user configured presenter command stays the only execution path." } };
  }
  return { kind: "call", correlationid: frame.correlationid, body: { surface, delivered: false, reason: `The presenter ${presenter} stays a user choice the companion records; the source build runs the presenter only through the user reviewed launch.` } };
}
async function handleframe(frame) {
  if (frame === null || typeof frame !== "object" || typeof frame.kind !== "string" || typeof frame.correlationid !== "string" || frame.correlationid === "") {
    writeframe({ kind: "error", correlationid: "run-unknown-1", body: { family: "port", message: "The native frame carries its kind and its correlation id.", retry: "reconnect" } });
    return;
  }
  const typed = frame;
  const body = typed.body;
  if (typed.kind === "handshake") {
    const asked = typeof body?.protocol === "number" ? body.protocol : Number.parseInt(String(body?.protocol ?? ""), 10);
    if (bridge.idlewindow === void 0 && typeof body?.idlewindow === "number" && body.idlewindow > 0) bridge.idlewindow = body.idlewindow;
    startbridge(() => {
      writeframe({ kind: "advertisement", correlationid: typed.correlationid, body: { port: bridge.port, token: bridge.token, ...bridge.idlewindow !== void 0 ? { idlewindow: bridge.idlewindow } : {} } });
    });
    writeframe({ kind: "handshake", correlationid: typed.correlationid, body: { build: companionbuild, protocol: companionprotocol, surfaces: [...companionsurfaces], wsbridgeport: bridge.port, ...Number.isInteger(asked) && asked !== companionprotocol ? { mismatch: `The extension speaks the native bridge protocol major version ${asked} while this companion speaks ${companionprotocol}; the upgrade path keeps compatibility for one major version.` } : {} } });
    return;
  }
  if (typed.kind === "heartbeat") {
    writeframe({ kind: "heartbeat", correlationid: typed.correlationid, body: { at: Date.now() } });
    return;
  }
  if (typed.kind === "call") {
    writeframe(runsurface(typed));
    return;
  }
  writeframe({ kind: "error", correlationid: typed.correlationid, body: { family: "port", message: `The native frame kind ${typed.kind} stays outside the companion surface.`, retry: "none" } });
}
function main() {
  let buffer = Buffer.alloc(0);
  process.stdin.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    for (; ; ) {
      if (buffer.length < 4) return;
      const length = buffer.readUInt32LE(0);
      if (length > maxnativemessage) {
        writeframe({ kind: "error", correlationid: "run-unknown-1", body: { family: "port", message: "The native message exceeds the one megabyte cap of the native messaging protocol.", retry: "none" } });
        buffer = Buffer.alloc(0);
        return;
      }
      if (buffer.length < 4 + length) return;
      const payload = buffer.subarray(4, 4 + length);
      buffer = buffer.subarray(4 + length);
      let frame;
      try {
        frame = JSON.parse(payload.toString("utf8"));
      } catch {
        continue;
      }
      void handleframe(frame);
    }
  });
  process.stdin.on("end", () => process.exit(0));
  logline(`companion source build ${companionbuild} protocol ${companionprotocol} listening`);
}
if (process.argv[1] !== void 0 && import.meta.url === pathToFileURL(process.argv[1]).href) main();
export {
  companionbuild,
  companionprotocol,
  companionsurfaces,
  encodenativemessage,
  nativehosttemplatejson
};
//# sourceMappingURL=companion.js.map
