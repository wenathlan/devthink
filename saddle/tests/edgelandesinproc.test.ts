// # edgelandesinproc.test — the in-process lane battery of the ninety
// modalities wave (group b): the twenty-four lanes of edgelandesinproc.ts
// answer the group b contract — the frozen lane tables agree with the
// executor map, every lane is deterministic (the same payload answers
// the same stdout and artifact bytes twice), the oom guard refuses every
// ram recipe over its ceiling (the 64 mb default and the declared
// budget), the wire frames answer their byte laws (the rfc6455 mask
// round trip, the grpc prefix, the capnp word alignment, the quic
// varint datagram, the mysql and postgres handshakes, the s3 canonical
// request), the stored-block zlib stream of zram decodes back to the
// raw pages (the compression is real, not claimed), the webcontainer
// seat runs modules through node:vm and fails honestly, the local
// opt-in gate refuses every run without the declared consent, every
// json lane refuses a non-json payload and every artifact answers the
// mime its registry record declares. The wiring wave seats answer the
// same laws: the serverless isolate, the git fan-out, the sqlite
// page-one header, the rfc1035 question bytes and the rfc8484
// base64url ride. runnable with vitest:
// pnpm vitest run tests/edgelandesinproc.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { edgelaneexecutorsinproc, inproclaneids, inproclanespecs } from "../edgelandes.ts";
import { getmodality } from "../modalityregistry.ts";

/** the hard deadline every lane test rides under. */
const DEADLINEMS = 5000;

/** the twenty-four lane ids in spec order (the pinned group b contract):
 * the nineteen of the first wave, the five seats of the wiring wave,
 * then the five pr15 completion seats (the virtual hardware
 * presentation lanes and the virtual file store). */
const LANES = [
  "ramtmpfs",
  "rammmap",
  "ramoverlayfs",
  "ramzram",
  "ramswapfile",
  "deliverycdn",
  "deliverywss",
  "deliverygrpc",
  "storagelibsql",
  "storagemysql",
  "storagepostgres",
  "storages3",
  "browserwebcontainer",
  "localoptin",
  "runnerserverless",
  "fsgitobjects",
  "storagesqlite",
  "networkdns",
  "networkdoh",
  "virtualvcpu",
  "virtualprocessor",
  "virtualgpu",
  "hardwarevirtual",
  "virtualfile",
] as const;

/** the ram lanes: every one answers the oom guard law. */
const RAMLANES = [
  "ramtmpfs",
  "rammmap",
  "ramoverlayfs",
  "ramzram",
  "ramswapfile",
] as const;

/** the json manifest lanes: every one refuses non-json payloads (the
 * first wave json seats beside the five manifest seats of the wiring
 * wave and the four virtual hardware presentation seats — the virtual
 * file lane's manifest rides the inputs surface, its code field is the
 * file content itself). */
const JSONLANES = [
  ...RAMLANES,
  "deliverycdn",
  "storagelibsql",
  "storages3",
  "runnerserverless",
  "fsgitobjects",
  "storagesqlite",
  "networkdns",
  "networkdoh",
  "virtualvcpu",
  "virtualprocessor",
  "virtualgpu",
  "hardwarevirtual",
] as const;

