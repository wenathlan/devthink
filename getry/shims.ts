// # shims.ts — the one keyed file of the gateway shim domain: the
// consolidation law of the root (one keyword file per domain — the variant
// and correlated logics that lived scattered across the app's files
// unified into one module, every file one responsibility) merged the
// browser-face shims of the gateway lane into this seat — the node
// builtin surface (the former nodeshim.ts body below, the first section)
// and the prisma client edge (prismashim.ts, the second section) — every
// export preserved verbatim, zero logic changes (the third browser face
// of the lane, honoshim.ts, keeps its own seat: the audit fold never
// named it, and its @hono/node-server refusal answers a different
// specifier family). The side-effect order analysis the fold owed: neither
// section carries a module-scope side effect — the caution's feared
// runtime-global patching never lived in these seats (the node face is a
// pure declaration table the devthink vite plugin's resolveId alias
// redirects the node: specifiers onto, no global is ever assigned at
// import time, and the prisma face is an inert class whose constructor
// only throws on the instantiation the browser lane can never reach), and
// in the old world no importer ever loaded both files together — the
// browser graph reaches the node face through the static node: imports of
// the shared core graph and the prisma face only through the lazy dynamic
// import the os storage lane guards — so no inter-file evaluation order
// existed to preserve: the nodeshim section rides first only because its
// combined default export is the keep-first default. The collision
// census: the two waves collided on exactly one export name — the default
// (the combined builtin surface of the node face against the cjs interop
// object of the prisma face) — settled keep-first + suffix: the combined
// surface stays the module default, the interop object rides as the
// suffixed named export prismashimdefault (zero behavior change: the lazy
// db proxy of the os storage lane reads the named spelling first —
// mod.PrismaClient ?? mod.default?.PrismaClient — and the browser never
// touches the client at all); no other same-name decl lived in both
// sources (the node face's identifier table and the prisma face's single
// PrismaClient class never overlap), so no other suffix rides this file.
// The one deviation the fold carries, recorded here because the fold's
// letter would have broken the family: prismaconfig.ts — the third file
// of the audit item (devthink/docs/research.domainconsolidation.md §e
// item 10) — deliberately stays a standalone seat beside schema.prisma.
// That file evaluates defineConfig at module scope (resolveschemapath()
// probes the filesystem candidates and reads the env to answer the schema
// path and the datasource url the prisma cli consumes through --config),
// and this seat is the module the devthink browser bundle evaluates at
// boot — the vite plugin aliases every node: builtin of the shared core
// graph onto this file — so folding the config body here would run its
// candidates ladder in the browser graph, where the bare process of
// process.cwd() is undefined (the devthink define replaces only the
// literal process.env) and the whole os would white-screen before the
// first component mounts (the white-screen law), while the prisma cli's
// own contract — a default export of defineConfig's answer read through
// --config <file> — would land behind this seat's keep-first default and
// break the operator push lane. The config stays the gateway's prisma
// seat, consumed the way the schema is consumed: by path, from the tool
// that owns the contract.

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: nodeshim.ts — the browser surface of the multi-mode engines   */
/* (the first section).                                                   */
/* (consolidation note: the section rides verbatim; its combined default  */
/* export stays the module default — the keep-first seat of the one       */
/* default collision the fold found.)                                     */
/* ══════════════════════════════════════════════════════════════════════ */

/**
 * @file nodeshim.ts
 * @module engine/nodeshim
 * @description
 *  The browser surface of the multi-mode engines. The shared core graph
 *  (constants, models, fingerprint, core, the provider lineage) is authored
 *  once for node, bun AND the browser bundle, and the browser answers the
 *  neutral stubs the doctrine always described: vite's default
 *  browser-external proxy throws on the first property binding, which killed
 *  the whole module graph at import time and blanked the OS. The vite
 *  resolve.alias maps every node: builtin the graph speaks onto this one
 *  module, so the identifiers answer neutral values, the filesystem answers
 *  absent and inert, and the crypto-strong draws ride the platform
 *  randomness. Nothing server-only is faked: dns probes, readline and the
 *  scrypt/timing-safe lanes throw the same way they would on a host without
 *  them, and every caller in the browser graph already carries its guarded
 *  fallback.
 *
 *  @section os — the neutral identifiers (node:os)
 *  @section path — the pure string posix grammar (node:path)
 *  @section fs — the absent-and-inert filesystem (node:fs, node:fs/promises)
 *  @section process — the neutral process surface (node:process)
 *  @section crypto — the platform randomness surface (node:crypto)
 *  @section url — the file url converters (node:url)
 *  @section util — the inspection stubs (node:util)
 *  @depends-on the vite resolve.alias in vite.config.ts
 *  @consumed-by every engine module the browser graph links
 */

