// # edgelandes.inproc.ts — the in-process modality lanes of the ninety
// modalities wave (group b): the ram recipes, the delivery wire frames,
// the storage wire handshakes, the webcontainer seat and the local
// opt-in gate — nineteen registry modalities wired as honest pure
// typescript execution lanes that run inside the engine process itself.
// No host binary is spawned and no network socket is opened: the code
// field is the program or payload the lane interprets (a ram recipe
// manifest, a wire payload, a sql manifest, a javascript module) and the
// lane answers real computed output — mounted trees, framed bytes,
// handshake packets, captured exports. The laws every lane keeps:
// - the visitor law: everything runs server-side in the engine process,
//   the visitor browser, gpu, cpu and storage are never touched (the
//   local-optin lane is the only lane that may even name the visitor
//   machine, and only under declared consent — and even then it answers
//   a manifest, it never touches the machine);
// - the oom guard: every ram recipe reads its byte ceiling from
//   inputs.budgetmb (the default 64 mb) and refuses to materialize a
//   single byte over it (RAM_QUOTA_EXCEEDED), reading the declared size
//   from the manifest numbers before any allocation rides;
// - the honest payload law: a lane whose manifest is not valid json or
//   not the recipe's shape answers INVALID_LANE_PAYLOAD, a module that
//   throws answers VM_MODULE_FAILED — no lane fakes a run;
// - the determinism law: fixed masks, fixed capability sets, fnv-1a
//   hashes and stored-block zlib streams — the same payload answers the
//   same bytes every run, no crypto, no randomness, no clock;
// - the artifact law: every lane answers one artifact under the mime its
//   registry record declares (the wire, disk and frame bytes ride inside
//   the artifact manifest as hex so the mime contract stays true).

import vm from "node:vm";
import { type EdgeLaneExecutor, type EdgeLaneOutput, edgelaneerror } from "./edgelandes.ts";

/* ════════════════════════════════════════════════════════════════════ */
/* Section 1: the lane contract — the in-process spec surface the dispatcher reads. */
/* ════════════════════════════════════════════════════════════════════ */

/** one in-process lane declaration: the modality id the registry and the
 * dispatcher read, the kind (every lane here executes in-process, so
 * live), the runtime surface it rides and the honest presence probe of
 * that surface. */
export interface InprocLaneSpec {
  /** the modality id of the registry record the lane wires. */
  modality: string;
  /** live lanes execute in-process; host lanes probe (none live here). */
  kind: "live" | "host";
  /** the runtime surface the lane rides ("pure-ts", "node:vm"). */
  runtime: string;
  /** the honest presence probe of the in-process surface. */
  present: () => boolean;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: the shared recipe surface — encoders, hashes and the manifest readers. */
/* ════════════════════════════════════════════════════════════════════ */

/** the artifact mime of the ram family (the registry record declares it). */
const rammime = "application/vnd.devthink.ram+json";
/** the artifact mime of the delivery family (the registry record declares it). */
const cdnmime = "application/vnd.devthink.cdn+json";
/** the artifact mime of the storage wire family (the registry record declares it). */
const storagemime = "application/vnd.devthink.storage+json";
/** the artifact mime of the browser family (the registry record declares it). */
const browsermime = "application/vnd.devthink.browser+json";
/** the artifact mime of the local family (the registry record declares it). */
const localmime = "application/vnd.devthink.local+json";
/** the default ram byte ceiling of the oom guard: 64 mb. */
const defaultbudgetmb = 64;
/** the bytes of one megabyte (the oom guard's unit). */
const bytespermib = 1048576;
/** the shared utf8 encoder of the lane surfaces. */
const utf8 = new TextEncoder();

/** the safe message of an unknown thrown value (no stack rides a lane answer). */
function errormessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error ?? "unknown lane failure");
}

/** encodes one value as one stdout line (json when possible, string otherwise). */
function encodeline(value: unknown): string {
  try {
    const encoded = JSON.stringify(value);
    return encoded === undefined ? String(value) : encoded;
  } catch {
    return String(value);
  }
}

/** encodes bytes as lowercase hex (the manifest's byte carrying form). */
function tohex(bytes: Uint8Array): string {
  let hex = "";
  for (let index = 0; index < bytes.byteLength; index += 1) hex += bytes[index].toString(16).padStart(2, "0");
  return hex;
}

/** decodes one hex string into bytes: an even-length hex string only —
 * anything else answers INVALID_LANE_PAYLOAD naming the manifest field. */
function fromhex(lane: string, value: unknown, field: string): Uint8Array {
  if (typeof value !== "string" || value.length % 2 !== 0 || /[^0-9a-fA-F]/.test(value)) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", `the lane ${lane} requires hex bytes in the manifest field ${field}`);
  }
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.byteLength; index += 1) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

/** the fnv-1a 32 hash of one string, answered as 8 lowercase hex chars —
 * the lane's deterministic content addressing (no crypto, no randomness). */
function fnv1a(text: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/** the keyed fnv-1a 32 hash — the signer's key walks the offset basis
 * before the message rides: the lane's documented deterministic signer,
 * honest about never claiming aws sigv4. */
function keyedfnv1a(key: string, message: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  for (let index = 0; index < message.length; index += 1) {
    hash ^= message.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/** parses the code field as one json object manifest: a non-json payload
 * or a non-object document answers INVALID_LANE_PAYLOAD. */
function parsemanifest(lane: string, code: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(code);
  } catch (error) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} requires a json object manifest in the code field: ${errormessage(error)}`,
    );
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", `the lane ${lane} requires a json object manifest in the code field`);
  }
  return parsed as Record<string, unknown>;
}

/** reads one non-negative safe integer manifest field. */
function manifestuint(lane: string, value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} requires a non-negative integer in the manifest field ${field}`,
    );
  }
  return value;
}