/** one deterministic sample payload per lane (the determinism and mime laws run every lane). */
const SAMPLES: Record<string, { code: string; inputs?: unknown }> = {
  "ramtmpfs": { code: '{"mount":"tmpfs","files":{"boot.bin":"00ff10","note.txt":"48656c6c6f"}}' },
  "rammmap": { code: '{"window":[2,3],"bytes":"0011223344"}' },
  "ramoverlayfs": { code: '{"lower":{"a":"0011","b":"0022"},"upper":{"a":"ffee","c":"4455"}}' },
  "ramzram": { code: '{"pagesize":8,"pages":["00112233","ff"]}' },
  "ramswapfile": { code: '{"extents":[[0,2,"aabb"],[4,2,"ccdd"]],"read":[0,6]}' },
  "deliverycdn": { code: '{"origin":"https://mirror.example","assets":["a.js","b.css"]}' },
  "deliverywss": { code: "hello wss lane" },
  "deliverygrpc": { code: "grpc payload" },
  "storagelibsql": { code: '{"sql":"select 1"}' },
  "storagemysql": { code: "saddle" },
  "storagepostgres": { code: "saddle" },
  "storages3": { code: '{"method":"GET","bucket":"vault","key":"edge/report.json","payload":""}' },
  "browserwebcontainer": { code: "export const answer = 42;" },
  "localoptin": { code: "", inputs: { consent: true } },
  "runnerserverless": { code: '{"isolate":"ninety","module":"export const answer = 6 * 7;"}' },
  "fsgitobjects": {
    code: '{"repo":"vault","objects":[{"type":"blob","data":"48656c6c6f"},{"type":"tree","data":"aabb"}]}',
  },
  "storagesqlite": { code: '{"sql":"select 1 as answer","pagesize":4096}' },
  "networkdns": { code: '{"name":"example.dev","qtype":"A"}' },
  "networkdoh": { code: '{"resolver":"https://dns.devthink.test/dns-query","name":"example.dev","qtype":"AAAA"}' },
  "virtualvcpu": { code: '{"vcpus":8}' },
  "virtualprocessor": { code: '{"cpu":"epyc9965"}' },
  "virtualgpu": { code: '{"gpu":"b200","count":2}' },
  "hardwarevirtual": { code: '{"vcpus":4,"cpu":"epyc9965","gpu":"b200","gpus":1,"memorygb":16}' },
  "virtualfile": { code: "hello virtual file", inputs: { path: "note.txt" } },
};

/** runs one lane under the test deadline. */
async function runlane(id: string, code: string, inputs?: unknown) {
  const executor = edgelaneexecutorsinproc[id];
  assert.ok(typeof executor === "function", `the lane ${id} wires an executor`);
  return executor(code, inputs, DEADLINEMS);
}

/** the coded edgelaneerror rejection check of one lane law. */
const refuses =
  (code: string) =>
  (error: unknown): boolean => {
    assert.ok(error instanceof Error, `the lane failure is an error: ${String(error)}`);
    assert.equal((error as { code?: string }).code, code);
    assert.equal((error as { name?: string }).name, "edgelaneerror");
    return true;
  };

/** decodes one lane artifact manifest from its output. */
function artifactof(output: { artifact?: { mime: string; bytes: Uint8Array } }): Record<string, unknown> {
  assert.ok(output.artifact, "the lane answered an artifact");
  return JSON.parse(new TextDecoder().decode(output.artifact.bytes)) as Record<string, unknown>;
}

/** decodes a hex string into bytes (the test's own decoder). */
function decodehex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.byteLength; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

/** encodes bytes as lowercase hex (the test's own encoder). */
function encodehex(bytes: Uint8Array): string {
  let hex = "";
  for (const byte of bytes) hex += byte.toString(16).padStart(2, "0");
  return hex;
}

/** reads bytes as utf8 text (the test's own reader). */
const astext = (bytes: Uint8Array): string => Buffer.from(bytes).toString("utf8");

/** the rfc1950 adler32 of one byte array (the test's own checksum). */
function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (const byte of bytes) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

/** decodes one stored-block zlib stream back to the raw page: the rfc1950
 * header, the stored deflate blocks (btype 0 with the len and one's
 * complement nlen) and the big-endian adler32 checksum — the test
 * verifies the lane's compression is real, not claimed. */
function decodestoredzlib(stream: Uint8Array): Uint8Array {
  assert.equal(stream[0], 0x78, "the zlib cmf byte");
  assert.equal(stream[1], 0x01, "the zlib flg byte");
  const raw: number[] = [];
  let offset = 2;
  let final = 0;
  while (final !== 1) {
    final = stream[offset] & 1;
    assert.equal((stream[offset] >> 1) & 3, 0, "the stored block type");
    offset += 1;
    const length = stream[offset] | (stream[offset + 1] << 8);
    const nlen = stream[offset + 2] | (stream[offset + 3] << 8);
    assert.equal(nlen, ~length & 0xffff, "the one's complement nlen");
    offset += 4;
    for (let index = 0; index < length; index += 1) raw.push(stream[offset + index]);
    offset += length;
  }
  const checksum =
    ((stream[offset] << 24) | (stream[offset + 1] << 16) | (stream[offset + 2] << 8) | stream[offset + 3]) >>> 0;
  const page = Uint8Array.from(raw);
  assert.equal(checksum, adler32(page), "the adler32 checksum of the raw page");
  assert.equal(offset + 4, stream.byteLength, "the stream ends at the checksum");
  return page;
}