// ---------------------------------------------------------------------------
// @section os — the neutral identifiers
// ---------------------------------------------------------------------------

export const EOL = "\n";
export const arch = (): string => "wasm";
export const platform = (): string => "browser";
export const release = (): string => "";
export const type = (): string => "Browser";
export const hostname = (): string => "localhost";
export const homedir = (): string => "/";
export const tmpdir = (): string => "/tmp";
export const cpus = (): unknown[] => [];
export const totalmem = (): number => 0;
export const freemem = (): number => 0;
export const uptime = (): number => 0;
export const loadavg = (): number[] => [0, 0, 0];
export const networkInterfaces = (): unknown[] => [];
export const userInfo = (): unknown => ({ username: "devthink", uid: -1, gid: -1, homedir: "/", shell: null });
export const constants: Record<string, never> = {};

// ---------------------------------------------------------------------------
// @section path — the pure string posix grammar
// ---------------------------------------------------------------------------

const normalizeone = (value: string): string => value.replace(/\/{2,}/g, "/").replace(/\/$/, "") || "/";

export const sep = "/";
export const delimiter = ":";
export const isAbsolute = (value: string): boolean => value.startsWith("/");
export const normalize = (value: string): string => normalizeone(value);
export const join = (...parts: string[]): string => normalizeone(parts.filter(Boolean).join("/"));
export const resolve = (...parts: string[]): string => normalizeone(parts.filter(Boolean).join("/"));
export const dirname = (value: string): string => {
  const cut = normalizeone(value).lastIndexOf("/");
  return cut <= 0 ? "/" : normalizeone(value).slice(0, cut);
};
export const basename = (value: string, ext?: string): string => {
  const base = normalizeone(value).split("/").pop() ?? "";
  return ext && base.endsWith(ext) ? base.slice(0, -ext.length) : base;
};
export const extname = (value: string): string => {
  const base = normalizeone(value).split("/").pop() ?? "";
  const dot = base.lastIndexOf(".");
  return dot > 0 ? base.slice(dot) : "";
};
export const relative = (from: string, to: string): string =>
  normalizeone(to).replace(normalizeone(from), "").replace(/^\//, "") || ".";
export const posix = { sep, delimiter, isAbsolute, normalize, join, resolve, dirname, basename, extname, relative };
export const win32 = { sep: "\\", delimiter: ";", isAbsolute, normalize, join, resolve, dirname, basename, extname, relative };

// ---------------------------------------------------------------------------
// @section fs — the absent-and-inert filesystem
// ---------------------------------------------------------------------------

const absent = (name: string): never => {
  throw new Error(`[devthink browser bundle] ${name} is absent on this host`);
};

export const existsSync = (_path: string): boolean => false;
export const mkdirSync = (_path: string): undefined => undefined;
export const copyFileSync = (_from: string, _to: string): undefined => undefined;
export const cpSync = (_from: string, _to: string): undefined => undefined;
export const rmSync = (_path: string): undefined => undefined;
export const mkdtempSync = (_prefix: string): string => "/tmp";
export const writeFileSync = (_path: string, _data: string): undefined => undefined;
export const appendFileSync = (_path: string, _data: string): undefined => undefined;
export const renameSync = (_from: string, _to: string): undefined => undefined;
export const chmodSync = (_path: string, _mode: number): undefined => undefined;
export const unlinkSync = (_path: string): undefined => undefined;
export const statSync = (_path: string): never => absent("node:fs statSync");
export const readFileSync = (_path: string): never => absent("node:fs readFileSync");
/* the stream read the moved transport's static file middleware speaks at
 * module scope (the @hono/node-server family the ownership wave's config
 * bridge inlines into the browser graph) — the serve lane never runs on a
 * browser host, so the binding answers the same honest refusal the stat
 * and read lanes above carry. */
export const createReadStream = (_path: string): never => absent("node:fs createReadStream");
export const truncateSync = (_path: string, _len?: number): never => absent("node:fs truncateSync");
export const readdirSync = (_path: string): string[] => [];

export const mkdir = (_path: string): Promise<undefined> => Promise.resolve(undefined);
export const writeFile = (_path: string, _data: string): Promise<undefined> => Promise.resolve(undefined);
export const rename = (_from: string, _to: string): Promise<undefined> => Promise.resolve(undefined);
export const copyFile = (_from: string, _to: string): Promise<undefined> => Promise.resolve(undefined);
export const cp = (_from: string, _to: string): Promise<undefined> => Promise.resolve(undefined);
export const rm = (_path: string): Promise<undefined> => Promise.resolve(undefined);
export const mkdtemp = (_prefix: string): Promise<string> => Promise.resolve("/tmp");
export const appendFile = (_path: string, _data: string): Promise<undefined> => Promise.resolve(undefined);
export const access = (_path: string): Promise<undefined> => Promise.resolve(undefined);
export const readFile = (_path: string): Promise<never> => Promise.reject(absent("node:fs/promises readFile"));
export const stat = (_path: string): Promise<never> => Promise.reject(absent("node:fs/promises stat"));
export const readdir = (_path: string): Promise<string[]> => Promise.resolve([]);

// ---------------------------------------------------------------------------
// @section process — the neutral process surface
// ---------------------------------------------------------------------------

/* the version table the moved transport's node adapter speaks at module
 * scope (the @hono/node-server family the ownership wave's config bridge
 * inlines into the browser graph) — the adapter never serves on a browser
 * host, so the table answers the neutral record the identifiers doctrine
 * carries, never a faked host report: the node key rides an EMPTY string —
 * the honest "no node runtime on this host" answer — so the module-scope
 * version gate of the inlined adapter (`versions.node.split('.')` then the
 * 23 / 22.7 / 20.18 ladder) parses the empty rung, reads NaN on every
 * comparison and resolves the unsupported lane without ever throwing on
 * the undefined read that used to kill the whole workbench boot (the
 * white-screen law: one record's shape decides whether the os renders). */
export const versions: Record<string, string> = { node: "" };

// ---------------------------------------------------------------------------
// @section dns — the resolution refusal (node:dns/promises)
// ---------------------------------------------------------------------------

export const lookup = (_host: string): Promise<never> => Promise.reject(absent("node:dns/promises lookup"));

// ---------------------------------------------------------------------------
// @section crypto — the platform randomness surface
// ---------------------------------------------------------------------------

export const randomUUID = (): string => globalThis.crypto.randomUUID();
export const randomBytes = (size: number): Uint8Array => globalThis.crypto.getRandomValues(new Uint8Array(size));
export const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min)) + min;
export const createHash = (): never => absent("node:crypto createHash");
export const createHmac = (): never => absent("node:crypto createHmac");
export const scryptSync = (): never => absent("node:crypto scryptSync");
export const timingSafeEqual = (): never => absent("node:crypto timingSafeEqual");

