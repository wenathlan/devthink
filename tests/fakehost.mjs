/** The fake host fixture of the 1.1.85 native bridge tests: a configurable native messaging host process that speaks the length prefixed json wire so the nativehost port tests, the handshake negotiation tests and the degradation tests run against a real spawned process instead of a stub — the argv knobs set the reported build version, the protocol major version and the wsbridge port of the handshake answer, and the silent knob keeps the host from answering at all so the crash and the reattach paths exercise. */
const args = new Set(process.argv.slice(2));
const build = args.has("--build") ? (process.argv[process.argv.indexOf("--build") + 1] ?? "fixture") : "fixture-1.1.85";
const protocol = args.has("--protocol") ? Number.parseInt(process.argv[process.argv.indexOf("--protocol") + 1] ?? "1", 10) : 1;
const wsbridgeport = args.has("--port") ? Number.parseInt(process.argv[process.argv.indexOf("--port") + 1] ?? "0", 10) : 0;
const silent = args.has("--silent");
const crashafter = args.has("--crashafter") ? Number.parseInt(process.argv[process.argv.indexOf("--crashafter") + 1] ?? "1", 10) : Number.POSITIVE_INFINITY;

function writeframe(frame) {
  const payload = Buffer.from(JSON.stringify(frame), "utf8");
  const head = Buffer.alloc(4);
  head.writeUInt32LE(payload.length, 0);
  process.stdout.write(Buffer.concat([head, payload]));
}

let handled = 0;
let buffer = Buffer.alloc(0);
process.stdin.on("data", chunk => {
  buffer = Buffer.concat([buffer, chunk]);
  for (;;) {
    if (buffer.length < 4) return;
    const length = buffer.readUInt32LE(0);
    if (buffer.length < 4 + length) return;
    const payload = buffer.subarray(4, 4 + length);
    buffer = buffer.subarray(4 + length);
    let frame;
    try { frame = JSON.parse(payload.toString("utf8")); } catch { continue; }
    handled += 1;
    if (handled > crashafter) process.exit(1);
    if (silent) continue;
    if (frame.kind === "handshake") {
      writeframe({ kind: "handshake", correlationid: frame.correlationid, body: { build, protocol, surfaces: ["osdialog", "notification"], wsbridgeport } });
      if (wsbridgeport > 0) writeframe({ kind: "advertisement", correlationid: frame.correlationid, body: { port: wsbridgeport, token: "fixture-token" } });
      continue;
    }
    if (frame.kind === "heartbeat") {
      writeframe({ kind: "heartbeat", correlationid: frame.correlationid, body: { at: Date.now() } });
      continue;
    }
    if (frame.kind === "call") {
      const body = frame.body ?? {};
      if (body.classconsent !== true || body.surfaceconsent !== true) {
        writeframe({ kind: "error", correlationid: frame.correlationid, body: { family: "surface", message: `The ${body.surface} surface refuses execution without an active consent grant.`, retry: "none" } });
        continue;
      }
      writeframe({ kind: "call", correlationid: frame.correlationid, body: { surface: body.surface, delivered: true, details: { fixture: true } } });
      continue;
    }
    writeframe({ kind: "error", correlationid: frame.correlationid, body: { family: "port", message: `The fake host knows no ${frame.kind} kind.`, retry: "none" } });
  }
});
process.stdin.on("end", () => process.exit(0));
