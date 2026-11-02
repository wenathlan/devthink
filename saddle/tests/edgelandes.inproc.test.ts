// # edgelandes.inproc.test — the in-process lane battery of the ninety
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
// pnpm vitest run tests/edgelandes.inproc.test.ts
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { edgelaneexecutorsinproc, inproclaneids, inproclanespecs } from "../edgelandesinproc.ts";
import { getmodality } from "../modalityregistry.ts";

/** the hard deadline every lane test rides under. */
const DEADLINEMS = 5000;

/** the twenty-four lane ids in spec order (the pinned group b contract):
 * the nineteen of the first wave, then the five seats of the wiring wave. */
const LANES = [
  "ram-tmpfs",
  "ram-mmap",
  "ram-overlayfs",
  "ram-loopram",
  "ram-gitram",
  "ram-zram",
  "ram-zswap",
  "ram-swapfile",
  "delivery-cdn",
  "delivery-wss",
  "delivery-webtransport",
  "delivery-grpc",
  "delivery-capnproto",
  "storage-libsql",
  "storage-mysql",
  "storage-postgres",
  "storage-s3",
  "browser-webcontainer",
  "local-optin",
  "runner-serverless",
  "fs-gitobjects",
  "storage-sqlite",
  "network-dns",
  "network-doh",
] as const;

/** the ram lanes: every one answers the oom guard law. */
const RAMLANES = [
  "ram-tmpfs",
  "ram-mmap",
  "ram-overlayfs",
  "ram-loopram",
  "ram-gitram",
  "ram-zram",
  "ram-zswap",
  "ram-swapfile",
] as const;

/** the json manifest lanes: every one refuses non-json payloads (the
 * first wave json seats beside the five manifest seats of the wiring
 * wave). */
const JSONLANES = [
  ...RAMLANES,
  "delivery-cdn",
  "storage-libsql",
  "storage-s3",
  "runner-serverless",
  "fs-gitobjects",
  "storage-sqlite",
  "network-dns",
  "network-doh",
] as const;