// ---------------------------------------------------------------------------
// @section url — the file url converters
// ---------------------------------------------------------------------------

export const pathToFileURL = (value: string): URL => new URL(`file://${value}`);
export const fileURLToPath = (value: URL | string): string => String(value).replace(/^file:\/\//, "");

// ---------------------------------------------------------------------------
// @section util — the inspection stubs
// ---------------------------------------------------------------------------

export const inspect = (value: unknown): string => String(value);
export const format = (...parts: unknown[]): string =>
  parts.map((part) => (typeof part === "string" ? part : String(part))).join(" ");
export const promisify = <T>(fn: T): T => fn;

// ---------------------------------------------------------------------------
// @section zlib — the compression refusal (node:zlib)
// ---------------------------------------------------------------------------

/* the honest refusal the family doctrine pins: the compression lanes ride
 * the node hosts (the png encoder's real deflate, the tar.xz lanes), and a
 * browser graph that links the surface reads the functions without a call
 * — the import stays linkable, the call throws the same way a host without
 * the module would. every caller in the browser graph carries its guarded
 * fallback or routes the workload through the engine's own edge seats. */

export const deflateSync = (): never => absent("node:zlib deflateSync");
export const inflateSync = (): never => absent("node:zlib inflateSync");
export const gzipSync = (): never => absent("node:zlib gzipSync");
export const gunzipSync = (): never => absent("node:zlib gunzipSync");
export const deflate = (_input: unknown, _options: unknown, callback?: (error: Error) => void): void => {
  if (typeof callback === "function") callback(new Error("[getry browser face] node:zlib deflate is absent on this host"));
};
export const inflate = (_input: unknown, _options: unknown, callback?: (error: Error) => void): void => {
  if (typeof callback === "function") callback(new Error("[getry browser face] node:zlib inflate is absent on this host"));
};
export const zlibconstants: Record<string, never> = {};

// ---------------------------------------------------------------------------
// @section default — the combined surface every builtin specifier shares
// ---------------------------------------------------------------------------

export default {
  EOL,
  arch,
  platform,
  release,
  type,
  hostname,
  homedir,
  tmpdir,
  cpus,
  totalmem,
  freemem,
  uptime,
  loadavg,
  networkInterfaces,
  userInfo,
  constants,
  sep,
  delimiter,
  isAbsolute,
  normalize,
  join,
  resolve,
  dirname,
  basename,
  extname,
  relative,
  posix,
  win32,
  existsSync,
  mkdirSync,
  writeFileSync,
  appendFileSync,
  renameSync,
  chmodSync,
  unlinkSync,
  statSync,
  readFileSync,
  readdirSync,
  mkdir,
  writeFile,
  rename,
  readFile,
  stat,
  readdir,
  randomUUID,
  randomBytes,
  randomInt,
  createHash,
  createHmac,
  scryptSync,
  timingSafeEqual,
  pathToFileURL,
  fileURLToPath,
  inspect,
  format,
  promisify,
  deflateSync,
  inflateSync,
  gzipSync,
  gunzipSync,
  deflate,
  inflate,
};

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: prismashim.ts — the browser face of the prisma client edge.   */
/* (consolidation note: the cjs interop default this wave carried rides   */
/* as the suffixed named export prismashimdefault — the keep-first rule   */
/* of the one default collision; the named PrismaClient class rides       */
/* untouched and the lazy proxy of the os storage lane reads the named    */
/* spelling first, so the suffix changes zero behavior.)                  */
/* ══════════════════════════════════════════════════════════════════════ */

/**
 * @file prismashim.ts
 * @module engine/prismashim
 * @description
 *  The browser face of the prisma client edge. The lazy db surface of
 *  storage.ts speaks a dynamic import("@prisma/client") on the first
 *  database touch, and the browser condition of that package lands on
 *  index-browser.js — a bare require of the generated .prisma/client that
 *  only exists after prisma generate, so a fresh checkout (the runner)
 *  refused the whole web bundle at build time while the local machines kept
 *  passing by resolving a generated client their environments happened to
 *  carry. The browser never touches the real client (the os HD is the
 *  IndexedDB store of storage.ts §db): the vite shim plugin resolves
 *  every @prisma/client and .prisma/client specifier onto this one honest
 *  module, whose PrismaClient throws the same way a host without the client
 *  would — nothing server-only is faked, and the node and cli lanes keep
 *  the real client untouched (this module only ever serves the vite browser
 *  build).
 *
 *  @section prismaclient — the throwing PrismaClient face
 *  @depends-on the vite resolveId hook in vite.config.ts
 *  @consumed-by storage.ts (the lazy db proxy, through the shim plugin)
 */

// ---------------------------------------------------------------------------
// @section prismaclient — the throwing PrismaClient face
// ---------------------------------------------------------------------------

export class PrismaClient {
  constructor() {
    throw new Error(
      "[devthink browser bundle] @prisma/client PrismaClient is absent on this host — the browser answers the IndexedDB store of storage.ts §db",
    );
  }
}

/** the cjs interop face: a commonjs @prisma/client resolution exposes the
 * class on the default export, so the lazy db proxy of storage.ts
 * accepts both spellings the same way it does against the real client */
export const prismashimdefault = { PrismaClient };