/** reads one nonempty string manifest field. */
function manifesttext(lane: string, value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} requires a nonempty string in the manifest field ${field}`,
    );
  }
  return value;
}

/** reads one [offset, length] manifest pair of non-negative integers. */
function manifestwindow(lane: string, value: unknown, field: string): [number, number] {
  if (!Array.isArray(value) || value.length !== 2) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} requires an [offset, length] pair in the manifest field ${field}`,
    );
  }
  return [manifestuint(lane, value[0], `${field}[0]`), manifestuint(lane, value[1], `${field}[1]`)];
}

/** reads one manifest file map (name → hex bytes), answering the decoded
 * entries sorted by name (code point order — no locale walks the answer). */
function manifestfiles(lane: string, value: unknown, field: string): [string, Uint8Array][] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the lane ${lane} requires a name to hex file map in the manifest field ${field}`,
    );
  }
  const entries: [string, Uint8Array][] = [];
  for (const [name, hex] of Object.entries(value)) {
    if (name.length === 0) {
      throw edgelaneerror(
        "INVALID_LANE_PAYLOAD",
        `the lane ${lane} refuses an empty file name in the manifest field ${field}`,
      );
    }
    entries.push([name, fromhex(lane, hex, `${field}.${name}`)]);
  }
  return entries.sort((left, right) => (left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0));
}

/** reads the oom guard ceiling in bytes: inputs.budgetmb (a non-negative
 * finite number of megabytes) or the 64 mb default. */
function ramceiling(inputs: unknown): number {
  if (typeof inputs === "object" && inputs !== null) {
    const budget = (inputs as Record<string, unknown>).budgetmb;
    if (typeof budget === "number" && Number.isFinite(budget) && budget >= 0) return budget * bytespermib;
  }
  return defaultbudgetmb * bytespermib;
}

/** the oom guard of every ram lane: the declared bytes the manifest asks
 * the lane to materialize are refused over the ceiling before a single
 * allocation rides. */
function assertramquota(lane: string, declaredbytes: number, inputs: unknown): void {
  const ceiling = ramceiling(inputs);
  if (declaredbytes > ceiling) {
    throw edgelaneerror(
      "RAM_QUOTA_EXCEEDED",
      `the ram lane ${lane} refuses to materialize ${declaredbytes} bytes under its ${ceiling} byte ceiling (inputs.budgetmb)`,
    );
  }
}

/** answers one lane output whose stdout is the encodeline report and
 * whose artifact is the json manifest under the lane mime. */
function lanereport(mime: string, report: unknown, manifest: unknown): EdgeLaneOutput {
  return {
    stdout: encodeline(report),
    artifact: { mime, bytes: utf8.encode(JSON.stringify(manifest)) },
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: the ram family — the memory ladder recipes under the oom guard. */
/* ════════════════════════════════════════════════════════════════════ */

/** the rfc1950 adler32 checksum of one byte array (the stored-block
 * zlib wrapper's closing word, big-endian in the stream). */
function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (let index = 0; index < bytes.byteLength; index += 1) {
    a = (a + bytes[index]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

/** compresses one byte page with the lane's real stored-block zlib
 * wrapper: the two byte rfc1950 header (0x78 0x01), the deflate stored
 * blocks (bfinal on the last block, the len and one's-complement nlen
 * little-endian, at most 65535 raw bytes per block) and the rfc1950
 * adler32 checksum big-endian — a real, deterministic,
 * decompressor-verifiable stream with no entropy coding. */
function storedzlib(page: Uint8Array): Uint8Array {
  const blockcount = Math.max(1, Math.ceil(page.byteLength / 65535));
  const stream = new Uint8Array(2 + blockcount * 5 + page.byteLength + 4);
  stream[0] = 0x78;
  stream[1] = 0x01;
  let offset = 2;
  for (let index = 0; index < blockcount; index += 1) {
    const start = index * 65535;
    const chunk = page.subarray(start, Math.min(start + 65535, page.byteLength));
    stream[offset] = index === blockcount - 1 ? 1 : 0;
    offset += 1;
    stream[offset] = chunk.byteLength & 0xff;
    stream[offset + 1] = chunk.byteLength >> 8;
    offset += 2;
    const nlen = ~chunk.byteLength & 0xffff;
    stream[offset] = nlen & 0xff;
    stream[offset + 1] = nlen >> 8;
    offset += 2;
    stream.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const checksum = adler32(page);
  stream[offset] = (checksum >>> 24) & 0xff;
  stream[offset + 1] = (checksum >>> 16) & 0xff;
  stream[offset + 2] = (checksum >>> 8) & 0xff;
  stream[offset + 3] = checksum & 0xff;
  return stream;
}

/** ram-tmpfs: the in-memory tmpfs lane. The code field is the mount
 * manifest {"mount":"tmpfs","files":{"<name>":"<hex>"}}: the lane mounts
 * the files into one in-memory tree (a map of path to bytes) under the
 * oom guard and answers the mounted report — file count and total bytes
 * on stdout, the serialized tree manifest as the artifact. */
async function ramtmpfslane(code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifest("ram-tmpfs", code);
  if (manifest.mount !== "tmpfs") {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", 'the ram-tmpfs lane requires the manifest field mount "tmpfs"');
  }
  const entries = manifestfiles("ram-tmpfs", manifest.files, "files");
  const totalbytes = entries.reduce((sum, entry) => sum + entry[1].byteLength, 0);
  assertramquota("ram-tmpfs", totalbytes, inputs);
  const tree = new Map(entries);
  const files: Record<string, string> = {};
  for (const [name, bytes] of tree) files[name] = tohex(bytes);
  return lanereport(
    rammime,
    { mount: "tmpfs", filecount: tree.size, totalbytes, files: [...tree.keys()] },
    { mount: "tmpfs", files },
  );
}

/** ram-mmap: the zero-copy byte window lane. The code field is the
 * window manifest {"window":[offset,len],"bytes":"<hex>"}: the lane
 * materializes one array buffer over the bytes (the whole mapping),
 * answers the zero-copy subarray window view inside it and reports the
 * window bounds — the window bytes ride the artifact. */
async function rammmaplane(code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifest("ram-mmap", code);
  const buffer = fromhex("ram-mmap", manifest.bytes, "bytes");
  const window = manifestwindow("ram-mmap", manifest.window, "window");
  assertramquota("ram-mmap", buffer.byteLength, inputs);
  const [offset, length] = window;
  if (length > buffer.byteLength - offset) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the ram-mmap window [${offset}, ${length}] escapes the ${buffer.byteLength} byte mapping`,
    );
  }
  const view = buffer.subarray(offset, offset + length);
  return lanereport(
    rammime,
    { bufferbytes: buffer.byteLength, window: [offset, offset + length], viewbytes: view.byteLength },
    { window: [offset, length], bytes: tohex(view) },
  );
}