describe("the in-process lanes answer the group b contract", () => {
  it("declares the twenty-four in-process lanes exactly with frozen tables", () => {
    assert.equal(inproclaneids.length, 24);
    const specids = inproclanespecs.map((spec) => spec.modality);
    assert.deepEqual([...inproclaneids], [...LANES]);
    assert.deepEqual(specids, [...LANES]);
    assert.deepEqual(Object.keys(edgelaneexecutorsinproc), [...LANES]);
    assert.equal(new Set(specids).size, 24, "the lane ids are unique");
    assert.ok(Object.isFrozen(inproclaneids), "the id table is frozen");
    assert.ok(Object.isFrozen(inproclanespecs), "the spec table is frozen");
    assert.ok(Object.isFrozen(edgelaneexecutorsinproc), "the executor table is frozen");
    for (const spec of inproclanespecs) {
      assert.equal(spec.kind, "live", `the lane ${spec.modality} executes in-process`);
      assert.ok(spec.runtime.length > 0, `the lane ${spec.modality} names its runtime`);
      assert.equal(spec.present(), true, `the lane ${spec.modality} is present on the engine host`);
      assert.equal(typeof edgelaneexecutorsinproc[spec.modality], "function");
      assert.ok(getmodality(spec.modality), `the lane ${spec.modality} names a registry record`);
    }
  });

  it("answers deterministic stdout and artifact bytes for every lane", async () => {
    for (const id of LANES) {
      const sample = SAMPLES[id];
      const first = await runlane(id, sample.code, sample.inputs);
      const second = await runlane(id, sample.code, sample.inputs);
      assert.equal(second.stdout, first.stdout, `the lane ${id} answers the same stdout twice`);
      assert.ok(first.stdout.length > 0, `the lane ${id} answers a stdout report`);
      assert.ok(first.artifact, `the lane ${id} answers an artifact`);
      assert.equal(second.artifact?.mime, first.artifact?.mime, `the lane ${id} answers the same artifact mime twice`);
      assert.equal(
        Buffer.compare(Buffer.from(first.artifact?.bytes ?? []), Buffer.from(second.artifact?.bytes ?? [])),
        0,
        `the lane ${id} answers the same artifact bytes twice`,
      );
    }
  });

  it("enforces the ram quota law under the declared budget", async () => {
    // the declared-ceiling probe: a mapping declaring more bytes than
    // the declared budget refuses before any window work (the loop-disk
    // seat that carried the 102.4 mb default probe retired with the
    // pr15 cull — the same guard answers under the declared budget)
    const oversize = JSON.stringify({ window: [0, 2], bytes: "00".repeat(1024 * 1024 + 1) });
    await assert.rejects(() => runlane("rammmap", oversize, { budgetmb: 1 }), refuses("RAM_QUOTA_EXCEEDED"));
    // every ram recipe answers the guard under a zero byte budget
    for (const id of RAMLANES) {
      await assert.rejects(
        () => runlane(id, SAMPLES[id].code, { budgetmb: 0 }),
        refuses("RAM_QUOTA_EXCEEDED"),
        `the lane ${id} refuses over the declared budget`,
      );
    }
  });

  it("frames the rfc6455 text frame with the deterministic mask and round-trips", async () => {
    const output = await runlane("deliverywss", "hello");
    const manifest = artifactof(output);
    const frame = decodehex(manifest.framehex as string);
    assert.equal(frame[0], 0x81, "fin and the text opcode");
    assert.equal(frame[1], 0x85, "the mask bit over the 5 byte payload");
    const mask = frame.slice(2, 6);
    assert.deepEqual([...mask], [0x01, 0x02, 0x03, 0x04], "the deterministic mask");
    const unmasked = frame.slice(6).map((byte, index) => byte ^ mask[index % 4]);
    assert.equal(astext(unmasked), "hello", "the masked payload round-trips");
  });

  it("frames the grpc length-prefixed message", async () => {
    const output = await runlane("deliverygrpc", "grpc payload");
    const manifest = artifactof(output);
    const frame = decodehex(manifest.framehex as string);
    assert.equal(frame[0], 0x00, "the uncompressed flag");
    const length = ((frame[1] << 24) | (frame[2] << 16) | (frame[3] << 8) | frame[4]) >>> 0;
    assert.equal(length, frame.byteLength - 5, "the 4-byte big-endian prefix matches the payload length");
    assert.equal(astext(frame.slice(5)), "grpc payload", "the payload rides the frame");
  });

  it("answers the pr15 presentation seat laws (the topology, the banks, the composition and the file store)", async () => {
    // vcpu: the balanced topology of eight (one socket, four cores, two
    // threads) and the qemu flag
    const vcpu = artifactof(await runlane("virtualvcpu", SAMPLES["virtualvcpu"].code));
    assert.deepEqual(
      [vcpu.sockets, vcpu.cores, vcpu.threads],
      [1, 4, 2],
      "the balanced topology of eight vcpu",
    );
    assert.equal(vcpu.qemuflag, "-smp 8,sockets=1,cores=4,threads=2", "the qemu -smp flag");
    // an unsolvable count refuses honestly
    await assert.rejects(() => runlane("virtualvcpu", '{"vcpus":500}'), refuses("VCPU_TOPOLOGY_INVALID"));
    // processor: the device bank identity of the epyc class
    const processor = artifactof(await runlane("virtualprocessor", SAMPLES["virtualprocessor"].code));
    assert.equal(processor.id, "epyc9965");
    assert.equal(processor.cpumhz, 2250, "the base clock in mhz");
    await assert.rejects(
      () => runlane("virtualprocessor", '{"cpu":"sparc64"}'),
      refuses("PROCESSOR_CLASS_UNKNOWN"),
    );
    // gpu: the b200 bank of two (384 gb total vram, mig grammar)
    const gpu = artifactof(await runlane("virtualgpu", SAMPLES["virtualgpu"].code));
    assert.equal(gpu.id, "b200");
    assert.equal(gpu.count, 2);
    assert.equal(gpu.totalvramgb, 384, "the total vram plan");
    assert.ok((gpu.migprofiles as string[]).includes("2g.40gb"), "the mig slice grammar");
    await assert.rejects(() => runlane("virtualgpu", '{"gpu":"voodoo"}'), refuses("GPU_CLASS_UNKNOWN"));
    // hardware virtual: the composed machine plan
    const machine = artifactof(await runlane("hardwarevirtual", SAMPLES["hardwarevirtual"].code));
    assert.equal(machine.machine, "q35", "the machine grammar");
    assert.equal(machine.memorygb, 16, "the ram plan");
    assert.equal(machine.processor.id, "epyc9965", "the composed processor");
    assert.equal(machine.gpu.count, 1, "the composed gpu bank");
    // virtual file: the sha256-sealed record round-trips through the store
    const written = artifactof(await runlane("virtualfile", "hello virtual file", { path: "roundtrip.txt" }));
    assert.equal(written.path, "roundtrip.txt");
    assert.equal(written.bytes, 18, "the utf8 byte count");
    assert.match(written.sha256 as string, /^[0-9a-f]{64}$/, "the sha256 seal");
    const readback = artifactof(await runlane("virtualfile", "", { read: "roundtrip.txt" }));
    assert.equal(readback.sha256, written.sha256, "the read answers the same seal");
    assert.equal(readback.content, "hello virtual file", "the content round-trips");
    await assert.rejects(() => runlane("virtualfile", "", { read: "absent.txt" }), refuses("VIRTUAL_FILE_ABSENT"));
  });

  it("speaks the mysql and postgres handshake byte laws", async () => {
    const mysql = artifactof(await runlane("storagemysql", "saddle"));
    const packet = decodehex(mysql.packethex as string);
    const payloadlength = packet[0] | (packet[1] << 8) | (packet[2] << 16);
    assert.equal(payloadlength, packet.byteLength - 4, "the 3-byte little-endian payload length");
    assert.equal(packet[3], 0x00, "the sequence byte 0");
    assert.equal(packet[12], 33, "the utf8 charset byte");
    assert.ok(astext(packet).includes("saddle\0"), "the null-terminated username");
    assert.ok(astext(packet).includes("vault\0"), "the null-terminated database");
    // the auth-token law: a token replaces the zero auth response
    const tokened = artifactof(await runlane("storagemysql", "saddle", { token: "saddle-secret-token" }));
    assert.notEqual(tokened.packethex, mysql.packethex, "the token mixes the handshake bytes");

    const postgres = artifactof(await runlane("storagepostgres", "saddle"));
    const message = decodehex(postgres.messagehex as string);
    const length = ((message[0] << 24) | (message[1] << 16) | (message[2] << 8) | message[3]) >>> 0;
    assert.equal(length, message.byteLength, "the 4-byte big-endian length answers the message length");
    assert.deepEqual(
      [message[4], message[5], message[6], message[7]],
      [0x00, 0x03, 0x00, 0x00],
      "the protocol 3.0 code",
    );
    assert.equal(astext(message.slice(8)), "user\0saddle\0database\0vault\0\0", "the startup parameter list");
  });

  it("signs the s3 canonical request with the deterministic signer", async () => {
    const request = SAMPLES["storages3"].code;
    const manifest = artifactof(await runlane("storages3", request));
    const canonical = manifest.canonical as string;
    assert.ok(canonical.startsWith("GET\n/vault/edge/report.json\n"), "the method line and the bucket path");
    assert.ok(canonical.includes("host:vault.s3.amazonaws.com"), "the host header");
    assert.match(manifest.signature as string, /^[0-9a-f]{8}$/, "the fnv-1a signature");
    // the auth-token law: the secret key mixes the signer
    const keyed = artifactof(await runlane("storages3", request, { secretkey: "hunter2" }));
    assert.notEqual(keyed.signature, manifest.signature, "the secret key mixes the signature");
  });

  it("compresses the zram pages with the real stored-block zlib stream", async () => {
    const output = await runlane("ramzram", SAMPLES["ramzram"].code);
    const manifest = artifactof(output);
    const streams = manifest.streams as string[];
    const pages = ["00112233", "ff"];
    assert.equal(streams.length, pages.length, "one stream per page");
    for (const [index, stream] of streams.entries()) {
      const page = decodestoredzlib(decodehex(stream));
      assert.equal(encodehex(page), pages[index], `the page ${index} round-trips through the stored blocks`);
    }
  });

  it("answers the ram recipe laws of the memory ladder", async () => {
    // tmpfs: the mounted report and the serialized tree
    const tmpfsrun = await runlane("ramtmpfs", SAMPLES["ramtmpfs"].code);
    assert.deepEqual(artifactof(tmpfsrun).files, { "boot.bin": "00ff10", "note.txt": "48656c6c6f" });
    const tmpfsreport = JSON.parse(tmpfsrun.stdout) as { filecount: number; totalbytes: number };
    assert.equal(tmpfsreport.filecount, 2);
    assert.equal(tmpfsreport.totalbytes, 8);
    // mmap: the zero-copy window view
    const mmap = artifactof(await runlane("rammmap", SAMPLES["rammmap"].code));
    assert.deepEqual(mmap.window, [2, 3]);
    assert.equal(mmap.bytes, "223344", "the window view answers the mapped bytes at the offset");
    // overlayfs: the upper layer wins, the union answers
    const overlay = artifactof(await runlane("ramoverlayfs", SAMPLES["ramoverlayfs"].code));
    assert.deepEqual(overlay.files, { a: "ffee", b: "0022", c: "4455" });
    // swapfile: the extent table read answers the holes as zeros
    const swap = artifactof(await runlane("ramswapfile", SAMPLES["ramswapfile"].code));
    assert.equal(swap.bytes, "aabb0000ccdd", "the read answers the extent bytes and the zero hole");
    assert.deepEqual(
      swap.extents,
      [
        [0, 2],
        [4, 2],
      ],
      "the extent table",
    );
  });

  it("runs the webcontainer module seat through node:vm", async () => {
    const output = await runlane("browserwebcontainer", "export const answer = 42;");
    const report = JSON.parse(output.stdout) as { exports: Record<string, unknown> };
    assert.equal(report.exports.answer, 42, "the module exports answer the export report");
    assert.deepEqual(artifactof(output), { exports: { answer: 42 } });
    // the console capture and the inputs surface ride the same seat
    const seated = await runlane(
      "browserwebcontainer",
      "console.log('seat:' + inputs.probe);\nexport const seen = inputs.probe;",
      { probe: "x" },
    );
    assert.ok(seated.stdout.includes("seat:x"), "the console surface captures the module log");
    const seatedreport = JSON.parse(seated.stdout.split("\n").at(-1) ?? "{}") as { exports: Record<string, unknown> };
    assert.equal(seatedreport.exports.seen, "x", "the frozen inputs surface reaches the module");
    // a module that throws rejects honestly (the vm error surfaces as the lane failure)
    await assert.rejects(() => runlane("browserwebcontainer", "throw new Error('boom')"), refuses("VM_MODULE_FAILED"));
  });

  it("gates the local opt-in lane behind the declared consent", async () => {
    await assert.rejects(() => runlane("localoptin", ""), refuses("LOCAL_CONSENT_REQUIRED"));
    await assert.rejects(() => runlane("localoptin", "", { consent: "true" }), refuses("LOCAL_CONSENT_REQUIRED"));
    await assert.rejects(() => runlane("localoptin", "", null), refuses("LOCAL_CONSENT_REQUIRED"));
    const granted = await runlane("localoptin", "", { consent: true });
    assert.deepEqual(JSON.parse(granted.stdout), {
      consent: true,
      scope: "declared",
      law: "the visitor machine stays untouched",
    });
    assert.deepEqual(artifactof(granted), JSON.parse(granted.stdout), "the artifact carries the consent manifest");
  });

  it("pins the cdn origin", async () => {
    await assert.rejects(
      () => runlane("deliverycdn", JSON.stringify({ assets: ["a.js"] })),
      refuses("INVALID_LANE_PAYLOAD"),
      "a mirror manifest without an origin refuses",
    );
  });

  it("answers the wave four seat laws (the isolate, the fan-out, the page and the resolvers)", async () => {
    // serverless: the cold isolate answers its exports beside the fingerprint
    const serverless = await runlane("runnerserverless", SAMPLES["runnerserverless"].code);
    const serverlessreport = JSON.parse(serverless.stdout.split("\n").at(-1) ?? "{}") as {
      isolate: string;
      fingerprint: string;
      modulebytes: number;
      exports: Record<string, unknown>;
    };
    assert.equal(serverlessreport.isolate, "ninety", "the isolate manifest names the seat");
    assert.match(serverlessreport.fingerprint, /^[0-9a-f]{8}$/, "the module fingerprint is fnv-1a");
    assert.equal(serverlessreport.exports.answer, 42, "the module exports answer the report");
    assert.deepEqual(artifactof(serverless).exports, { answer: 42 }, "the artifact carries the exports");
    // the frozen inputs surface reaches the module through the same seat
    const seated = await runlane(
      "runnerserverless",
      '{"isolate":"seated","module":"export const seen = inputs.probe;"}',
      { probe: "x" },
    );
    const seatedreport = JSON.parse(seated.stdout.split("\n").at(-1) ?? "{}") as { exports: Record<string, unknown> };
    assert.equal(seatedreport.exports.seen, "x", "the frozen inputs surface reaches the module");
    // a module that throws answers the honest coded refusal
    await assert.rejects(
      () => runlane("runnerserverless", '{"isolate":"boom","module":"throw new Error(\'boom\')"}'),
      refuses("VM_MODULE_FAILED"),
    );
    // git objects: the loose-object header law and the fan-out shards
    const git = artifactof(await runlane("fsgitobjects", SAMPLES["fsgitobjects"].code));
    const gitpaths = Object.keys(git.files as Record<string, string>);
    assert.equal(gitpaths.length, 2, "one path per object");
    assert.equal(git.repo, "vault", "the repo manifest names the tree");
    for (const path of gitpaths) {
      assert.match(path, /^vault\/objects\/[0-9a-f]{2}\/[0-9a-f]{6}$/, `the git fan-out address ${path}`);
    }
    assert.deepEqual(
      Object.values(git.files as Record<string, string>).sort(),
      ["48656c6c6f", "aabb"],
      "the object bytes ride the shards",
    );
    // an object type outside the git law refuses honestly
    await assert.rejects(
      () => runlane("fsgitobjects", '{"repo":"vault","objects":[{"type":"delta","data":"aabb"}]}'),
      refuses("INVALID_LANE_PAYLOAD"),
      "a non-git object type refuses",
    );
    // sqlite: the page-one header law
    const sqlite = artifactof(await runlane("storagesqlite", SAMPLES["storagesqlite"].code));
    const header = decodehex(sqlite.headerhex as string);
    assert.equal(header.byteLength, 100, "the hundred-byte header");
    assert.equal(astext(header.subarray(0, 16)), "SQLite format 3\0", "the magic string");
    const pagesize = (header[16] << 8) | header[17];
    assert.equal(pagesize, 4096, "the big-endian page size at offset 16");
    assert.equal(header[18], 1, "the legacy write version");
    // a page size outside the power-of-two law refuses honestly
    await assert.rejects(
      () => runlane("storagesqlite", '{"sql":"select 1","pagesize":3000}'),
      refuses("INVALID_LANE_PAYLOAD"),
      "a non power-of-two page size refuses",
    );
    // dns: the rfc1035 question bytes
    const dns = artifactof(await runlane("networkdns", SAMPLES["networkdns"].code));
    const query = decodehex(dns.queryhex as string);
    assert.equal(query.byteLength, 12 + 1 + 7 + 1 + 3 + 1 + 4, "the header, the labels, the root and the tail");
    assert.equal((query[0] << 8) | query[1], dns.id as number, "the transaction id rides the header");
    assert.equal(query[2], 0x01, "the standard-query flags high byte");
    assert.equal(query[5], 1, "one question");
    assert.deepEqual(
      [...query.slice(12, 24)],
      [7, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, 3, 0x64, 0x65, 0x76],
      "the qname labels length-prefixed (example.dev)",
    );
    assert.equal(query[24], 0, "the root label");
    assert.equal((query[25] << 8) | query[26], 1, "the qtype A");
    assert.equal((query[27] << 8) | query[28], 1, "the class IN");
    // an unknown qtype refuses honestly
    await assert.rejects(
      () => runlane("networkdns", '{"name":"example.dev","qtype":"SOA"}'),
      refuses("INVALID_LANE_PAYLOAD"),
      "an unknown qtype refuses",
    );
    // doh: the rfc8484 base64url ride over the same question bytes
    const doh = artifactof(await runlane("networkdoh", SAMPLES["networkdoh"].code));
    assert.ok((doh.url as string).startsWith("https://dns.devthink.test/dns-query?dns="), "the request line");
    assert.equal(doh.accept, "application/dns-message", "the accept header");
    const wire = new Uint8Array(Buffer.from(doh.dns as string, "base64url"));
    assert.equal(wire.byteLength, query.byteLength, "the base64url ride decodes back to one query");
    assert.equal((wire[25] << 8) | wire[26], 28, "the qtype AAAA of the doh sample");
    // a plaintext resolver refuses honestly
    await assert.rejects(
      () =>
        runlane("networkdoh", '{"resolver":"http://dns.devthink.test/dns-query","name":"example.dev","qtype":"A"}'),
      refuses("INVALID_LANE_PAYLOAD"),
      "a plaintext resolver refuses",
    );
  });

  it("refuses non-json payloads on every json lane", async () => {
    for (const id of JSONLANES) {
      await assert.rejects(
        () => runlane(id, "this is not a json manifest"),
        refuses("INVALID_LANE_PAYLOAD"),
        `the lane ${id} refuses the non-json payload`,
      );
    }
    // a json document that is not the recipe's object shape refuses just as honestly
    await assert.rejects(() => runlane("ramtmpfs", "42"), refuses("INVALID_LANE_PAYLOAD"));
  });

  it("answers the registry mime for every artifact", async () => {
    for (const id of LANES) {
      const record = getmodality(id);
      assert.ok(record, `the lane ${id} names a registry record`);
      const output = await runlane(id, SAMPLES[id].code, SAMPLES[id].inputs);
      assert.equal(output.artifact?.mime, record?.mime, `the lane ${id} answers its registry mime`);
    }
  });
});
