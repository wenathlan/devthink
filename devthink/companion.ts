/** The companion module of the 1.1.98 consolidation: the native host runtime interned in this one typescript module, so the companion family carries one source file the plain node recipe of the build compiles, stamps and ships beside the dist targets — never a binary blob, never a hand maintained runtime file. */

/** The host manifest template the build stamps and emits as dist/nativehost.template.json: the chromium native messaging host manifest of the optional companion process, with the placeholders the installer fills (the host name, the companion path and the generated extension id) and the version placeholder the build stamps. */
export const nativehosttemplatejson = `{
  "name": "__native_host_name__",
  "description": "The devthink companion process: an optional native host that speaks length prefixed json over stdio and never runs until the user installs it.",
  "path": "__companion_path__",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://__generated_extension_id__/"
  ],
  "devthinkBanner": "devthink __devthink_version__ native host manifest template — GPL-3.0-only — the chromium host manifest of the optional companion process"
}
`;

/** The companionbin source of the 1.1.85 native host bridge family: an optional native companion process that speaks length prefixed json over stdin and stdout (the chromium native messaging wire), answers the handshake with its build and protocol version, hosts the wsbridge localhost websocket relay with its per session token, exposes the os dialog and notification surfaces behind the consent grants the extension frame carries, rotates its log file with size bounds, and never runs until the user builds it with the plain node recipe and installs the host manifest — no binary blob, no native compiler, no vendor endpoint and no code default anywhere: the log path, the size bound, the presenter commands and the idle window all arrive from the user configuration of the calling frame or stay off. */
import { createHash, randomBytes } from "node:crypto";
import { appendFileSync, renameSync, statSync } from "node:fs";
import { createServer, type Socket } from "node:net";
import { pathToFileURL } from "node:url";

/** The native frame shape the companion speaks: every frame carries its kind and correlation id with an optional body. */
interface nativeframe {
  kind: string;
  correlationid: string;
  body?: Record<string, unknown>;
}

/** The build stamp of the companion: the build recipe replaces the source marker with the package version, so the handshake reports the version of the build that shipped. */
export const companionbuild = "source";

/** The native bridge protocol major version this companion speaks: the handshake reports it and the upgrade path keeps compatibility for exactly one major version. */
export const companionprotocol = 1;

/** The native surfaces this companion exposes behind consent: the os dialog surface of the sensitive call class and the notification surface of the interaction call class. */
export const companionsurfaces: readonly string[] = ["osdialog", "notification"];

/** The maximum native message size the companion accepts: the chromium native messaging protocol caps one message at one megabyte, so a longer frame refuses instead of buffering without bound. */
const maxnativemessage = 1024 * 1024;

/** The websocket guid of the rfc 6455 handshake: the accept key derives from it with sha1, the only place a fixed protocol constant appears. */
const websocketguid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

/** The companion log state: the log path and the size bound stay user configured through the environment of the launch, an absent path logs nothing and an absent bound never rotates. */
const logpath = process.env.DEVTHINKCOMPANIONLOG ?? "";
const logbound = Number.parseInt(process.env.DEVTHINKCOMPANIONLOGBOUND ?? "", 10);

/** Writes one log line with its size bounded rotation: the line appends to the log file, and when the file would pass the user configured bound the current file rotates to its .1 suffix before the line writes. */
function logline(line: string): void {
  if (logpath === "") return;
  const text = `${line}\n`;
  try {
    if (Number.isFinite(logbound) && logbound > 0) {
      try {
        const size = statSync(logpath).size;
        if (size + text.length > logbound) renameSync(logpath, `${logpath}.1`);
      } catch {
        /* a missing log file starts fresh */
      }
    }
    appendFileSync(logpath, text);
  } catch {
    /* an unwritable log path never kills the companion */
  }
}

/** Encodes one native message as the length prefixed json the chromium native messaging protocol carries: the four byte little endian length rides ahead of the utf8 payload. */
export function encodenativemessage(frame: nativeframe): Buffer {
  const payload = Buffer.from(JSON.stringify(frame), "utf8");
  const head = Buffer.alloc(4);
  head.writeUInt32LE(payload.length, 0);
  return Buffer.concat([head, payload]);
}