/** ram-overlayfs: the layer union lane. The code field is the overlay
 * manifest {"lower":{...},"upper":{...}}: the lane merges the two layers
 * (the upper layer wins every shared name) and answers the union — the
 * declared bytes are the merged tree only, never the double count. */
async function ramoverlayfslane(code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifest("ram-overlayfs", code);
  const lower = manifestfiles("ram-overlayfs", manifest.lower, "lower");
  const upper = manifestfiles("ram-overlayfs", manifest.upper, "upper");
  const merged = new Map(lower);
  for (const [name, bytes] of upper) merged.set(name, bytes);
  let totalbytes = 0;
  const files: Record<string, string> = {};
  for (const [name, bytes] of merged) {
    totalbytes += bytes.byteLength;
    files[name] = tohex(bytes);
  }
  assertramquota("ram-overlayfs", totalbytes, inputs);
  return lanereport(
    rammime,
    { filecount: merged.size, totalbytes, lower: lower.length, upper: upper.length, merged: [...merged.keys()] },
    { files },
  );
}

/** reads the sector writes [sectorindex, hex] of the loop ram disk: the
 * sector must sit inside the disk and the payload must fit one sector. */
function manifestwrites(lane: string, value: unknown, sectorsize: number, sectors: number): [number, Uint8Array][] {
  if (!Array.isArray(value)) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", `the lane ${lane} requires a writes array in the manifest`);
  }
  const writes: [number, Uint8Array][] = [];
  for (const entry of value) {
    if (!Array.isArray(entry) || entry.length !== 2) {
      throw edgelaneerror("INVALID_LANE_PAYLOAD", `the lane ${lane} requires [sector, hex] write pairs`);
    }
    const sector = manifestuint(lane, entry[0], "writes sector");
    if (sector >= sectors) {
      throw edgelaneerror(
        "INVALID_LANE_PAYLOAD",
        `the lane ${lane} write names the sector ${sector} outside the ${sectors} sector disk`,
      );
    }
    const bytes = fromhex(lane, entry[1], "writes bytes");
    if (bytes.byteLength > sectorsize) {
      throw edgelaneerror(
        "INVALID_LANE_PAYLOAD",
        `the lane ${lane} write carries ${bytes.byteLength} bytes over the ${sectorsize} byte sector`,
      );
    }
    writes.push([sector, bytes]);
  }
  return writes;
}

/** ram-loopram: the loop ram disk lane. The code field is the disk
 * manifest {"sectorsize":n,"sectors":m,"writes":[[sector,"<hex>"],...]}:
 * the lane materializes one sector-addressed zero-filled disk — the
 * declared capacity (sectorsize * sectors) is what the oom guard reads
 * from the manifest numbers before any allocation rides — applies the
 * sector writes and answers the sector map with the disk bytes as the
 * artifact. */
async function ramloopramlane(code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifest("ram-loopram", code);
  const sectorsize = manifestuint("ram-loopram", manifest.sectorsize, "sectorsize");
  const sectors = manifestuint("ram-loopram", manifest.sectors, "sectors");
  if (sectorsize < 1) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the ram-loopram lane requires a positive sectorsize");
  }
  const capacity = sectorsize * sectors;
  if (!Number.isSafeInteger(capacity)) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the ram-loopram disk exceeds the representable byte range");
  }
  assertramquota("ram-loopram", capacity, inputs);
  const writes = manifestwrites("ram-loopram", manifest.writes ?? [], sectorsize, sectors);
  const disk = new Uint8Array(capacity);
  for (const [sector, bytes] of writes) disk.set(bytes, sector * sectorsize);
  const written = [...new Set(writes.map((write) => write[0]))].sort((left, right) => left - right);
  return lanereport(
    rammime,
    { sectorsize, sectors, capacity, written },
    { sectorsize, sectors, capacity, written, disk: tohex(disk) },
  );
}

/** ram-gitram: the git object cache lane. The code field is the object
 * manifest {"objects":[{"oid":"...","data":"<hex>"},...],"read":"oid"}:
 * the lane loads the objects into one hash table keyed by oid (a
 * repeated oid answers the last write) and answers the read object —
 * the object bytes ride the artifact. */
async function ramgitramlane(code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifest("ram-gitram", code);
  if (!Array.isArray(manifest.objects)) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the ram-gitram lane requires an objects array in the manifest");
  }
  const objects = new Map<string, Uint8Array>();
  for (const entry of manifest.objects) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      throw edgelaneerror("INVALID_LANE_PAYLOAD", "the ram-gitram lane requires {oid, data} object entries");
    }
    const record = entry as Record<string, unknown>;
    const oid = manifesttext("ram-gitram", record.oid, "objects oid");
    objects.set(oid, fromhex("ram-gitram", record.data, `objects ${oid} data`));
  }
  let totalbytes = 0;
  for (const bytes of objects.values()) totalbytes += bytes.byteLength;
  assertramquota("ram-gitram", totalbytes, inputs);
  const read = manifesttext("ram-gitram", manifest.read, "read");
  const object = objects.get(read);
  if (object === undefined) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", `the ram-gitram read names the unknown oid ${read}`);
  }
  return lanereport(
    rammime,
    { objects: objects.size, totalbytes, read, size: object.byteLength },
    { oid: read, size: object.byteLength, bytes: tohex(object) },
  );
}