/** one deterministic sample payload per lane (the determinism and mime laws run every lane). */
const SAMPLES: Record<string, { code: string; inputs?: unknown }> = {
  "ram-tmpfs": { code: '{"mount":"tmpfs","files":{"boot.bin":"00ff10","note.txt":"48656c6c6f"}}' },
  "ram-mmap": { code: '{"window":[2,3],"bytes":"0011223344"}' },
  "ram-overlayfs": { code: '{"lower":{"a":"0011","b":"0022"},"upper":{"a":"ffee","c":"4455"}}' },
  "ram-loopram": { code: '{"sectorsize":16,"sectors":4,"writes":[[1,"aabb"],[3,"cc"]]}' },
  "ram-gitram": { code: '{"objects":[{"oid":"obj1","data":"0011"},{"oid":"obj2","data":"2233"}],"read":"obj2"}' },
  "ram-zram": { code: '{"pagesize":8,"pages":["00112233","ff"]}' },
  "ram-zswap": { code: '{"poolsize":2,"pages":["0011","2233","4455"]}' },
  "ram-swapfile": { code: '{"extents":[[0,2,"aabb"],[4,2,"ccdd"]],"read":[0,6]}' },
  "delivery-cdn": { code: '{"origin":"https://mirror.example","assets":["a.js","b.css"]}' },
  "delivery-wss": { code: "hello wss lane" },
  "delivery-webtransport": { code: "quic datagram" },
  "delivery-grpc": { code: "grpc payload" },
  "delivery-capnproto": { code: "capnp" },
  "storage-libsql": { code: '{"sql":"select 1"}' },
  "storage-mysql": { code: "saddle" },
  "storage-postgres": { code: "saddle" },
  "storage-s3": { code: '{"method":"GET","bucket":"vault","key":"edge/report.json","payload":""}' },
  "browser-webcontainer": { code: "export const answer = 42;" },
  "local-optin": { code: "", inputs: { consent: true } },
  "runner-serverless": { code: '{"isolate":"ninety","module":"export const answer = 6 * 7;"}' },
  "fs-gitobjects": {
    code: '{"repo":"vault","objects":[{"type":"blob","data":"48656c6c6f"},{"type":"tree","data":"aabb"}]}',
  },
  "storage-sqlite": { code: '{"sql":"select 1 as answer","pagesize":4096}' },
  "network-dns": { code: '{"name":"example.dev","qtype":"A"}' },
  "network-doh": { code: '{"resolver":"https://dns.devthink.test/dns-query","name":"example.dev","qtype":"AAAA"}' },
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

  it("enforces the ram quota law under the default and the declared budget", async () => {
    // the default 64 mb ceiling: a manifest declaring a 102.4 mb loop disk refuses before any allocation
    const oversize = JSON.stringify({ sectorsize: 512, sectors: 200000, writes: [] });
    await assert.rejects(() => runlane("ram-loopram", oversize), refuses("RAM_QUOTA_EXCEEDED"));
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
    const output = await runlane("delivery-wss", "hello");
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
    const output = await runlane("delivery-grpc", "grpc payload");
    const manifest = artifactof(output);
    const frame = decodehex(manifest.framehex as string);
    assert.equal(frame[0], 0x00, "the uncompressed flag");
    const length = ((frame[1] << 24) | (frame[2] << 16) | (frame[3] << 8) | frame[4]) >>> 0;
    assert.equal(length, frame.byteLength - 5, "the 4-byte big-endian prefix matches the payload length");
    assert.equal(astext(frame.slice(5)), "grpc payload", "the payload rides the frame");
  });

  it("frames the capnproto segment word aligned", async () => {
    const output = await runlane("delivery-capnproto", "capnp");
    const manifest = artifactof(output);
    const message = decodehex(manifest.messagehex as string);
    assert.equal(message.byteLength % 8, 0, "the message length is word aligned");
    assert.deepEqual(
      [message[0], message[1], message[2], message[3]],
      [0, 0, 0, 0],
      "the one segment header (segments minus one)",
    );
    const words = message[4] | (message[5] << 8) | (message[6] << 16) | (message[7] << 24);
    assert.equal(words, (message.byteLength - 8) / 8, "the header answers the word count");
    assert.equal(astext(message.slice(8, 13)), "capnp", "the payload rides the segment");
  });

  it("frames the webtransport datagram with the quic varint", async () => {
    const output = await runlane("delivery-webtransport", "quic datagram");
    const manifest = artifactof(output);
    const frame = decodehex(manifest.framehex as string);
    assert.equal(frame[0], 0x01, "the deterministic stream id varint");
    assert.equal(frame[1], 0x40, "the datagram frame type");
    assert.equal(frame[2], 13, "the varint payload length");
    assert.equal(astext(frame.slice(3)), "quic datagram", "the payload rides the frame");
  });

  it("speaks the mysql and postgres handshake byte laws", async () => {
    const mysql = artifactof(await runlane("storage-mysql", "saddle"));
    const packet = decodehex(mysql.packethex as string);
    const payloadlength = packet[0] | (packet[1] << 8) | (packet[2] << 16);
    assert.equal(payloadlength, packet.byteLength - 4, "the 3-byte little-endian payload length");
    assert.equal(packet[3], 0x00, "the sequence byte 0");
    assert.equal(packet[12], 33, "the utf8 charset byte");
    assert.ok(astext(packet).includes("saddle\0"), "the null-terminated username");
    assert.ok(astext(packet).includes("vault\0"), "the null-terminated database");
    // the auth-token law: a token replaces the zero auth response
    const tokened = artifactof(await runlane("storage-mysql", "saddle", { token: "saddle-secret-token" }));
    assert.notEqual(tokened.packethex, mysql.packethex, "the token mixes the handshake bytes");

    const postgres = artifactof(await runlane("storage-postgres", "saddle"));
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
    const request = SAMPLES["storage-s3"].code;
    const manifest = artifactof(await runlane("storage-s3", request));
    const canonical = manifest.canonical as string;
    assert.ok(canonical.startsWith("GET\n/vault/edge/report.json\n"), "the method line and the bucket path");
    assert.ok(canonical.includes("host:vault.s3.amazonaws.com"), "the host header");
    assert.match(manifest.signature as string, /^[0-9a-f]{8}$/, "the fnv-1a signature");
    // the auth-token law: the secret key mixes the signer
    const keyed = artifactof(await runlane("storage-s3", request, { secretkey: "hunter2" }));
    assert.notEqual(keyed.signature, manifest.signature, "the secret key mixes the signature");
  });

  it("compresses the zram pages with the real stored-block zlib stream", async () => {
    const output = await runlane("ram-zram", SAMPLES["ram-zram"].code);
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
    const tmpfsrun = await runlane("ram-tmpfs", SAMPLES["ram-tmpfs"].code);
    assert.deepEqual(artifactof(tmpfsrun).files, { "boot.bin": "00ff10", "note.txt": "48656c6c6f" });
    const tmpfsreport = JSON.parse(tmpfsrun.stdout) as { filecount: number; totalbytes: number };
    assert.equal(tmpfsreport.filecount, 2);
    assert.equal(tmpfsreport.totalbytes, 8);
    // mmap: the zero-copy window view
    const mmap = artifactof(await runlane("ram-mmap", SAMPLES["ram-mmap"].code));
    assert.deepEqual(mmap.window, [2, 3]);
    assert.equal(mmap.bytes, "223344", "the window view answers the mapped bytes at the offset");
    // overlayfs: the upper layer wins, the union answers
    const overlay = artifactof(await runlane("ram-overlayfs", SAMPLES["ram-overlayfs"].code));
    assert.deepEqual(overlay.files, { a: "ffee", b: "0022", c: "4455" });
    // loopram: the sector map and the disk bytes
    const loop = artifactof(await runlane("ram-loopram", SAMPLES["ram-loopram"].code));
    const disk = decodehex(loop.disk as string);
    assert.equal(disk.byteLength, 64, "the four sector disk");
    assert.deepEqual(loop.written, [1, 3], "the sector map");
    assert.equal(disk[16], 0xaa, "the sector 1 write");
    assert.equal(disk[17], 0xbb, "the sector 1 write");
    assert.equal(disk[48], 0xcc, "the sector 3 write");
    assert.equal(disk[0], 0x00, "the unwritten sectors read zero");
    // gitram: the hash table answers the read object
    const git = artifactof(await runlane("ram-gitram", SAMPLES["ram-gitram"].code));
    assert.equal(git.oid, "obj2");
    assert.equal(git.bytes, "2233");
    // swapfile: the extent table read answers the holes as zeros
    const swap = artifactof(await runlane("ram-swapfile", SAMPLES["ram-swapfile"].code));
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
    const output = await runlane("browser-webcontainer", "export const answer = 42;");
    const report = JSON.parse(output.stdout) as { exports: Record<string, unknown> };
    assert.equal(report.exports.answer, 42, "the module exports answer the export report");
    assert.deepEqual(artifactof(output), { exports: { answer: 42 } });
    // the console capture and the inputs surface ride the same seat
    const seated = await runlane(
      "browser-webcontainer",
      "console.log('seat:' + inputs.probe);\nexport const seen = inputs.probe;",
      { probe: "x" },
    );
    assert.ok(seated.stdout.includes("seat:x"), "the console surface captures the module log");
    const seatedreport = JSON.parse(seated.stdout.split("\n").at(-1) ?? "{}") as { exports: Record<string, unknown> };
    assert.equal(seatedreport.exports.seen, "x", "the frozen inputs surface reaches the module");
    // a module that throws rejects honestly (the vm error surfaces as the lane failure)
    await assert.rejects(() => runlane("browser-webcontainer", "throw new Error('boom')"), refuses("VM_MODULE_FAILED"));
  });

  it("gates the local opt-in lane behind the declared consent", async () => {
    await assert.rejects(() => runlane("local-optin", ""), refuses("LOCAL_CONSENT_REQUIRED"));
    await assert.rejects(() => runlane("local-optin", "", { consent: "true" }), refuses("LOCAL_CONSENT_REQUIRED"));
    await assert.rejects(() => runlane("local-optin", "", null), refuses("LOCAL_CONSENT_REQUIRED"));
    const granted = await runlane("local-optin", "", { consent: true });
    assert.deepEqual(JSON.parse(granted.stdout), {
      consent: true,
      scope: "declared",
      law: "the visitor machine stays untouched",
    });
    assert.deepEqual(artifactof(granted), JSON.parse(granted.stdout), "the artifact carries the consent manifest");
  });

  it("pins the cdn origin", async () => {
    await assert.rejects(
      () => runlane("delivery-cdn", JSON.stringify({ assets: ["a.js"] })),
      refuses("INVALID_LANE_PAYLOAD"),
      "a mirror manifest without an origin refuses",
    );
  });

  it("answers the wave four seat laws (the isolate, the fan-out, the page and the resolvers)", async () => {
    // serverless: the cold isolate answers its exports beside the fingerprint
    const serverless = await runlane("runner-serverless", SAMPLES["runner-serverless"].code);
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
      "runner-serverless",
      '{"isolate":"seated","module":"export const seen = inputs.probe;"}',
      { probe: "x" },
    );
    const seatedreport = JSON.parse(seated.stdout.split("\n").at(-1) ?? "{}") as { exports: Record<string, unknown> };
    assert.equal(seatedreport.exports.seen, "x", "the frozen inputs surface reaches the module");
    // a module that throws answers the honest coded refusal
    await assert.rejects(
      () => runlane("runner-serverless", '{"isolate":"boom","module":"throw new Error(\'boom\')"}'),
      refuses("VM_MODULE_FAILED"),
    );
    // git objects: the loose-object header law and the fan-out shards
    const git = artifactof(await runlane("fs-gitobjects", SAMPLES["fs-gitobjects"].code));
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
      () => runlane("fs-gitobjects", '{"repo":"vault","objects":[{"type":"delta","data":"aabb"}]}'),
      refuses("INVALID_LANE_PAYLOAD"),
      "a non-git object type refuses",
    );
    // sqlite: the page-one header law
    const sqlite = artifactof(await runlane("storage-sqlite", SAMPLES["storage-sqlite"].code));
    const header = decodehex(sqlite.headerhex as string);
    assert.equal(header.byteLength, 100, "the hundred-byte header");
    assert.equal(astext(header.subarray(0, 16)), "SQLite format 3\0", "the magic string");
    const pagesize = (header[16] << 8) | header[17];
    assert.equal(pagesize, 4096, "the big-endian page size at offset 16");
    assert.equal(header[18], 1, "the legacy write version");
    // a page size outside the power-of-two law refuses honestly
    await assert.rejects(
      () => runlane("storage-sqlite", '{"sql":"select 1","pagesize":3000}'),
      refuses("INVALID_LANE_PAYLOAD"),
      "a non power-of-two page size refuses",
    );
    // dns: the rfc1035 question bytes
    const dns = artifactof(await runlane("network-dns", SAMPLES["network-dns"].code));
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
      () => runlane("network-dns", '{"name":"example.dev","qtype":"SOA"}'),
      refuses("INVALID_LANE_PAYLOAD"),
      "an unknown qtype refuses",
    );
    // doh: the rfc8484 base64url ride over the same question bytes
    const doh = artifactof(await runlane("network-doh", SAMPLES["network-doh"].code));
    assert.ok((doh.url as string).startsWith("https://dns.devthink.test/dns-query?dns="), "the request line");
    assert.equal(doh.accept, "application/dns-message", "the accept header");
    const wire = new Uint8Array(Buffer.from(doh.dns as string, "base64url"));
    assert.equal(wire.byteLength, query.byteLength, "the base64url ride decodes back to one query");
    assert.equal((wire[25] << 8) | wire[26], 28, "the qtype AAAA of the doh sample");
    // a plaintext resolver refuses honestly
    await assert.rejects(
      () =>
        runlane("network-doh", '{"resolver":"http://dns.devthink.test/dns-query","name":"example.dev","qtype":"A"}'),
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
    await assert.rejects(() => runlane("ram-tmpfs", "42"), refuses("INVALID_LANE_PAYLOAD"));
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