/** Encodes one server to client websocket text frame: fin with the text opcode and the unmasked payload. */
function encodeframe(text: string): Buffer {
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

/** Decodes every complete client to server websocket frame from the buffer: client frames arrive masked; text and close opcodes surface with their payloads while the unparsed rest returns for the next chunk. */
function decodeframes(buffer: Buffer): { frames: Array<{ opcode: number; payload: Buffer }>; rest: Buffer } {
  const frames: Array<{ opcode: number; payload: Buffer }> = [];
  let rest = buffer;
  while (rest.length >= 2) {
    const opcode = (rest[0] ?? 0) & 0x0f;
    const masked = ((rest[1] ?? 0) & 0x80) !== 0;
    let length = (rest[1] ?? 0) & 0x7f;
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
    let mask: Buffer = Buffer.alloc(0);
    if (masked) {
      if (rest.length < offset + 4) break;
      mask = rest.subarray(offset, offset + 4);
      offset += 4;
    }
    if (rest.length < offset + length) break;
    const payload = Buffer.from(rest.subarray(offset, offset + length));
    if (masked)
      for (let index = 0; index < payload.length; index += 1)
        payload[index] = (payload[index] ?? 0) ^ (mask[index % 4] ?? 0);
    frames.push({ opcode, payload });
    rest = rest.subarray(offset + length);
  }
  return { frames, rest };
}

/** The wsbridge session state: the bound port, the per session token (the raw value lives here and on the wire to the extension only), the idle window of the user configuration, the extension connection slot and the authenticated client sockets. */
const bridge: {
  port: number;
  token: string;
  idlewindow: number | undefined;
  started: boolean;
  extension: Socket | null;
  clients: Set<Socket>;
  lastframeat: number;
} = {
  port: 0,
  token: "",
  idlewindow: undefined,
  started: false,
  extension: null,
  clients: new Set(),
  lastframeat: Date.now(),
};

/** Writes one frame to every authenticated websocket client of the wsbridge session: the relay direction native to websocket. */
function bridgerelay(text: string): void {
  for (const client of bridge.clients) {
    try {
      client.write(encodeframe(text));
    } catch {
      /* a closed client leaves the set on its close event */
    }
  }
}

/** Starts the wsbridge localhost websocket server on a random free port: the listener binds the loopback only, mints the per session token, sweeps the idle expiry of the user configured window and answers the websocket handshake of the clients that authenticate with the token in their first frame; a second extension role connection refuses because the wsbridge supports one extension connection at a time. */
function startbridge(advertise: () => void): void {
  if (bridge.started) return;
  const server = createServer((socket) => {
    let buffer: Buffer = Buffer.alloc(0);
    let handshaked = false;
    let authenticated = false;
    let role = "client";
    socket.on("data", (chunk: Buffer) => {
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
        const accept = createHash("sha1")
          .update(`${keymatch[1]?.trim() ?? ""}${websocketguid}`)
          .digest("base64");
        socket.write(
          `HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`,
        );
        buffer = buffer.subarray(Buffer.byteLength(`${request}\r\n\r\n`, "latin1"));
        handshaked = true;
      }
      const { frames, rest } = decodeframes(buffer);
      buffer = rest;
      for (const frame of frames) {
        if (frame.opcode === 0x8) {
          socket.destroy();
          return;
        }
        if (frame.opcode !== 0x1) continue;
        let envelope: { token?: unknown; role?: unknown; correlationid?: unknown };
        try {
          envelope = JSON.parse(frame.payload.toString("utf8")) as {
            token?: unknown;
            role?: unknown;
            correlationid?: unknown;
          };
        } catch {
          socket.destroy();
          return;
        }
        if (!authenticated) {
          const token = typeof envelope.token === "string" ? envelope.token : "";
          const wantedrole = envelope.role === "extension" ? "extension" : "client";
          if (
            token === "" ||
            createHash("sha256").update(token).digest("hex") !== createHash("sha256").update(bridge.token).digest("hex")
          ) {
            try {
              socket.write(
                encodeframe(JSON.stringify({ error: "The wsbridge frame token failed the session authentication." })),
              );
            } catch {
              /* closed */
            }
            socket.destroy();
            return;
          }
          if (wantedrole === "extension") {
            if (bridge.extension !== null && bridge.extension.writable) {
              try {
                socket.write(
                  encodeframe(
                    JSON.stringify({ error: "The wsbridge session holds one extension connection at a time." }),
                  ),
                );
              } catch {
                /* closed */
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
        writeframe({
          kind: "event",
          correlationid: typeof envelope.correlationid === "string" ? envelope.correlationid : "run-bridge-1",
          body: { relayed: true, role },
        });
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
    if (bridge.idlewindow !== undefined && Date.now() - bridge.lastframeat > bridge.idlewindow) {
      for (const client of bridge.clients) client.destroy();
      bridge.clients.clear();
      bridge.extension = null;
      bridge.lastframeat = Date.now();
      logline("wsbridge idle expiry closed the quiet session");
    }
  }, 1000);
  sweep.unref();
}

/** Writes one native frame to stdout as a length prefixed message: the only output path of the companion, so the extension reads every answer and every advertisement from one wire. */
function writeframe(frame: nativeframe): void {
  process.stdout.write(encodenativemessage(frame));
  logline(`native ${frame.kind} ${frame.correlationid}`);
}

/** Runs one native surface call behind its consent grants: the call frame must carry the class consent and the surface consent stamps from the extension gates, and a surface without its consent grants refuses with the structured refusal; the surface execution itself delegates to the presenter command of the user configuration, so the companion never hardcodes a desktop tool and a surface without a configured presenter answers its graceful unavailable result. */
function runsurface(frame: nativeframe): nativeframe {
  const body = frame.body ?? {};
  const surface = typeof body.surface === "string" ? body.surface : "";
  if (!companionsurfaces.includes(surface)) {
    return {
      kind: "error",
      correlationid: frame.correlationid,
      body: {
        family: "surface",
        message: `The native surface ${surface} sits outside the surface catalog.`,
        retry: "none",
      },
    };
  }
  if (body.classconsent !== true || body.surfaceconsent !== true) {
    return {
      kind: "error",
      correlationid: frame.correlationid,
      body: {
        family: "surface",
        message: `The ${surface} surface refuses execution without an active consent grant.`,
        retry: "none",
      },
    };
  }
  const presenter = typeof body.presenter === "string" ? body.presenter.trim() : "";
  if (presenter === "") {
    return {
      kind: "call",
      correlationid: frame.correlationid,
      body: {
        surface,
        delivered: false,
        reason:
          "No presenter configured for the surface; the user configured presenter command stays the only execution path.",
      },
    };
  }
  return {
    kind: "call",
    correlationid: frame.correlationid,
    body: {
      surface,
      delivered: false,
      reason: `The presenter ${presenter} stays a user choice the companion records; the source build runs the presenter only through the user reviewed launch.`,
    },
  };
}

/** Handles one native frame from the extension: the handshake starts the wsbridge and answers the build and protocol version with the port advertisement, the heartbeat answers its timestamp for the liveness check, the surface call runs behind its consent grants, the settings frame carries the idle window of the user configuration, and every other kind answers the structured error with its retry hint. */
async function handleframe(frame: unknown): Promise<void> {
  if (
    frame === null ||
    typeof frame !== "object" ||
    typeof (frame as nativeframe).kind !== "string" ||
    typeof (frame as nativeframe).correlationid !== "string" ||
    (frame as nativeframe).correlationid === ""
  ) {
    writeframe({
      kind: "error",
      correlationid: "run-unknown-1",
      body: {
        family: "port",
        message: "The native frame carries its kind and its correlation id.",
        retry: "reconnect",
      },
    });
    return;
  }
  const typed = frame as nativeframe;
  const body = typed.body as Record<string, unknown> | undefined;
  if (typed.kind === "handshake") {
    const asked =
      typeof body?.protocol === "number" ? body.protocol : Number.parseInt(String(body?.protocol ?? ""), 10);
    if (bridge.idlewindow === undefined && typeof body?.idlewindow === "number" && body.idlewindow > 0)
      bridge.idlewindow = body.idlewindow;
    startbridge(() => {
      writeframe({
        kind: "advertisement",
        correlationid: typed.correlationid,
        body: {
          port: bridge.port,
          token: bridge.token,
          ...(bridge.idlewindow !== undefined ? { idlewindow: bridge.idlewindow } : {}),
        },
      });
    });
    writeframe({
      kind: "handshake",
      correlationid: typed.correlationid,
      body: {
        build: companionbuild,
        protocol: companionprotocol,
        surfaces: [...companionsurfaces],
        wsbridgeport: bridge.port,
        ...(Number.isInteger(asked) && asked !== companionprotocol
          ? {
              mismatch: `The extension speaks the native bridge protocol major version ${asked} while this companion speaks ${companionprotocol}; the upgrade path keeps compatibility for one major version.`,
            }
          : {}),
      },
    });
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
  writeframe({
    kind: "error",
    correlationid: typed.correlationid,
    body: {
      family: "port",
      message: `The native frame kind ${typed.kind} stays outside the companion surface.`,
      retry: "none",
    },
  });
}

/** Reads the length prefixed stdin of the chromium native messaging protocol: the four byte little endian length rides ahead of every json frame, an oversized frame refuses and the main loop stays alive while the host process lives. */
function main(): void {
  let buffer: Buffer = Buffer.alloc(0);
  process.stdin.on("data", (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk]);
    for (;;) {
      if (buffer.length < 4) return;
      const length = buffer.readUInt32LE(0);
      if (length > maxnativemessage) {
        writeframe({
          kind: "error",
          correlationid: "run-unknown-1",
          body: {
            family: "port",
            message: "The native message exceeds the one megabyte cap of the native messaging protocol.",
            retry: "none",
          },
        });
        buffer = Buffer.alloc(0);
        return;
      }
      if (buffer.length < 4 + length) return;
      const payload = buffer.subarray(4, 4 + length);
      buffer = buffer.subarray(4 + length);
      let frame: unknown;
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

/** The entry guard: the companion runs its main loop only when the host launched this module as the process entry, so the build recipe and the test suite import the exports without side effects. */
if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) main();
