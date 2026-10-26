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
};
