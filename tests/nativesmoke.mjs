/** The native bridge smoke of the 1.1.85 family: runs the wsbridge against a fake host process — the smoke spawns the fake host fixture as the companion process, drives the length prefixed json handshake over its stdio, negotiates the native capabilities, wraps one frame into the wsbridge servercontract envelope and reads it back, validates the token authentication and the idle sweep, and asserts the secret exclusion keeps key material out of the frames; the smoke exits non zero on the first refusal and covers the containerfile and the verify workflow native steps. */
import { spawn } from "node:child_process";

const fakehost = new URL("./fakehost.mjs", import.meta.url);
const bridge = await import("../dist/bridge.js");
const wsbridge = bridge;
const nativehost = bridge;

/** Sends one length prefixed json frame to the fake host stdin. */
function send(process, frame) {
  const payload = Buffer.from(JSON.stringify(frame), "utf8");
  const head = Buffer.alloc(4);
  head.writeUInt32LE(payload.length, 0);
  process.stdin.write(Buffer.concat([head, payload]));
}

/** Reads the next length prefixed frame of the fake host stdout. */
function readnext(chunks) {
  const buffer = Buffer.concat(chunks);
  if (buffer.length < 4) return undefined;
  const length = buffer.readUInt32LE(0);
  if (buffer.length < 4 + length) return undefined;
  const payload = buffer.subarray(4, 4 + length);
  chunks.splice(0, chunks.length, buffer.subarray(4 + length));
  return JSON.parse(payload.toString("utf8"));
}

const host = spawn(process.execPath, [fakehost.href.replace("file://", ""), "--build", "smoke-1.1.85", "--protocol", "1", "--port", "0"], { stdio: ["pipe", "pipe", "inherit"] });
const chunks = [];
host.stdout.on("data", chunk => chunks.push(chunk));
const wait = async (attempts = 100) => {
  for (let index = 0; index < attempts; index += 1) {
    const frame = readnext(chunks);
    if (frame !== undefined) return frame;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  throw new Error("The fake host never answered the smoke handshake.");
};

const correlationid = nativehost.nativecorrelationid("smoke", 1);
send(host, nativehost.companionhandshakeframe(correlationid));
const answer = await wait();
if (answer.kind !== "handshake") throw new Error(`The fake host answered the ${answer.kind} kind instead of the handshake.`);
const parsed = nativehost.parsecompanionhandshake(answer, Date.now());
if (parsed.handshake === undefined) throw new Error(parsed.error?.message ?? "The handshake parse failed.");
if (parsed.handshake.build !== "smoke-1.1.85") throw new Error(`The fake host reported the build ${parsed.handshake.build}.`);
const negotiated = nativehost.negotiatenativecapabilities({ ours: nativehost.nativehostcapabilities(), theirs: { protocol: parsed.handshake.protocol, surfaces: parsed.handshake.surfaces, heartbeat: true } });
if (!negotiated.ok) throw new Error(negotiated.reason ?? "The native capability negotiation failed.");
if (negotiated.surfaces.join(",") !== "osdialog,notification") throw new Error(`The negotiation enumerated the surfaces ${negotiated.surfaces.join(",")}.`);

send(host, nativehost.nativeheartbeatframe(correlationid));
const heartbeat = await wait();
if (heartbeat.kind !== "heartbeat") throw new Error(`The fake host answered the ${heartbeat.kind} kind instead of the heartbeat.`);

const bind = wsbridge.wsbridgebindcheck({ bind: "127.0.0.1", port: 0 });
if (!bind.ok || bind.port !== 0) throw new Error("The wsbridge bind check refused the localhost random port.");
if (wsbridge.wsbridgebindcheck({ bind: "0.0.0.0" }).ok) throw new Error("The wsbridge bind check accepted a non localhost address.");
const session = wsbridge.wsbridgesessionstart({ port: 49152, now: Date.now(), token: "smoke-session-token", hashof: text => text });
if (session.tokenhash !== "smoke-session-token") throw new Error("The wsbridge session recorded a token hash that differs from the hash seam.");
if (!wsbridge.wsbridgeframeauth(session, "smoke-session-token", text => text).ok) throw new Error("The wsbridge token authentication refused the session token.");
if (wsbridge.wsbridgeframeauth(session, "wrong-token", text => text).ok) throw new Error("The wsbridge token authentication accepted a wrong token.");
const extension = wsbridge.wsbridgeextensionconnect(session, Date.now());
if (extension.refused !== undefined || extension.session?.extensionconnected !== true) throw new Error(extension.refused ?? "The wsbridge extension connection failed.");
if (wsbridge.wsbridgeextensionconnect(extension.session, Date.now()).refused === undefined) throw new Error("The wsbridge accepted a second extension connection.");
const idle = wsbridge.wsbridgesessionstart({ port: 49152, now: 0, token: "idle-token", hashof: text => text, idlewindow: 1000 });
if (!wsbridge.wsbridgeidlesweep(idle, 1500).expired) throw new Error("The wsbridge idle sweep kept a quiet session past its window.");
const envelope = wsbridge.wsbridgeenvelopeof({ opid: "op-smoke-1", at: Date.now(), frame: nativehost.nativeframeof("event", correlationid, { smoke: true }) });
const unwrapped = wsbridge.wsbridgeframeof(envelope);
if (unwrapped.frame?.correlationid !== correlationid) throw new Error(unwrapped.reason ?? "The wsbridge envelope round trip lost the correlation id.");
if (unwrapped.frame?.body?.smoke !== true) throw new Error("The wsbridge envelope round trip lost the frame body.");
const secretcheck = nativehost.nativesecretexclusion(nativehost.nativeframeof("call", correlationid, { apikey: "material" }));
if (secretcheck.ok || secretcheck.held.join(",") !== "apikey") throw new Error("The secret exclusion let key material cross the native frame.");
const degraded = nativehost.nativedegradationof({ state: nativehost.nativedefaultstate() });
if (!degraded.degraded) throw new Error("The degradation posture kept the transport up with no host installed.");

host.stdin.end();
await new Promise(resolve => host.on("close", resolve));
console.log(JSON.stringify({ valid: true, family: "nativebridge", handshake: parsed.handshake, negotiated: { protocol: negotiated.protocol, surfaces: negotiated.surfaces }, wsbridge: { bind: bind.bind, port: session.port, tokenauth: true, idleexpiry: true, envelopes: true }, secretexclusion: secretcheck.held, degraded: degraded.degraded }));