/** ram-zram: the compressed page store lane. The code field is the page
 * manifest {"pagesize":n,"pages":["<hex>",...]}: the lane compresses
 * every page with the real stored-block zlib wrapper and answers the
 * per page compression ratios — the compressed streams ride the artifact. */
async function ramzramlane(code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifest("ram-zram", code);
  const pagesize = manifestuint("ram-zram", manifest.pagesize, "pagesize");
  if (pagesize < 1) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the ram-zram lane requires a positive pagesize");
  }
  if (!Array.isArray(manifest.pages)) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the ram-zram lane requires a pages array in the manifest");
  }
  const pages = manifest.pages.map((page, index) => {
    const bytes = fromhex("ram-zram", page, `pages ${index}`);
    if (bytes.byteLength > pagesize) {
      throw edgelaneerror(
        "INVALID_LANE_PAYLOAD",
        `the ram-zram page ${index} carries ${bytes.byteLength} bytes over the ${pagesize} byte page`,
      );
    }
    return bytes;
  });
  const rawbytes = pages.reduce((sum, page) => sum + page.byteLength, 0);
  assertramquota("ram-zram", rawbytes, inputs);
  const streams = pages.map((page) => storedzlib(page));
  const compressedbytes = streams.reduce((sum, stream) => sum + stream.byteLength, 0);
  const ratios = streams.map((stream, index) =>
    pages[index].byteLength === 0 ? 0 : Math.round((stream.byteLength / pages[index].byteLength) * 1000) / 1000,
  );
  return lanereport(
    rammime,
    { pagesize, pages: pages.length, rawbytes, compressedbytes, ratios },
    { pagesize, pages: pages.length, streams: streams.map((stream) => tohex(stream)) },
  );
}

/** ram-zswap: the swap front pool lane. The code field is the pool
 * manifest {"poolsize":n,"pages":["<hex>",...]}: the lane compresses
 * every page with the same stored-block zlib wrapper and admits them
 * into the LRU pool (arrival order, the oldest page evicted beyond
 * poolsize) — the pool snapshot rides the artifact. */
async function ramzswaplane(code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifest("ram-zswap", code);
  const poolsize = manifestuint("ram-zswap", manifest.poolsize, "poolsize");
  if (!Array.isArray(manifest.pages)) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the ram-zswap lane requires a pages array in the manifest");
  }
  const pages = manifest.pages.map((page, index) => fromhex("ram-zswap", page, `pages ${index}`));
  const rawbytes = pages.reduce((sum, page) => sum + page.byteLength, 0);
  assertramquota("ram-zswap", rawbytes, inputs);
  const pool = new Map<number, Uint8Array>();
  let evicted = 0;
  pages.forEach((page, index) => {
    pool.set(index, storedzlib(page));
    while (pool.size > poolsize) {
      const oldest = pool.keys().next();
      if (oldest.done === true) break;
      pool.delete(oldest.value);
      evicted += 1;
    }
  });
  let compressedbytes = 0;
  const snapshot: { page: number; raw: number; compressed: string }[] = [];
  for (const [index, stream] of pool) {
    compressedbytes += stream.byteLength;
    snapshot.push({ page: index, raw: pages[index].byteLength, compressed: tohex(stream) });
  }
  return lanereport(
    rammime,
    { poolsize, pages: pages.length, admitted: pool.size, evicted, compressedbytes },
    { poolsize, pool: snapshot },
  );
}

/** ram-swapfile: the swap extent file lane. The code field is the extent
 * manifest {"extents":[[start,len,"<hex>"],...],"read":[start,len]}: the
 * lane materializes the extent-addressed file (the extent table covers
 * the sparse holes with zero bytes) and answers the read window — the
 * extent table and the read bytes ride the artifact. */
async function ramswapfilelane(code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifest("ram-swapfile", code);
  if (!Array.isArray(manifest.extents)) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the ram-swapfile lane requires an extents array in the manifest");
  }
  const extents: { start: number; length: number; bytes: Uint8Array }[] = [];
  let filebytes = 0;
  for (const entry of manifest.extents) {
    if (!Array.isArray(entry) || entry.length !== 3) {
      throw edgelaneerror("INVALID_LANE_PAYLOAD", "the ram-swapfile lane requires [start, length, hex] extent triples");
    }
    const start = manifestuint("ram-swapfile", entry[0], "extents start");
    const length = manifestuint("ram-swapfile", entry[1], "extents length");
    if (!Number.isSafeInteger(start + length)) {
      throw edgelaneerror(
        "INVALID_LANE_PAYLOAD",
        `the ram-swapfile extent at ${start} exceeds the representable byte range`,
      );
    }
    const bytes = fromhex("ram-swapfile", entry[2], "extents bytes");
    if (bytes.byteLength !== length) {
      throw edgelaneerror(
        "INVALID_LANE_PAYLOAD",
        `the ram-swapfile extent at ${start} declares ${length} bytes but carries ${bytes.byteLength}`,
      );
    }
    extents.push({ start, length, bytes });
    if (start + length > filebytes) filebytes = start + length;
  }
  assertramquota("ram-swapfile", filebytes, inputs);
  const [readstart, readlength] = manifestwindow("ram-swapfile", manifest.read, "read");
  if (readlength > filebytes - readstart) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      `the ram-swapfile read [${readstart}, ${readlength}] escapes the ${filebytes} byte file`,
    );
  }
  const window = new Uint8Array(readlength);
  const coveredmask = new Uint8Array(readlength);
  let covered = 0;
  for (const extent of extents) {
    const from = Math.max(extent.start, readstart);
    const to = Math.min(extent.start + extent.length, readstart + readlength);
    for (let position = from; position < to; position += 1) {
      if (coveredmask[position - readstart] === 0) {
        coveredmask[position - readstart] = 1;
        covered += 1;
      }
      window[position - readstart] = extent.bytes[position - extent.start];
    }
  }
  return lanereport(
    rammime,
    {
      extents: extents.length,
      filebytes,
      read: [readstart, readstart + readlength],
      covered,
      holes: readlength - covered,
    },
    {
      read: [readstart, readlength],
      bytes: tohex(window),
      extents: extents.map((extent) => [extent.start, extent.length]),
    },
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: the delivery family — the wire frame builders. */
/* ════════════════════════════════════════════════════════════════════ */

/** the deterministic rfc6455 client mask of the wss lane. */
const wssmask = Uint8Array.of(0x01, 0x02, 0x03, 0x04);

/** builds one rfc6455 client text frame around the payload: fin and the
 * text opcode 1, the mask bit, the deterministic four byte mask, the
 * 7/16/64 bit payload length encoding and the masked payload bytes. */
function wssframe(payload: Uint8Array): Uint8Array {
  const length = payload.byteLength;
  const headerbytes = length < 126 ? 2 : length < 65536 ? 4 : 10;
  const frame = new Uint8Array(headerbytes + 4 + length);
  frame[0] = 0x81;
  if (length < 126) {
    frame[1] = 0x80 | length;
  } else if (length < 65536) {
    frame[1] = 0x80 | 126;
    frame[2] = length >> 8;
    frame[3] = length & 0xff;
  } else {
    frame[1] = 0x80 | 127;
    new DataView(frame.buffer).setBigUint64(2, BigInt(length));
  }
  frame.set(wssmask, headerbytes);
  const body = headerbytes + 4;
  for (let index = 0; index < length; index += 1) frame[body + index] = payload[index] ^ wssmask[index % 4];
  return frame;
}

/** encodes one number as a quic variable length integer (rfc 9000
 * section 16): the two bit length prefix selects the 1, 2, 4 or 8 byte
 * form of the datagram framing. */
function quicvarint(value: number): number[] {
  if (value < 64) return [value];
  if (value < 16384) return [0x40 | (value >> 8), value & 0xff];
  if (value < 1073741824) {
    return [0x80 | ((value >> 24) & 0xff), (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
  }
  const big = BigInt(value);
  const bytes = [0xc0];
  for (let shift = 56n; shift >= 0n; shift -= 8n) bytes.push(Number((big >> shift) & 0xffn));
  return bytes;
}

/** builds one grpc length-prefixed message: the one byte compressed flag
 * 0 and the four byte big-endian payload length — exactly the bytes an
 * http/2 DATA frame would carry. */
function grpcframe(payload: Uint8Array): Uint8Array {
  const frame = new Uint8Array(5 + payload.byteLength);
  frame[0] = 0x00;
  new DataView(frame.buffer).setUint32(1, payload.byteLength);
  frame.set(payload, 5);
  return frame;
}

/** builds the minimal one segment capnproto message around the payload:
 * the little-endian 32-bit header pair (the segment count 0, then the
 * segment word count) and the payload zero-padded to the 8 byte word
 * boundary — the message length always answers a whole word count. */
function capnpmessage(payload: Uint8Array): Uint8Array {
  const words = Math.ceil(payload.byteLength / 8);
  const message = new Uint8Array(8 + words * 8);
  const view = new DataView(message.buffer);
  view.setUint32(0, 0, true);
  view.setUint32(4, words, true);
  message.set(payload, 8);
  return message;
}

/** delivery-cdn: the mirror manifest lane. The code field is the mirror
 * manifest {"origin":"https://...","assets":["a.js",...]}: the lane is
 * the mirror PLANNER — it answers the content addressed key of every
 * asset (the fnv-1a 32 hash of the asset name, deterministic) and never
 * fetches anything (the fetch rides the vfs seat inside the sandbox).
 * The origin-pin law: a manifest without an origin answers
 * INVALID_LANE_PAYLOAD. */
async function deliverycdnlane(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifest("delivery-cdn", code);
  const origin = manifesttext("delivery-cdn", manifest.origin, "origin");
  if (!Array.isArray(manifest.assets)) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the delivery-cdn lane requires an assets array in the manifest");
  }
  const assets = manifest.assets.map((name) => manifesttext("delivery-cdn", name, "assets entry"));
  const entries = assets.map((name) => ({ name, key: `assets/${fnv1a(name)}` }));
  return lanereport(
    cdnmime,
    { origin, assets: entries.length, keys: entries.map((entry) => entry.key) },
    { origin, assets: entries },
  );
}

/** delivery-wss: the websocket frame writer lane. The code field is the
 * text payload: the lane builds the real rfc6455 client frame — fin and
 * the text opcode, the mask bit with the deterministic mask 0x01020304,
 * the 7/16/64 bit length encoding and the masked payload — and answers
 * the frame bytes (the first 64 ride stdout as hex, the full frame
 * rides the artifact manifest). */
async function deliverywsslane(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const payload = utf8.encode(code);
  const frame = wssframe(payload);
  const hex = tohex(frame.subarray(0, Math.min(64, frame.byteLength)));
  return lanereport(
    cdnmime,
    {
      opcode: 1,
      fin: true,
      masked: true,
      mask: "01020304",
      length: payload.byteLength,
      framebytes: frame.byteLength,
      hex,
    },
    { opcode: 1, fin: true, masked: true, mask: "01020304", length: payload.byteLength, framehex: tohex(frame) },
  );
}

/** delivery-webtransport: the http3 datagram lane. The code field is the
 * payload: the lane frames it as one quic-style DATAGRAM frame — the
 * deterministic stream id 1 as a quic varint, the datagram frame type
 * 0x40 and the varint payload length — the framed bytes ride the
 * artifact manifest. */
async function deliverywebtransportlane(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const payload = utf8.encode(code);
  const streamvarint = quicvarint(1);
  const lengthvarint = quicvarint(payload.byteLength);
  const frame = new Uint8Array(streamvarint.length + 1 + lengthvarint.length + payload.byteLength);
  frame.set(streamvarint, 0);
  frame[streamvarint.length] = 0x40;
  frame.set(lengthvarint, streamvarint.length + 1);
  frame.set(payload, streamvarint.length + 1 + lengthvarint.length);
  return lanereport(
    cdnmime,
    { type: "datagram", streamid: 1, length: payload.byteLength, framebytes: frame.byteLength },
    { streamid: 1, type: 64, length: payload.byteLength, framehex: tohex(frame) },
  );
}

/** delivery-grpc: the grpc frame lane. The code field is the text
 * payload: the lane frames it as one grpc length-prefixed message — the
 * one byte compressed flag 0 and the four byte big-endian length. */
async function deliverygrpclane(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const payload = utf8.encode(code);
  if (payload.byteLength > 0xffffffff) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the delivery-grpc frame exceeds the four byte length ceiling");
  }
  const frame = grpcframe(payload);
  return lanereport(
    cdnmime,
    { compressed: false, length: payload.byteLength, framebytes: frame.byteLength },
    { compressedflag: 0, length: payload.byteLength, framehex: tohex(frame) },
  );
}

/** delivery-capnproto: the capnproto segment lane. The code field is the
 * payload: the lane builds the minimal one segment capnproto message —
 * the little-endian 32-bit header pair (segment count 0, segment word
 * count) and the payload zero-padded to the word boundary. */
async function deliverycapnprotolane(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const payload = utf8.encode(code);
  const message = capnpmessage(payload);
  const words = (message.byteLength - 8) / 8;
  return lanereport(
    cdnmime,
    { segments: 1, words, bytes: message.byteLength },
    { segments: 1, words, messagehex: tohex(message) },
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 5: the storage wire family — the handshake speakers and the signer. */
/* ════════════════════════════════════════════════════════════════════ */

/** the mysql client capability set the lane speaks: long password, found
 * rows, long flag, connect with db, protocol 41, transactions, secure
 * connection and plugin auth — a fixed modern client set, deterministic. */
const mysqlclientflags = 0x0008a20f;

/** builds the mysql client handshake payload: the client flags and max
 * packet (little-endian), the charset 33, the 23 byte zero filler, the
 * null-terminated username, the sixteen byte auth response under its
 * length byte and the null-terminated database "vault". */
function mysqlhandshakepayload(username: Uint8Array, authresponse: Uint8Array): Uint8Array {
  const database = utf8.encode("vault");
  const payload = new Uint8Array(32 + username.byteLength + 1 + 1 + 16 + database.byteLength + 1);
  const view = new DataView(payload.buffer);
  view.setUint32(0, mysqlclientflags, true);
  view.setUint32(4, 0x01000000, true);
  payload[8] = 33;
  let offset = 32;
  payload.set(username, offset);
  offset += username.byteLength;
  payload[offset] = 0;
  offset += 1;
  payload[offset] = 16;
  offset += 1;
  payload.set(authresponse, offset);
  offset += 16;
  payload.set(database, offset);
  offset += database.byteLength;
  payload[offset] = 0;
  return payload;
}

/** the sixteen byte mysql auth response: the token's char codes (mod
 * 256) truncated or zero-padded to the fixed sixteen byte slot — the
 * auth-token law of the mysql lane. */
function mysqlauthresponse(token: unknown): Uint8Array {
  const response = new Uint8Array(16);
  if (typeof token === "string") {
    for (let index = 0; index < Math.min(16, token.length); index += 1)
      response[index] = token.charCodeAt(index) & 0xff;
  }
  return response;
}

/** builds the postgres startup message: the four byte big-endian length,
 * the protocol 3.0 code 196608 and the null-terminated parameter list
 * "user <name> database vault" closed by the empty parameter byte. */
function postgresstartup(username: string): Uint8Array {
  const body = utf8.encode(`user\0${username}\0database\0vault\0\0`);
  const message = new Uint8Array(8 + body.byteLength);
  const view = new DataView(message.buffer);
  view.setUint32(0, 8 + body.byteLength);
  view.setUint32(4, 196608);
  message.set(body, 8);
  return message;
}

/** storage-libsql: the libsql seat lane. The code field is the query
 * manifest {"sql":"select ..."}: the lane is the wire PLANNER — it
 * composes the query envelope with the deterministic statement id (the
 * fnv-1a 32 hash of the sql text); the daemon connection rides the host
 * lane, this lane never opens a socket. */
async function storagelibsqllane(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifest("storage-libsql", code);
  const sql = manifesttext("storage-libsql", manifest.sql, "sql");
  const statementid = fnv1a(sql);
  const envelope = { dialect: "libsql", sql, statementid };
  return lanereport(
    storagemime,
    {
      statementid,
      sqlbytes: utf8.encode(sql).byteLength,
      envelopebytes: utf8.encode(JSON.stringify(envelope)).byteLength,
    },
    envelope,
  );
}

/** storage-mysql: the mysql wire handshake lane. The code field is the
 * username (the default "saddle" when the field is empty): the lane
 * composes the real mysql client handshake packet — the three byte
 * little-endian payload length, the sequence byte 0 and the handshake
 * payload. The auth-token law: inputs.token replaces the zero auth
 * response with the token's char codes. */
async function storagemysqllane(code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const username = code.length > 0 ? code : "saddle";
  if (username.includes("\0")) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the storage-mysql username must not carry a nul byte");
  }
  const token = typeof inputs === "object" && inputs !== null ? (inputs as Record<string, unknown>).token : undefined;
  const payload = mysqlhandshakepayload(utf8.encode(username), mysqlauthresponse(token));
  if (payload.byteLength > 0xffffff) {
    throw edgelaneerror(
      "INVALID_LANE_PAYLOAD",
      "the storage-mysql handshake exceeds the three byte mysql length ceiling",
    );
  }
  const packet = new Uint8Array(4 + payload.byteLength);
  packet[0] = payload.byteLength & 0xff;
  packet[1] = (payload.byteLength >> 8) & 0xff;
  packet[2] = (payload.byteLength >> 16) & 0xff;
  packet[3] = 0;
  packet.set(payload, 4);
  return lanereport(
    storagemime,
    { payloadbytes: payload.byteLength, packetbytes: packet.byteLength, sequence: 0, username },
    { username, database: "vault", charset: 33, sequence: 0, length: payload.byteLength, packethex: tohex(packet) },
  );
}

/** storage-postgres: the postgres wire startup lane. The code field is
 * the username (the default "saddle"): the lane composes the real pg
 * startup message — the big-endian length, the protocol 3.0 code and
 * the null-terminated parameter list. */
async function storagepostgreslane(code: string, _inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const username = code.length > 0 ? code : "saddle";
  if (username.includes("\0")) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the storage-postgres username must not carry a nul byte");
  }
  const message = postgresstartup(username);
  return lanereport(
    storagemime,
    { length: message.byteLength, protocol: 196608, username, database: "vault" },
    { length: message.byteLength, protocol: 196608, username, database: "vault", messagehex: tohex(message) },
  );
}

/** storage-s3: the s3 request signer lane. The code field is the request
 * manifest {"method":"GET","bucket":"name","key":"path","payload":"text"}:
 * the lane composes the canonical request string (the method line, the
 * /bucket/key path, the empty query line and the host header) and signs
 * it with the lane's deterministic keyed fnv-1a signer — documented as
 * the lane's own signer, never a claim of aws sigv4. The auth-token law:
 * inputs.secretkey mixes the signer. */
async function storages3lane(code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const manifest = parsemanifest("storage-s3", code);
  const method = manifesttext("storage-s3", manifest.method, "method");
  const bucket = manifesttext("storage-s3", manifest.bucket, "bucket");
  if (bucket.includes("/")) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the storage-s3 bucket must not carry a path separator");
  }
  const key = manifesttext("storage-s3", manifest.key, "key");
  if (key.startsWith("/")) {
    throw edgelaneerror("INVALID_LANE_PAYLOAD", "the storage-s3 key must be a relative path");
  }
  const payload = typeof manifest.payload === "string" ? manifest.payload : "";
  const host = `${bucket}.s3.amazonaws.com`;
  const path = `/${bucket}/${key}`;
  const canonical = [method, path, "", "", `host:${host}`].join("\n");
  const secret =
    typeof inputs === "object" && inputs !== null ? (inputs as Record<string, unknown>).secretkey : undefined;
  const signature = keyedfnv1a(typeof secret === "string" ? secret : "", `${canonical}\n${payload}`);
  return lanereport(
    storagemime,
    { method, path, signature },
    { method, bucket, key, host, canonical, signature, signer: "fnv1a-keyed" },
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 6: the browser and local family — the webcontainer seat and the consent gate. */
/* ════════════════════════════════════════════════════════════════════ */

/** rewrites the export declarations of one module into the wrapper's
 * exports surface: export const/let/var/function/class NAME become the
 * plain binding plus one trailing exports.NAME = NAME assignment, and
 * export default EXPR becomes exports.default = EXPR. The pass is
 * deliberately tiny and deterministic — anything beyond it reaches
 * node:vm as written and the engine answers the honest syntax failure. */
function rewriteexports(code: string): string {
  const names: string[] = [];
  const lines = code.split("\n").map((line) => {
    const binding = /^(\s*)export\s+(const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/.exec(line);
    if (binding !== null) {
      names.push(binding[3]);
      return `${binding[1]}${binding[2]} ${binding[3]}${line.slice(binding[0].length)}`;
    }
    const callable = /^(\s*)export\s+(function\*?)\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/.exec(line);
    if (callable !== null) {
      names.push(callable[3]);
      return `${callable[1]}${callable[2]} ${callable[3]}${line.slice(callable[0].length)}`;
    }
    const klass = /^(\s*)export\s+class\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/.exec(line);
    if (klass !== null) {
      names.push(klass[2]);
      return `${klass[1]}class ${klass[2]}${line.slice(klass[0].length)}`;
    }
    const fallback = /^(\s*)export\s+default\s+(.+)$/.exec(line);
    if (fallback !== null) return `${fallback[1]}exports.default = ${fallback[2]}`;
    return line;
  });
  const assignments = names.map((name) => `exports.${name} = ${name};`);
  return [...lines, ...assignments].join("\n");
}

/** encodes one module export value for the exports report: the value
 * rides its json form when json can carry it, the encodeline string form
 * otherwise (a function answers its source text, an undefined answers
 * "undefined" — the encodeline pattern, json when possible). */
function exportencoding(value: unknown): unknown {
  try {
    if (JSON.stringify(value) !== undefined) return value;
  } catch {
    // the value is not json representable (a bigint, a circular
    // reference): the encodeline string form answers below
  }
  return encodeline(value);
}

/** browser-webcontainer: the in-process webcontainer seat. The code field
 * is a javascript module (like "export const answer = 42"): the lane
 * rewrites the export declarations into the wrapper's exports surface
 * and runs the module inside a fresh node:vm context that carries only
 * the frozen console and inputs surfaces (no require, no process, no
 * host globals — the server-side webcontainer law), then answers the
 * exports report. A module that throws answers VM_MODULE_FAILED
 * honestly — the vm error surfaces as the lane failure. */
async function browserwebcontainerlane(code: string, inputs: unknown, deadline: number): Promise<EdgeLaneOutput> {
  if (typeof vm.runInNewContext !== "function") {
    throw edgelaneerror(
      "HOST_RUNTIME_ABSENT",
      "the node:vm surface is absent from this engine host (the webcontainer seat never fakes a module run)",
    );
  }
  const stdoutlines: string[] = [];
  const stderrlines: string[] = [];
  const push =
    (target: string[]) =>
    (...values: unknown[]) => {
      target.push(values.map((value) => (typeof value === "string" ? value : encodeline(value))).join(" "));
    };
  const consolesurface = Object.freeze({
    log: push(stdoutlines),
    info: push(stdoutlines),
    debug: push(stdoutlines),
    warn: push(stderrlines),
    error: push(stderrlines),
  });
  const sandbox = { console: consolesurface, inputs: inputs === undefined ? null : Object.freeze(inputs as object) };
  const script = [
    '"use strict";',
    "const module = Object.freeze({ exports: {} });",
    "(function (module, exports) {",
    rewriteexports(code),
    "})(module, module.exports);",
    "module.exports;",
  ].join("\n");
  let exportsobject: unknown;
  try {
    exportsobject = vm.runInNewContext(script, sandbox, { timeout: deadline, displayErrors: true });
  } catch (error) {
    throw edgelaneerror("VM_MODULE_FAILED", `the webcontainer module failed to run: ${errormessage(error)}`, {
      stderr: stderrlines.join("\n"),
    });
  }
  const exportsrecord: Record<string, unknown> = {};
  if (typeof exportsobject === "object" && exportsobject !== null) {
    for (const [name, value] of Object.entries(exportsobject)) exportsrecord[name] = exportencoding(value);
  }
  const report = { exports: exportsrecord };
  const output: EdgeLaneOutput = {
    stdout: [...stdoutlines, encodeline(report)].join("\n"),
    artifact: { mime: browsermime, bytes: utf8.encode(JSON.stringify(report)) },
  };
  if (stderrlines.length > 0) output.stderr = stderrlines.join("\n");
  return output;
}

/** local-optin: the consent gate lane — the only lane of the plane that
 * may even name the visitor machine, and only under declared consent.
 * The lane refuses every run whose inputs do not declare consent exactly
 * true (LOCAL_CONSENT_REQUIRED), and even under consent the lane stays
 * in-process: it answers the consent manifest, the visitor machine is
 * never touched. */
async function localoptinlane(_code: string, inputs: unknown, _deadline: number): Promise<EdgeLaneOutput> {
  const consent = typeof inputs === "object" && inputs !== null && (inputs as Record<string, unknown>).consent === true;
  if (!consent) {
    throw edgelaneerror(
      "LOCAL_CONSENT_REQUIRED",
      "the local opt-in lane refuses to run without the declared consent (inputs.consent true)",
    );
  }
  const manifest = { consent: true, scope: "declared", law: "the visitor machine stays untouched" };
  return lanereport(localmime, manifest, manifest);
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 7: the lane tables — the specs, the executors and the ids. */
/* ════════════════════════════════════════════════════════════════════ */

/** the in-process lane specs: one row per wired modality, the source of
 * truth of the lane order — every lane executes (live), the pure recipe
 * and wire lanes ride the pure typescript engine surface and the
 * webcontainer seat rides node:vm. */
export const inproclanespecs: readonly InprocLaneSpec[] = Object.freeze([
  // the ram family: the memory ladder recipes
  { modality: "ram-tmpfs", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "ram-mmap", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "ram-overlayfs", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "ram-loopram", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "ram-gitram", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "ram-zram", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "ram-zswap", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "ram-swapfile", kind: "live", runtime: "pure-ts", present: () => true },
  // the delivery family: the wire frame builders
  { modality: "delivery-cdn", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "delivery-wss", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "delivery-webtransport", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "delivery-grpc", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "delivery-capnproto", kind: "live", runtime: "pure-ts", present: () => true },
  // the storage wire family: the handshake speakers and the signer
  { modality: "storage-libsql", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "storage-mysql", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "storage-postgres", kind: "live", runtime: "pure-ts", present: () => true },
  { modality: "storage-s3", kind: "live", runtime: "pure-ts", present: () => true },
  // the browser family: the server-side webcontainer seat (never the visitor's)
  {
    modality: "browser-webcontainer",
    kind: "live",
    runtime: "node:vm",
    present: () => typeof vm.runInNewContext === "function",
  },
  // the local family: the explicit consent gate
  { modality: "local-optin", kind: "live", runtime: "pure-ts", present: () => true },
]);

/** the in-process executor table: every lane of the group b contract,
 * keyed by modality id — the dispatcher refuses to boot over a lane it
 * cannot wire. */
export const edgelaneexecutorsinproc: Readonly<Record<string, EdgeLaneExecutor>> = Object.freeze({
  "ram-tmpfs": ramtmpfslane,
  "ram-mmap": rammmaplane,
  "ram-overlayfs": ramoverlayfslane,
  "ram-loopram": ramloopramlane,
  "ram-gitram": ramgitramlane,
  "ram-zram": ramzramlane,
  "ram-zswap": ramzswaplane,
  "ram-swapfile": ramswapfilelane,
  "delivery-cdn": deliverycdnlane,
  "delivery-wss": deliverywsslane,
  "delivery-webtransport": deliverywebtransportlane,
  "delivery-grpc": deliverygrpclane,
  "delivery-capnproto": deliverycapnprotolane,
  "storage-libsql": storagelibsqllane,
  "storage-mysql": storagemysqllane,
  "storage-postgres": storagepostgreslane,
  "storage-s3": storages3lane,
  "browser-webcontainer": browserwebcontainerlane,
  "local-optin": localoptinlane,
});

/** the wired lane ids in spec order — the pinned contract the parallel
 * waves and the api routes read exactly. */
export const inproclaneids: readonly string[] = Object.freeze(inproclanespecs.map((spec) => spec.modality));
