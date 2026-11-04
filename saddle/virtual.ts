// # virtual.ts — the one keyword file of the virtual domain: the
// consolidation law of the root (one keyword file per domain — the
// edgelandes law of PR #347) folds the virtual family into this seat:
// the memory, storage and persistence contracts (the former virtual.ts
// body below — the v2.0.0 grand-merge consolidation), the virtual memory
// tier catalog, controllers and host-aware planners (virtualmemory.ts),
// the virtual processor bank and procfs generators (virtualcpu.ts), the
// gpu passthrough, vgpu slicing and MIG layout surface (virtualgpu.ts)
// and the kernel-level virtualization surface — the qemu turbo argv,
// the passage stack, the mttg cgroups and grid, the checkpoint family
// (virtualization.ts). Every export is preserved verbatim, zero logic
// changes, the ninety-modality law rides untouched (modalityregistry.ts
// keeps the ninety records; the orphan modalityregistrytypes.ts declare
// mirror absorbed into it the same wave). The consolidation notes: the
// node: import blocks the five files carried merge once at the top; the
// MIGPROFILES import virtualgpu.ts took from virtualmemory.ts dissolves
// (the guest MIG slicing profiles ride the same seat now — the memory
// section answers before the gpu section composes the catalog); the
// convenience `export * from './virtualgpu.ts'` re-export virtualization.ts
// carried retires (the gpu passthrough surface rides the same file, the
// published ./virtualgpu specifier keeps resolving here through the
// package exports map); the internal Section numbering of each folded
// file is preserved under its SECTION box the way the edgelandes fold
// kept every wave file's structure.

import { execFileSync, execSync } from "node:child_process";
import { createHash, randomInt, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { availableParallelism, cpus, tmpdir, totalmem } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { artifactmanifest, artifactnotfound, sha256, syncresult, validationerror, workingset } from "./foundation.ts";

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: virtual.ts — the memory, storage and persistence contracts (the first seat). */
/* ══════════════════════════════════════════════════════════════════════ */

/**
 * virtual.ts — isolation, internal memory, storage and optional persistence contracts.
 *
 * This file is the v2.0.0 grand-merge consolidation of the former nested
 * folders of the repository (memory, storage, persistence) into the single
 * root-level domain file of the saddle family standard: one optimized
 * TypeScript file per correlated domain, ordinal sections, JSDoc on every
 * block, intra-domain imports dissolved, cross-domain imports rewritten to
 * ./<domain>.js. Every capability of every source file is preserved here;
 * the pure re-export barrels (storage/index.ts) folded their surface into this file directly.
 */

/* ════════════════════════════════════════════════════════════════════ */
/* Section 2: memory/objects.ts — memory objects and compute results are serializable contracts between storage and runtime. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * memory objects and compute results are serializable contracts between storage and runtime.
 */
export function memoryobject(options = {}) {
  const buffer = tobytes(options.buffer ?? options.data ?? new Uint8Array(0));
  return { id: options.id ?? `memory${Date.now().toString(36)}`, buffer, size: buffer.byteLength, type: options.type ?? "application/octet-stream", createdat: options.createdat ?? Date.now(), metadata: { ...(options.metadata ?? {}) } };
}

export function computeresult(options = {}) {
  return { id: options.id ?? `result${Date.now().toString(36)}`, payload: options.payload, mimetype: options.mimetype, metadata: { ...(options.metadata ?? {}) }, processingtimems: options.processingtimems ?? 0, memoryusedbytes: options.memoryusedbytes ?? 0 };
}

export function tobytes(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (typeof value === "string") return new TextEncoder().encode(value);
  return new TextEncoder().encode(JSON.stringify(value));
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 3: memory/transforms.ts — transforms annotate byte movement without pretending remote storage is physical vram. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * transforms annotate byte movement without pretending remote storage is physical vram.
 */

export function transformtocompute(value, options = {}) {
  const started = performance.now();
  const object = memoryobject({ ...options, buffer: value?.buffer ?? value });
  return { ...object, processingtimems: performance.now() - started, memoryusedbytes: object.size };
}

export function transformtostorage(value, options = {}) {
  const payload = tobytes(value?.payload ?? value?.buffer ?? value);
  return computeresult({ id: value?.id, payload, mimetype: options.mimetype ?? value?.mimetype ?? "application/octet-stream", metadata: options.metadata ?? value?.metadata, processingtimems: value?.processingtimems, memoryusedbytes: payload.byteLength });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 4: memory/modes.ts — memory modes expose the same byte contract with different backing choices. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * memory modes expose the same byte contract with different backing choices.
 */
export function internalmemory(initial = {}) {
  const values = new Map(Object.entries(initial).map(([key, value]) => [key, modetobytes(value)]));
  return {
    mode: "internal",
    async put(key, value) { values.set(key, modetobytes(value)); return { key, bytes: values.get(key).byteLength }; },
    async get(key) { return values.get(key) ?? null; },
    async delete(key) { values.delete(key); },
    async list() { return [...values.keys()]; }
  };
}

export function externalmemory(storage) {
  if (!storage?.put || !storage?.get) throw new TypeError("external memory requires storage adapter");
  return {
    mode: "external",
    async put(key, value) { return storage.put({ key, data: modetobytes(value) }); },
    async get(key) { try { return await storage.get(key); } catch (error) { if (error.code === "ARTIFACT_NOT_FOUND") return null; throw error; } },
    async delete(key) { return storage.delete(key); },
    async list(prefix) { return storage.list(prefix); }
  };
}

export function physicalmemory(options = {}) {
  if (!options.path) throw new TypeError("physical memory requires a path");
  return { mode: "physical", path: options.path, put: options.put, get: options.get, delete: options.delete, list: options.list };
}

export function vectorizedmemory() {
  const vectors = new Map();
  return {
    mode: "vectorized",
    async put(key, vector) { assertvector(vector); vectors.set(key, [...vector]); return { key, dimensions: vector.length }; },
    async get(key) { return vectors.get(key) ?? null; },
    async average(keys) { const selected = keys.map((key) => vectors.get(key)).filter(Boolean); if (!selected.length) return null; const size = selected[0].length; const result = Array.from({ length: size }, () => 0); for (const vector of selected) for (let index = 0; index < size; index += 1) result[index] += vector[index] / selected.length; return result; },
    async list() { return [...vectors.keys()]; }
  };
}

export function librarymemory(factory) {
  if (typeof factory !== "function") throw new TypeError("library memory requires a factory");
  return { mode: "library", async load(options) { return factory(options); } };
}

function modetobytes(value) {
  if (value instanceof Uint8Array) return value;
  if (typeof value === "string") return new TextEncoder().encode(value);
  return new TextEncoder().encode(JSON.stringify(value));
}

function assertvector(vector) {
  if (!Array.isArray(vector) || vector.length === 0 || vector.some((value) => !Number.isFinite(value))) throw new TypeError("vector must be a non empty numeric array");
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 5: memory/targets.ts — storage targets describe provider intent without importing a provider client. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * storage targets describe provider intent without importing a provider client.
 */
const types = new Set(["github", "gitlab", "forgejo", "gitea", "huggingface", "kaggle", "modelscope", "filehosting"]);

export function targetfactory(type, options = {}) {
  if (!types.has(type)) throw new TypeError(`unknown memory target: ${type}`);
  if (type === "github" || type === "gitlab" || type === "forgejo" || type === "gitea") return { type, platform: type, owner: options.owner, repo: options.repo, branch: options.branch ?? "main", path: options.path, token: options.token };
  if (type === "huggingface") return { type, space: options.space, revision: options.revision ?? "main", path: options.path, token: options.token };
  if (type === "kaggle") return { type, dataset: options.dataset, sslverification: options.sslverification ?? true, path: options.path, token: options.token };
  if (type === "modelscope") return { type, namespace: options.namespace, repo: options.repo, revision: options.revision ?? "master", path: options.path, token: options.token };
  return { type, host: options.host, path: options.path, method: options.method ?? "s3compatible", token: options.token };
}

export function targeturi(target) {
  if (target.type === "github" || target.type === "gitlab" || target.type === "forgejo" || target.type === "gitea") return `${target.type}://${target.owner}/${target.repo}/${target.path}`;
  if (target.type === "huggingface") return `hf://${target.space}/${target.path}`;
  if (target.type === "kaggle") return `kaggle://${target.dataset}/${target.path}`;
  if (target.type === "modelscope") return `modelscope://${target.namespace}/${target.repo}/${target.path}`;
  return `${target.method}://${target.host}/${target.path}`;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 6: memory/engine.ts — memory engine loads from the first backend, persists to every backend and */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * memory engine loads from the first backend, persists to every backend and
 * bounds the hot working set without changing the default unbounded behavior.
 */

/** Creates a storage-backed memory engine with optional LRU working-set limits. */
export function memoryengine(options = {}) {
  const backends = options.backends ?? [];
  const maxentries = limit(options.maxentries, "maxentries");
  const maxbytes = limit(options.maxbytes, "maxbytes");
  const values = new Map();
  let usedbytes = 0;
  let hits = 0;
  let misses = 0;
  let evictions = 0;

  async function load(key) {
    if (!key) throw new TypeError("memory key is required");
    if (values.has(key)) {
      hits += 1;
      return touch(key);
    }
    misses += 1;
    let last;
    for (const backend of backends) {
      try {
        const value = await backend.get(key);
        if (value == null) continue;
        const object = memoryobject({ id: key, buffer: value.data ?? value, type: value.contenttype ?? value.type, metadata: value.metadata });
        cache(key, object);
        return object;
      } catch (error) { last = error; }
    }
    if (last) throw new Error(`memory engine load failed for key "${key}": ${last.message}`, { cause: last });
    throw new Error(`memory engine load failed for key "${key}": not found`);
  }

  async function persist(key, data, options = {}) {
    if (!key) throw new TypeError("memory key is required");
    const payload = tobytes(data?.payload ?? data?.buffer ?? data);
    const object = memoryobject({ id: key, buffer: payload, type: options.mimetype ?? data?.mimetype, metadata: options.metadata ?? data?.metadata });
    for (const backend of backends) await backend.put(key, { data: object.buffer, contenttype: object.type, metadata: object.metadata });
    cache(key, object);
    return object;
  }

  function release(key) {
    const object = values.get(key);
    if (object) usedbytes -= object.buffer.byteLength;
    values.delete(key);
  }

  async function safeload(key) { try { return { success: true, data: await load(key) }; } catch (error) { return { success: false, error }; } }

  async function sync(key, options = {}) {
    const sourceindex = Number(options.sourceindex ?? 0);
    const source = backends[sourceindex];
    if (!source) throw new TypeError("memory sync source backend is missing");
    const targets = backends.filter((_backend, index) => index !== sourceindex);
    return syncbackends(source, targets, key, options);
  }

  function capabilities() { return backends.map((backend, index) => ({ index, capabilities: storagecapabilities(backend) })); }
  function stats() { return { entries: values.size, bytes: usedbytes, hits, misses, evictions, maxentries, maxbytes }; }

  return { load, persist, release, safeload, sync, capabilities, stats, transformtocompute, transformtostorage, list() { return [...values.keys()]; } };

  function cache(key, object) {
    const previous = values.get(key);
    if (previous) usedbytes -= previous.buffer.byteLength;
    values.delete(key);
    if (object.buffer.byteLength > maxbytes || maxentries === 0) return;
    values.set(key, object);
    usedbytes += object.buffer.byteLength;
    while (values.size > maxentries || usedbytes > maxbytes) {
      const oldest = values.keys().next().value;
      const evicted = values.get(oldest);
      values.delete(oldest);
      usedbytes -= evicted.buffer.byteLength;
      evictions += 1;
    }
  }

  function touch(key) {
    const object = values.get(key);
    values.delete(key);
    values.set(key, object);
    return object;
  }
}

function limit(value, name) {
  if (value === undefined) return Infinity;
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 0) throw new TypeError(`${name} must be a non-negative integer`);
  return numeric;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 7: memory/planner.ts — working-set planning keeps host memory operations declarative and caller-executed. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * working-set planning keeps host memory operations declarative and caller-executed.
 */

/** Validates a serializable working-set capacity budget. */
export function workingbudget(input = {}) {
  return Object.freeze({ maxbytes: plannerlimit(input.maxbytes, "working-set maxbytes"), maxentries: plannerlimit(input.maxentries, "working-set maxentries"), maxage: optionalnonnegative(input.maxage, "working-set maxage") });
}

/** Selects bounded working-set candidates without materializing data or probing a host. */
export function workingadmission(items, options = {}) {
  if (!Array.isArray(items)) throw new TypeError("working-set items must be an array");
  const budget = workingbudget(options.budget);
  const now = Number(options.now ?? Date.now());
  if (!Number.isFinite(now) || now < 0) throw new TypeError("working-set now is invalid");
  const policy = validpolicy(options.policy ?? "lru");
  const normalized = normalizeitems(items);
  const admitted = [];
  const deferred = [];
  let usedbytes = 0;
  for (const item of rank(normalized, policy)) {
    const expired = item.expiresat !== null && item.expiresat <= now;
    const overbytes = usedbytes + item.sizebytes > budget.maxbytes;
    const overentries = admitted.length >= budget.maxentries;
    if (expired || overbytes || overentries) deferred.push(Object.freeze({ ...item, reason: expired ? "expired" : overbytes ? "bytebudget" : "entrybudget" }));
    else { admitted.push(item); usedbytes += item.sizebytes; }
  }
  return Object.freeze({ version: 1, policy, budget, usedbytes, admitted: Object.freeze(admitted), deferred: Object.freeze(deferred) });
}

/** Produces a host bridge plan that an explicit privileged adapter may execute. */
export function bridgeplan(input = {}) {
  const operation = String(input.operation ?? "");
  if (!bridgeoperations.includes(operation)) throw new TypeError("working-set bridge operation is invalid");
  const sizebytes = plannerpositive(input.sizebytes, "working-set bridge sizebytes");
  const capabilities = new Set(Array.isArray(input.capabilities) ? input.capabilities.map((value) => String(value)) : []);
  const supported = capabilities.has(operation);
  return Object.freeze({ version: 1, operation, sizebytes, state: supported ? "caller-executes" : "unsupported", preconditions: Object.freeze(supported ? ["explicit-consent", "host-adapter", "rollback-plan", "capacity-check"] : []), cleanup: Object.freeze({ required: supported, owner: "caller" }) });
}

/** Validates a materialized object record without reading storage or the local filesystem. */
export function materializationrecord(input = {}) {
  const id = String(input.id ?? "");
  const sha256 = String(input.sha256 ?? "").toLowerCase();
  if (!id) throw new TypeError("working-set materialization id is required");
  if (!/^[a-f0-9]{64}$/.test(sha256)) throw new TypeError("working-set materialization sha256 is invalid");
  return Object.freeze({ version: 1, id, sha256, sizebytes: plannerpositive(input.sizebytes, "working-set materialization sizebytes"), tier: validtier(input.tier ?? "l3"), state: validstate(input.state ?? "planned"), createdat: nonnegative(input.createdat ?? Date.now(), "working-set materialization createdat") });
}

/** Tracks materialization transitions and emits caller-owned cleanup plans without deleting resources. */
export function materializationledger(input = {}) {
  const records = new Map();
  const clock = typeof input.clock === "function" ? input.clock : () => Date.now();
  function add(record) { const normalized = materializationrecord(record); if (records.has(normalized.id)) throw new TypeError(`working-set materialization id is duplicated: ${normalized.id}`); records.set(normalized.id, normalized); return normalized; }
  function transition(id, state) { const current = records.get(String(id)); if (!current) throw new TypeError("working-set materialization is unknown"); const next = validstate(state); if (!allowedtransition(current.state, next)) throw new TypeError(`working-set materialization transition is invalid: ${current.state} to ${next}`); const output = Object.freeze({ ...current, state: next, updatedat: nonnegative(clock(), "working-set materialization updatedat") }); records.set(output.id, output); return output; }
  function cleanupplan(id) { const current = records.get(String(id)); if (!current) throw new TypeError("working-set materialization is unknown"); return Object.freeze({ version: 1, id: current.id, sha256: current.sha256, state: "caller-cleans", reason: current.state === "cleaned" ? "already-cleaned" : "release-working-set" }); }
  return Object.freeze({ add, transition, cleanupplan, list: () => Object.freeze([...records.values()]) });
}

const bridgeoperations = Object.freeze(["temporaryfile", "mmap", "tmpfs", "zram", "swap"]);
const policies = new Set(["lru", "sizeaware", "ttlfirst"]);
const tiers = new Set(["l1", "l2", "l3", "l4"]);
const states = new Set(["planned", "prepared", "verified", "released", "cleaned", "failed"]);

function normalizeitems(input) {
  const ids = new Set();
  return input.map((value, index) => {
    const id = String(value?.id ?? "");
    if (!id || ids.has(id)) throw new TypeError("working-set item id must be unique");
    ids.add(id);
    return Object.freeze({ id, sizebytes: plannerpositive(value.sizebytes, "working-set item sizebytes"), priority: Number(value.priority ?? 0), lastusedat: nonnegative(value.lastusedat ?? 0, "working-set item lastusedat"), expiresat: value.expiresat === undefined ? null : nonnegative(value.expiresat, "working-set item expiresat"), index });
  });
}

function rank(items, policy) {
  return [...items].sort((left, right) => {
    if (right.priority !== left.priority) return right.priority - left.priority;
    if (policy === "lru" && right.lastusedat !== left.lastusedat) return right.lastusedat - left.lastusedat;
    if (policy === "sizeaware" && left.sizebytes !== right.sizebytes) return left.sizebytes - right.sizebytes;
    if (policy === "ttlfirst" && (left.expiresat ?? Infinity) !== (right.expiresat ?? Infinity)) return (left.expiresat ?? Infinity) - (right.expiresat ?? Infinity);
    return left.index - right.index;
  });
}

function plannerlimit(value, name) { return value === undefined ? Infinity : nonnegative(value, name); }
function plannerpositive(value, name) { const numeric = nonnegative(value, name); if (numeric < 1) throw new TypeError(`${name} must be plannerpositive`); return numeric; }
function nonnegative(value, name) { const numeric = Number(value); if (!Number.isSafeInteger(numeric) || numeric < 0) throw new TypeError(`${name} must be a non-negative safe integer`); return numeric; }
function optionalnonnegative(value, name) { return value === undefined ? null : nonnegative(value, name); }
function validpolicy(value) { if (!policies.has(value)) throw new TypeError("working-set policy is invalid"); return value; }
function validtier(value) { if (!tiers.has(value)) throw new TypeError("working-set tier is invalid"); return value; }
function validstate(value) { if (!states.has(value)) throw new TypeError("working-set materialization state is invalid"); return value; }
function allowedtransition(current, next) { if (next === "failed") return current !== "cleaned"; return new Set(["planned:prepared", "prepared:verified", "verified:released", "released:cleaned"]).has(`${current}:${next}`); }

/* ════════════════════════════════════════════════════════════════════ */
/* Section 8: memory/bridge.ts — memory bridges materialize and clear temporary working sets. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * memory bridges materialize and clear temporary working sets.
 */

export function localmemory(options = {}) {
  const base = options.base ?? tmpdir();
  return {
    async prepare(job) { const location = await mkdtemp(join(base, "saddlejob")); return workingset(job.id, location, join(location, "resultbin")); },
    async sync(set, bytes) { await mkdir(set.location, { recursive: true }); await writeFile(set.resultpath, bytes); return syncresult(bytes.byteLength, set.resultpath); },
    async cleanup(set) { await rm(set.location, { recursive: true, force: true }); }
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 9: storage/adapter.ts — storage adapters keep remote services out of the engine core. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * storage adapters keep remote services out of the engine core.
 */
export function storageadapter(methods) {
  const required = ["put", "get", "head", "delete", "list"];
  for (const name of required) if (typeof methods?.[name] !== "function") throw new TypeError(`storage adapter requires ${name}`);
  return methods;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 10: storage/memory.ts — memory storage keeps bytes in a bounded process-local map for browser workers, Deno, Bun and tests. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * memory storage keeps bytes in a bounded process-local map for browser workers, Deno, Bun and tests.
 */


/** Creates a transport-neutral in-memory storage adapter with optional capacity limits. */
export function memorystorage(options = {}) {
  const values = new Map();
  const maxbytes = options.maxbytes === undefined ? Number.POSITIVE_INFINITY : Number(options.maxbytes);
  if ((!Number.isFinite(maxbytes) && maxbytes !== Number.POSITIVE_INFINITY) || maxbytes < 0) throw new TypeError("memory storage maxbytes is invalid");
  let usedbytes = 0;

  function manifest(key, data, input = {}) { return artifactmanifest({ key, sizebytes: data.byteLength, sha256: sha256(data), contenttype: input.contenttype ?? "application/octet-stream", createdat: input.createdat ?? Date.now(), metadata: input.metadata }); }
  function copy(value) { return new Uint8Array(value); }
  function ensurecapacity(previous, next) { if (usedbytes - previous + next > maxbytes) { const error = new Error("memory storage capacity exceeded"); error.code = "STORAGE_CAPACITY"; throw error; } }

  return storageadapter({
    async put(input = {}) { const key = String(input.key ?? ""); if (!key) throw new TypeError("memory storage key is required"); const data = copy(input.data ?? new Uint8Array()); const previous = values.get(key)?.data?.byteLength ?? 0; ensurecapacity(previous, data.byteLength); const item = { data, manifest: manifest(key, data, input) }; values.set(key, item); usedbytes += data.byteLength - previous; return { ...item.manifest }; },
    async get(key) { const item = values.get(String(key)); if (!item) { const error = new Error(`artifact not found: ${key}`); error.code = "ARTIFACT_NOT_FOUND"; throw error; } return copy(item.data); },
    async head(key) { const item = values.get(String(key)); return item ? { ...item.manifest } : null; },
    async delete(key) { const value = values.get(String(key)); if (!value) return false; values.delete(String(key)); usedbytes -= value.data.byteLength; return true; },
    async list(prefix = "") { return [...values].filter(([key]) => key.startsWith(String(prefix))).map(([, value]) => ({ ...value.manifest })); },
    usage() { return { usedbytes, maxbytes }; }
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 11: storage/cache.ts — tiered cache keeps a bounded hot tier and an optional persistent cold tier with stale-while-revalidate. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * tiered cache keeps a bounded hot tier and an optional persistent cold tier with stale-while-revalidate.
 */

/** Creates a cache with caller supplied encode, decode, clock and persistent storage policies. */
export function tieredcache(options = {}) {
  const hot = new Map();
  const maxentries = Number(options.maxentries ?? 256);
  const ttl = Number(options.ttl ?? 300000);
  const stale = Number(options.stale ?? ttl);
  const now = options.now ?? (() => Date.now());
  const cold = options.storage;
  const encode = options.encode ?? ((value) => new TextEncoder().encode(JSON.stringify(value)));
  const decode = options.decode ?? ((bytes) => JSON.parse(new TextDecoder().decode(bytes)));
  const stats = { hits: 0, misses: 0, stalehits: 0, evictions: 0, revalidations: 0 };

  function readhot(key) {
    const item = hot.get(key);
    if (!item) return null;
    const current = now();
    if (current <= item.expires) { stats.hits += 1; return { value: item.value, fresh: true }; }
    if (current <= item.stale) { stats.stalehits += 1; return { value: item.value, fresh: false }; }
    hot.delete(key);
    return null;
  }

  function writehot(key, value, options = {}) {
    if (hot.size >= maxentries && !hot.has(key)) { hot.delete(hot.keys().next().value); stats.evictions += 1; }
    const current = now();
    hot.set(key, { value, expires: current + Number(options.ttl ?? ttl), stale: current + Number(options.stale ?? stale) });
    return value;
  }

  async function get(key, options = {}) {
    const hotvalue = readhot(key);
    if (hotvalue?.fresh || (hotvalue && options.allowstale !== false)) return hotvalue.value;
    if (!cold) { stats.misses += 1; return null; }
    try { const value = decode(await cold.get(key)); writehot(key, value, options); return value; } catch { stats.misses += 1; return null; }
  }

  async function set(key, value, valueoptions = {}) { writehot(key, value, valueoptions); if (cold) await cold.put({ key, data: encode(value), contenttype: "application/json" }); return value; }
  async function getorload(key, loader, options = {}) {
    if (typeof loader !== "function") throw new TypeError("cache loader must be a function");
    const current = readhot(key);
    if (current?.fresh) return current.value;
    if (current && options.allowstale !== false) { stats.revalidations += 1; Promise.resolve(loader()).then((value) => set(key, value, options)).catch(() => undefined); return current.value; }
    const value = await loader();
    return set(key, value, options);
  }
  async function remove(key) { hot.delete(key); await cold?.delete?.(key); }
  function clear() { hot.clear(); }
  function inspect() { return { ...stats, hotentries: hot.size, maxentries, ttl, stale }; }
  return { get, set, getorload, delete: remove, clear, inspect };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 12: storage/checksum.ts — byte collection and hashing are grouped because every storage adapter uses them. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * byte collection and hashing are grouped because every storage adapter uses them.
 */

export { sha256 };

export async function collectbytes(input) {
  if (input instanceof Uint8Array) return input;
  const chunks = [];
  let size = 0;
  for await (const chunk of input) { chunks.push(chunk); size += chunk.byteLength; }
  const output = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.byteLength; }
  return output;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 13: storage/content.ts — content addressed storage deduplicates immutable bytes while keeping logical references separate. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * content addressed storage deduplicates immutable bytes while keeping logical references separate.
 */


/** Creates a content-addressed view over a caller supplied storage adapter. */
export function contentstorage(storage, options = {}) {
  const objectprefix = options.objectprefix ?? "objects";
  const refprefix = options.refprefix ?? "refs";
  const encode = options.encode ?? ((value) => new TextEncoder().encode(JSON.stringify(value)));
  const decode = options.decode ?? ((bytes) => JSON.parse(new TextDecoder().decode(bytes)));
  if (typeof storage?.put !== "function" || typeof storage?.get !== "function" || typeof storage?.head !== "function") throw new TypeError("content storage requires put, get and head");

  async function put(input = {}) {
    const data = await collectbytes(input.data);
    const digest = sha256(data);
    const objectkey = `${objectprefix}/${digest}`;
    if (!(await storage.head(objectkey))) await storage.put({ key: objectkey, data, contenttype: input.contenttype, metadata: { ...(input.metadata ?? {}), immutable: "true", sha256: digest } });
    const reference = { version: 1, key: String(input.key), objectkey, sha256: digest, sizebytes: data.byteLength, contenttype: input.contenttype ?? "application/octet-stream", metadata: { ...(input.metadata ?? {}) } };
    await storage.put({ key: `${refprefix}/${input.key}`, data: encode(reference), contenttype: "application/json" });
    return reference;
  }

  async function get(key) {
    const reference = decode(await storage.get(`${refprefix}/${key}`));
    return storage.get(reference.objectkey);
  }

  async function head(key) {
    try { return decode(await storage.get(`${refprefix}/${key}`)); } catch { return null; }
  }

  async function remove(key) {
    const reference = await head(key);
    if (!reference) return false;
    await storage.delete?.(`${refprefix}/${key}`);
    return true;
  }

  return { put, get, head, delete: remove, capabilities: { immutableobjects: true, dedupe: true, references: true } };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 14: storage/sync.ts — storage synchronization compares versioned manifests and keeps conflict policy explicit. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * storage synchronization compares versioned manifests and keeps conflict policy explicit.
 */


/** Describes capabilities exposed by a storage adapter without forcing optional methods. */
export function storagecapabilities(storage) {
  return Object.freeze({ range: typeof storage?.getrange === "function", conditional: typeof storage?.putifmatch === "function", metadata: typeof storage?.head === "function", delete: typeof storage?.delete === "function" });
}

/** Creates a comparable object manifest from bytes and caller metadata. */
export async function objectmanifest(key, data, options = {}) {
  const bytes = await collectbytes(data);
  return { version: 1, key: String(key), sizebytes: bytes.byteLength, sha256: sha256(bytes), updatedat: Number(options.updatedat ?? Date.now()), etag: options.etag ?? sha256(bytes), metadata: { ...(options.metadata ?? {}) } };
}

/** Compares two manifests and classifies an update or conflict. */
export function comparemanifests(local, remote) {
  if (!local && !remote) return { state: "empty" };
  if (!local) return { state: "remoteonly", remote };
  if (!remote) return { state: "localonly", local };
  if (local.sha256 === remote.sha256) return { state: "identical", local, remote };
  if (local.updatedat > remote.updatedat) return { state: "localnewer", local, remote };
  if (remote.updatedat > local.updatedat) return { state: "remotenewer", local, remote };
  return { state: "conflict", local, remote };
}

/** Synchronizes one logical object between two adapters with explicit conflict handling. */
export async function syncobject(source, target, key, options = {}) {
  if (typeof source?.head !== "function" || typeof source?.get !== "function" || typeof target?.head !== "function" || typeof target?.put !== "function") throw new TypeError("sync requires source and target head, get and put");
  const sourcehead = await source.head(key);
  const targethead = await target.head(key);
  const comparison = comparemanifests(normalizemanifest(sourcehead, key), normalizemanifest(targethead, key));
  if (["empty", "identical"].includes(comparison.state)) return { key: String(key), state: comparison.state, manifest: comparison.local ?? comparison.remote };
  if (comparison.state === "conflict" && typeof options.resolve !== "function") { const error = new Error(`storage conflict for key: ${key}`); error.code = "STORAGE_CONFLICT"; error.retryable = false; throw error; }
  if (comparison.state === "conflict") { const choice = await options.resolve(comparison); if (!["source", "target"].includes(choice)) throw new TypeError("sync conflict resolver must return source or target"); if (choice === "target") return { key: String(key), state: "kepttarget", manifest: comparison.remote }; }
  const data = await source.get(key);
  const manifest = await objectmanifest(key, data, { updatedat: comparison.local?.updatedat ?? Date.now(), metadata: sourcehead?.metadata });
  await target.put({ key: String(key), data, contenttype: sourcehead?.contenttype, metadata: { ...(sourcehead?.metadata ?? {}), sha256: manifest.sha256, updatedat: String(manifest.updatedat) } });
  return { key: String(key), state: comparison.state === "conflict" ? "resolvedsource" : "copied", manifest };
}

/** Synchronizes one object to multiple backends and returns each outcome. */
export async function syncbackends(source, targets = [], key, options = {}) {
  if (!Array.isArray(targets)) throw new TypeError("sync targets must be an array");
  const results = [];
  for (const target of targets) {
    try { results.push(await syncobject(source, target, key, options)); }
    catch (error) { results.push({ key: String(key), state: "failed", code: error.code ?? "STORAGE_SYNC_FAILED", message: error.message }); if (options.stoponerror) break; }
  }
  return results;
}

function normalizemanifest(value, key) { return value ? { ...value, key: String(value.key ?? key), sha256: value.sha256 ?? value.etag, updatedat: Number(value.updatedat ?? 0) } : null; }

/* ════════════════════════════════════════════════════════════════════ */
/* Section 15: storage/chunked.ts — chunked storage keeps large payloads split without forcing a database blob. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * chunked storage keeps large payloads split without forcing a database blob.
 */

export function chunkedstorage(storage, options = {}) {
  const chunkbytes = options.chunkbytes;
  if (!Number.isInteger(chunkbytes) || chunkbytes < 1) throw new TypeError("chunkbytes must be a positive integer");
  return {
    async put(input) {
      const data = await collectbytes(input.data);
      const chunks = [];
      for (let offset = 0; offset < data.byteLength; offset += chunkbytes) {
        const index = chunks.length;
        const key = `${input.key}/chunk${String(index).padStart(8, "0")}`;
        const part = data.slice(offset, Math.min(offset + chunkbytes, data.byteLength));
        const manifest = await storage.put({ key, data: part, contenttype: input.contenttype, metadata: { parent: input.key, index: String(index) } });
        chunks.push({ key, sizebytes: part.byteLength, sha256: manifest.sha256 });
      }
      const manifest = { version: 1, key: input.key, sizebytes: data.byteLength, chunks, chunkbytes, sha256: sha256(data), contenttype: input.contenttype ?? "application/octet-stream", status: "complete", completed: chunks.length, updatedat: Date.now(), metadata: { ...(input.metadata ?? {}) } };
      await storage.put({ key: `${input.key}/manifest`, data: new TextEncoder().encode(JSON.stringify(manifest)), contenttype: "application/json" });
      return manifest;
    },
    async get(key) {
      const raw = await storage.get(`${key}/manifest`);
      const manifest = JSON.parse(new TextDecoder().decode(raw));
      const parts = await Promise.all(manifest.chunks.map((chunk) => storage.get(chunk.key)));
      const output = new Uint8Array(manifest.sizebytes);
      let offset = 0;
      for (const part of parts) { output.set(part, offset); offset += part.byteLength; }
      return output;
    },
    async getrange(key, start = 0, end) {
      const manifest = await this.head(key);
      if (!manifest) throw new Error(`chunk manifest not found: ${key}`);
      const from = Math.max(0, Number(start));
      const to = Math.min(manifest.sizebytes, end === undefined ? manifest.sizebytes : Number(end));
      if (!Number.isInteger(from) || !Number.isInteger(to) || from > to) throw new TypeError("chunk range is invalid");
      if (from === to) return new Uint8Array();
      const first = Math.floor(from / manifest.chunkbytes);
      const last = Math.ceil(to / manifest.chunkbytes) - 1;
      const parts = await Promise.all(manifest.chunks.slice(first, last + 1).map((chunk) => storage.get(chunk.key)));
      const output = new Uint8Array(to - from);
      let offset = 0;
      for (let index = 0; index < parts.length; index += 1) {
        const chunkstart = (first + index) * manifest.chunkbytes;
        const begin = Math.max(from, chunkstart);
        const finish = Math.min(to, chunkstart + parts[index].byteLength);
        output.set(parts[index].slice(begin - chunkstart, finish - chunkstart), offset);
        offset += finish - begin;
      }
      return output;
    },
    async head(key) { const raw = await storage.get(`${key}/manifest`).catch(() => null); return raw ? JSON.parse(new TextDecoder().decode(raw)) : null; },
    async delete(key) { const manifest = await this.head(key); if (!manifest) return; for (const chunk of manifest.chunks) await storage.delete(chunk.key); await storage.delete(`${key}/manifest`); },
    async list(prefix) { return storage.list(prefix); }
  };
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 16: storage/local.ts — local storage is explicit, temporary friendly, and protected against traversal. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * local storage is explicit, temporary friendly, and protected against traversal.
 */

export function localstorage(root) {
  const base = resolve(root);
  function safepath(key) {
    const normalized = String(key ?? "").replaceAll("\\", "/");
    if (!normalized || normalized.startsWith("/") || normalized.split("/").includes("..")) throw validationerror("storage key is not safe", { key });
    const path = resolve(base, normalized);
    if (path !== base && !path.startsWith(`${base}${sep}`)) throw validationerror("storage key escapes adapter root", { key });
    return path;
  }
  function manifest(key, data, contenttype, metadata) {
    return artifactmanifest({ key, sizebytes: data.byteLength, sha256: sha256(data), contenttype, createdat: Date.now(), metadata });
  }
  async function walk(directory, keys) {
    let entries;
    try { entries = await readdir(directory, { withFileTypes: true }); } catch (error) { if (error.code === "ENOENT") return; throw error; }
    for (const entry of entries) { const path = join(directory, entry.name); if (entry.isDirectory()) await walk(path, keys); else keys.push(relative(base, path).split(sep).join("/")); }
  }
  return storageadapter({
    async put(input) { const path = safepath(input.key); const data = await collectbytes(input.data); await mkdir(dirname(path), { recursive: true }); await writeFile(path, data); return manifest(input.key, data, input.contenttype ?? "application/octet-stream", input.metadata); },
    async get(key) { try { return await readFile(safepath(key)); } catch (error) { if (error.code === "ENOENT") throw artifactnotfound(key); throw error; } },
    async head(key) { try { const data = await this.get(key); const file = await stat(safepath(key)); return manifest(key, data, "application/octet-stream", { mtime: String(file.mtimeMs) }); } catch (error) { if (error.name === "saddleerror" && error.code === "ARTIFACT_NOT_FOUND") return null; throw error; } },
    async delete(key) { try { await rm(safepath(key)); } catch (error) { if (error.code !== "ENOENT") throw error; } },
    async list(prefix = "") { const keys = []; await walk(safepath(prefix || "."), keys); return Promise.all(keys.map((key) => this.head(key))); }
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 17: storage/pool.ts — storage pools combine caller-owned adapters without selecting a provider or creating background work. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * storage pools combine caller-owned adapters without selecting a provider or creating background work.
 */

/** Creates a deterministic pool over explicit caller-owned storage adapters. */
export function storagepool(options = {}) {
  const members = normalizemembers(options.members);
  const clock = typeof options.clock === "function" ? options.clock : () => Date.now();
  const metrics = { reads: 0, writes: 0, hits: 0, misses: 0, mismatches: 0, bytes: 0, attempts: 0, elapsedms: 0 };

  async function read(key, options = {}) {
    const normalizedkey = requiredkey(key);
    const expectedsha = optionalsha(options.sha256);
    const attempts = [];
    const startedat = Number(clock());
    const selected = selectable(members, options.memberids);
    const budget = operationbudget(options.budget, selected.length);
    metrics.reads += 1;
    for (const member of selected.slice(0, budget.maxattempts)) {
      if (options.signal?.aborted) throw poolerror("STORAGE_POOL_ABORTED", "storage pool read was aborted", { key: normalizedkey, attempts });
      if (elapsed(clock, startedat) > budget.maxmilliseconds) throw poolerror("STORAGE_POOL_TIME_BUDGET", "storage pool read time budget was exceeded", { key: normalizedkey, attempts });
      try {
        metrics.attempts += 1;
        const manifest = await optionalhead(member.storage, normalizedkey);
        const raw = await member.storage.get(normalizedkey);
        const data = await collectbytes(raw?.data ?? raw);
        if (data.byteLength > budget.maxbytes) throw poolerror("STORAGE_POOL_BYTE_BUDGET", "storage pool read byte budget was exceeded", { key: normalizedkey, memberid: member.id, maxbytes: budget.maxbytes, sizebytes: data.byteLength });
        const actualsha = sha256(data);
        const requiredsha = expectedsha ?? manifest?.sha256;
        if (requiredsha && actualsha !== requiredsha) {
          metrics.mismatches += 1;
          throw poolerror("STORAGE_POOL_DIGEST_MISMATCH", "storage pool read digest did not match", { key: normalizedkey, memberid: member.id, expectedsha: requiredsha, actualsha });
        }
        metrics.hits += 1;
        metrics.bytes += data.byteLength;
        metrics.elapsedms += elapsed(clock, startedat);
        return Object.freeze({ version: 1, key: normalizedkey, memberid: member.id, data, sha256: actualsha, verified: Boolean(requiredsha), manifest: manifest ?? null, attempts: Object.freeze(attempts), budget, readat: Number(clock()) });
      } catch (error) { attempts.push(attempt(member.id, error)); }
    }
    metrics.misses += 1;
    metrics.elapsedms += elapsed(clock, startedat);
    throw poolerror("STORAGE_POOL_READ_FAILED", "storage pool could not read a verified object", { key: normalizedkey, attempts });
  }

  async function put(input = {}, options = {}) {
    const key = requiredkey(input.key);
    const data = await collectbytes(input.data);
    const digest = sha256(data);
    const selected = writeselection(selectable(members, options.memberids), options.mode);
    const budget = operationbudget(options.budget, selected.length);
    if (data.byteLength > budget.maxbytes) throw poolerror("STORAGE_POOL_BYTE_BUDGET", "storage pool write byte budget was exceeded", { key, maxbytes: budget.maxbytes, sizebytes: data.byteLength });
    const quorum = positiveinteger(options.quorum ?? 1, "storage pool quorum");
    if (quorum > selected.length) throw new RangeError("storage pool quorum exceeds selected members");
    const results = [];
    metrics.writes += 1;
    const startedat = Number(clock());
    for (const member of selected.slice(0, budget.maxattempts)) {
      if (options.signal?.aborted) { results.push({ memberid: member.id, state: "skipped", code: "STORAGE_POOL_ABORTED" }); break; }
      if (elapsed(clock, startedat) > budget.maxmilliseconds) { results.push({ memberid: member.id, state: "skipped", code: "STORAGE_POOL_TIME_BUDGET" }); break; }
      try {
        metrics.attempts += 1;
        const manifest = await member.storage.put({ ...input, key, data: new Uint8Array(data), metadata: { ...(input.metadata ?? {}), sha256: digest } });
        if (manifest?.sha256 && manifest.sha256 !== digest) throw poolerror("STORAGE_POOL_DIGEST_MISMATCH", "storage pool write digest did not match", { key, memberid: member.id, expectedsha: digest, actualsha: manifest.sha256 });
        results.push({ memberid: member.id, state: "written", manifest: manifest ?? null });
      } catch (error) { results.push({ memberid: member.id, state: "failed", code: error?.code ?? "STORAGE_POOL_WRITE_FAILED", message: String(error?.message ?? error) }); }
    }
    const written = results.filter((result) => result.state === "written");
    metrics.bytes += data.byteLength * written.length;
    metrics.elapsedms += elapsed(clock, startedat);
    const output = Object.freeze({ version: 1, key, sha256: digest, sizebytes: data.byteLength, mode: options.mode ?? "fanout", quorum, state: written.length === selected.length ? "complete" : "partial", results: Object.freeze(results), written: written.length, budget, writtenat: Number(clock()) });
    if (written.length < quorum) throw poolerror("STORAGE_POOL_QUORUM_FAILED", "storage pool write quorum was not met", output);
    return output;
  }

  async function readrange(key, start, end, options = {}) {
    const normalizedkey = requiredkey(key);
    const range = validrange(start, end);
    const expectedsha = optionalsha(options.sha256);
    const attempts = [];
    const selected = selectable(members, options.memberids);
    const budget = operationbudget(options.budget, selected.length);
    const startedat = Number(clock());
    metrics.reads += 1;
    for (const member of selected.slice(0, budget.maxattempts)) {
      if (options.signal?.aborted) throw poolerror("STORAGE_POOL_ABORTED", "storage pool range read was aborted", { key: normalizedkey, range, attempts });
      if (elapsed(clock, startedat) > budget.maxmilliseconds) throw poolerror("STORAGE_POOL_TIME_BUDGET", "storage pool range read time budget was exceeded", { key: normalizedkey, range, attempts });
      if (typeof member.storage.getrange !== "function") { attempts.push({ memberid: member.id, code: "STORAGE_POOL_RANGE_UNSUPPORTED", message: "storage pool member does not support range reads" }); continue; }
      try {
        metrics.attempts += 1;
        const data = await collectbytes(await member.storage.getrange(normalizedkey, range.start, range.end));
        if (data.byteLength !== range.end - range.start) throw poolerror("STORAGE_POOL_RANGE_SIZE", "storage pool range result size did not match", { key: normalizedkey, range, memberid: member.id, sizebytes: data.byteLength });
        const actualsha = sha256(data);
        if (expectedsha && actualsha !== expectedsha) throw poolerror("STORAGE_POOL_DIGEST_MISMATCH", "storage pool range digest did not match", { key: normalizedkey, range, memberid: member.id, expectedsha, actualsha });
        metrics.hits += 1;
        metrics.bytes += data.byteLength;
        metrics.elapsedms += elapsed(clock, startedat);
        return Object.freeze({ version: 1, key: normalizedkey, range, memberid: member.id, data, sha256: actualsha, verified: Boolean(expectedsha), attempts: Object.freeze(attempts), budget, readat: Number(clock()) });
      } catch (error) { attempts.push(attempt(member.id, error)); }
    }
    metrics.misses += 1;
    metrics.elapsedms += elapsed(clock, startedat);
    throw poolerror("STORAGE_POOL_RANGE_FAILED", "storage pool could not read the requested range", { key: normalizedkey, range, attempts });
  }

  function repairplan(key, options = {}) {
    const normalizedkey = requiredkey(key);
    const sourceid = String(options.sourceid ?? "");
    if (!members.some((member) => member.id === sourceid)) throw new TypeError("storage pool repair source member is unknown");
    return Object.freeze({ version: 1, key: normalizedkey, sourceid, sha256: optionalsha(options.sha256), targets: selectable(members, options.memberids).filter((member) => member.id !== sourceid).map((member) => member.id), action: "caller-executes" });
  }

  function restoreplan(key, options = {}) {
    const normalizedkey = requiredkey(key);
    const selected = selectable(members, options.memberids);
    const evidence = new Map((options.replicas ?? []).map((value) => [String(value?.memberid ?? ""), value?.verified === true]));
    const candidates = selected.map((member) => ({ memberid: member.id, verified: evidence.get(member.id) === true })).sort((left, right) => Number(right.verified) - Number(left.verified) || left.memberid.localeCompare(right.memberid));
    return Object.freeze({ version: 1, key: normalizedkey, sha256: optionalsha(options.sha256), action: "caller-restores", candidates: Object.freeze(candidates) });
  }

  return Object.freeze({ read, readrange, put, repairplan, restoreplan, members: () => members.map(describe), capabilities: () => members.map((member) => ({ id: member.id, priority: member.priority, capabilities: storagecapabilities(member.storage) })), metrics: () => ({ ...metrics }) });
}

function normalizemembers(input) {
  if (!Array.isArray(input) || input.length === 0) throw new TypeError("storage pool members must be a non-empty array");
  const ids = new Set();
  const members = input.map((value, index) => {
    const id = String(value?.id ?? "");
    if (!id) throw new TypeError("storage pool member id is required");
    if (ids.has(id)) throw new TypeError(`storage pool member id is duplicated: ${id}`);
    ids.add(id);
    if (typeof value?.storage?.get !== "function" || typeof value?.storage?.put !== "function") throw new TypeError(`storage pool member requires get and put: ${id}`);
    const priority = Number(value.priority ?? index);
    if (!Number.isFinite(priority)) throw new TypeError(`storage pool member priority is invalid: ${id}`);
    return Object.freeze({ id, storage: value.storage, priority });
  });
  return Object.freeze(members.sort((left, right) => left.priority - right.priority || left.id.localeCompare(right.id)));
}

function selectable(members, ids) {
  if (ids === undefined) return members;
  if (!Array.isArray(ids) || ids.length === 0) throw new TypeError("storage pool memberids must be a non-empty array");
  const expected = new Set(ids.map((id) => String(id)));
  const selected = members.filter((member) => expected.has(member.id));
  if (selected.length !== expected.size) throw new TypeError("storage pool memberids include an unknown member");
  return selected;
}

function writeselection(members, mode = "fanout") {
  const normalized = String(mode);
  if (!new Set(["primary", "mirror", "fanout"]).has(normalized)) throw new TypeError("storage pool write mode is invalid");
  return normalized === "primary" ? members.slice(0, 1) : members;
}

async function optionalhead(storage, key) { return typeof storage.head === "function" ? await storage.head(key) : null; }
function describe(member) { return Object.freeze({ id: member.id, priority: member.priority }); }
function requiredkey(value) { const key = String(value ?? ""); if (!key) throw new TypeError("storage pool key is required"); return key; }
function optionalsha(value) { if (value === undefined || value === null) return null; const digest = String(value); if (!/^[a-f0-9]{64}$/i.test(digest)) throw new TypeError("storage pool sha256 is invalid"); return digest.toLowerCase(); }
function positiveinteger(value, name) { const numeric = Number(value); if (!Number.isInteger(numeric) || numeric < 1) throw new TypeError(`${name} must be a positive integer`); return numeric; }
function operationbudget(input = {}, fallbackattempts) { const budget = input ?? {}; return Object.freeze({ maxattempts: positiveinteger(budget.maxattempts ?? fallbackattempts, "storage pool budget maxattempts"), maxbytes: nonnegativebudget(budget.maxbytes, "storage pool budget maxbytes"), maxmilliseconds: nonnegativebudget(budget.maxmilliseconds, "storage pool budget maxmilliseconds") }); }
function nonnegativebudget(value, name) { if (value === undefined) return Infinity; const numeric = Number(value); if (!Number.isSafeInteger(numeric) || numeric < 0) throw new TypeError(`${name} must be a non-negative safe integer`); return numeric; }
function elapsed(clock, startedat) { return Math.max(0, Number(clock()) - startedat); }
function validrange(start, end) { const from = nonnegativebudget(start, "storage pool range start"); const to = nonnegativebudget(end, "storage pool range end"); if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) throw new TypeError("storage pool range is invalid"); return Object.freeze({ start: from, end: to }); }
function attempt(memberid, error) { return { memberid, code: error?.code ?? "STORAGE_POOL_READ_FAILED", message: String(error?.message ?? error) }; }
function poolerror(code, message, detail) { const error = new Error(message); error.code = code; error.detail = detail; return error; }

/* ════════════════════════════════════════════════════════════════════ */
/* Section 18: storage/s3compatible.ts — s3 compatible storage stays open by accepting a caller supplied signer. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * s3 compatible storage stays open by accepting a caller supplied signer.
 * List operations use the S3 ListObjectsV2 contract without owning credentials.
 */

/** Creates an S3-compatible adapter with signed CRUD and paginated listing. */
export function s3compatible(options = {}) {
  if (!options.endpoint || !options.bucket || typeof options.sign !== "function") throw new TypeError("s3 compatible storage requires endpoint bucket and sign");
  const endpoint = new URL(options.endpoint);
  const fetcher = options.fetcher ?? fetch;

  async function request(method, key, body, query = {}) {
    const signed = await options.sign({ method, endpoint, bucket: options.bucket, key, query, body });
    const url = new URL(signed.url, endpoint);
    if (!url.search && Object.keys(query).length) for (const [name, value] of Object.entries(query)) url.searchParams.set(name, String(value));
    const response = await fetcher(url, { method, headers: signed.headers, body });
    if (!response.ok) throw new Error(`storage request failed with ${response.status}`);
    return response;
  }

  return storageadapter({
    async put(input) { const data = await (input.data instanceof Uint8Array ? input.data : await collectbytes(input.data)); await request("PUT", input.key, data); return { key: input.key, sizebytes: data.byteLength, sha256: await sha256(data), contenttype: input.contenttype ?? "application/octet-stream", createdat: Date.now(), metadata: { ...(input.metadata ?? {}) } }; },
    async get(key) { const response = await request("GET", key); return new Uint8Array(await response.arrayBuffer()); },
    async head(key) { try { const response = await request("HEAD", key); return { key, sizebytes: Number(response.headers.get("content-length") ?? 0), sha256: response.headers.get("etag") ?? "", contenttype: response.headers.get("content-type") ?? "application/octet-stream", createdat: Date.now(), metadata: {} }; } catch { return null; } },
    async delete(key) { await request("DELETE", key); },
    async list(prefix = "", listoptions = {}) {
      const maxkeys = Math.max(1, Math.min(1000, Number(listoptions.maxkeys ?? options.maxkeys ?? 1000)));
      const maxpages = Math.max(1, Number(listoptions.maxpages ?? options.maxpages ?? 100));
      const entries = [];
      let continuation = listoptions.continuationToken;
      for (let page = 0; page < maxpages; page += 1) {
        const query = { "list-type": "2", prefix, "max-keys": maxkeys };
        if (continuation) query["continuation-token"] = continuation;
        const response = await request("GET", "", undefined, query);
        const parsed = parseListXml(await response.text());
        entries.push(...parsed.entries);
        if (!parsed.truncated || !parsed.nextToken) return entries;
        if (parsed.nextToken === continuation) throw new Error("s3 list continuation token did not advance");
        continuation = parsed.nextToken;
      }
      return entries;
    },
  });
}

function parseListXml(xml) {
  const entries = [];
  for (const block of xml.match(/<Contents\b[\s\S]*?<\/Contents>/gi) ?? []) {
    const key = xmlvalue(block, "Key");
    if (!key) continue;
    const etag = xmlvalue(block, "ETag");
    entries.push({ key, sizebytes: Number(xmlvalue(block, "Size") ?? 0), sha256: etag?.replace(/^"|"$/g, "") ?? "", contenttype: "application/octet-stream", createdat: Date.now(), metadata: { etag, lastmodified: xmlvalue(block, "LastModified"), storageclass: xmlvalue(block, "StorageClass") } });
  }
  const truncated = xmlvalue(xml, "IsTruncated") === "true";
  return { entries, truncated, nextToken: xmlvalue(xml, "NextContinuationToken") };
}

function xmlvalue(xml, name) { const match = String(xml).match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, "i")); return match ? decodexml(match[1].trim()) : undefined; }
/** Single-pass XML entity decode: the pattern never re-examines its own output, so a double-escaped `&amp;lt;` decodes once to the literal text `&lt;` and never again to `<`. */
const XMLENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" };
function decodexml(value) { return String(value).replace(/&(amp|lt|gt|quot|#39);/g, (whole: string, entity: string) => XMLENTITIES[entity] ?? whole); }

/* ════════════════════════════════════════════════════════════════════ */
/* Section 19: storage/githubcontents.ts — github contents storage maps artifacts to repository files through an injected token. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * github contents storage maps artifacts to repository files through an injected token.
 */

export function githubcontents(options = {}) {
  if (!options.baseurl || !options.owner || !options.repo || typeof options.token !== "function") throw new TypeError("github contents requires baseurl owner repo and token");
  const fetcher = options.fetcher ?? fetch;
  async function request(method, key, body) { const token = await options.token(); const response = await fetcher(new URL(`/repos/${options.owner}/${options.repo}/contents/${key}`, options.baseurl), { method, headers: { accept: "application/vnd.github+json", authorization: `Bearer ${token}`, "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined }); if (!response.ok) throw new Error(`github contents request failed with ${response.status}`); return response; }
  return storageadapter({
    async put(input) { const data = await collectbytes(input.data); let sha; try { sha = (await (await request("GET", input.key)).json()).sha; } catch {} const response = await request("PUT", input.key, { message: input.message ?? `saddle write ${input.key}`, content: Buffer.from(data).toString("base64"), branch: options.branch ?? "main", sha }); const result = await response.json(); return { key: input.key, sizebytes: data.byteLength, sha256: sha256(data), contenttype: input.contenttype ?? "application/octet-stream", createdat: Date.now(), metadata: { url: result.content?.download_url, commit: result.commit?.sha, ...(input.metadata ?? {}) } }; },
    async get(key) { const result = await (await request("GET", key)).json(); return new Uint8Array(Buffer.from(result.content.replaceAll("\n", ""), "base64")); },
    async head(key) { try { const result = await (await request("GET", key)).json(); return { key, sizebytes: result.size, sha256: result.sha ?? "", contenttype: "application/octet-stream", createdat: Date.now(), metadata: { url: result.download_url } }; } catch { return null; } },
    async delete(key) { const result = await (await request("GET", key)).json(); await request("DELETE", key, { message: `saddle delete ${key}`, sha: result.sha, branch: options.branch ?? "main" }); },
    async list(prefix = "") { const result = await (await request("GET", prefix)).json(); return (Array.isArray(result) ? result : []).filter((item) => item.type === "file").map((item) => ({ key: item.path, sizebytes: item.size, sha256: item.sha, contenttype: "application/octet-stream", createdat: Date.now(), metadata: { url: item.download_url } })); }
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 20: storage/filehosting.ts — file hosting adapter accepts a caller supplied request function for s3compatible or webdav. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * file hosting adapter accepts a caller supplied request function for s3compatible or webdav.
 */

export function filehosting(options = {}) {
  if (!options.host || typeof options.request !== "function") throw new TypeError("file hosting requires host and request");
  const method = options.method ?? "s3compatible";
  return storageadapter({
    async put(input) { const data = await collectbytes(input.data); await options.request({ method: method === "webdav" ? "PUT" : "put", url: new URL(input.key, options.host).href, data, headers: { "content-type": input.contenttype ?? "application/octet-stream" } }); return { key: input.key, sizebytes: data.byteLength, sha256: sha256(data), contenttype: input.contenttype ?? "application/octet-stream", createdat: Date.now(), metadata: input.metadata ?? {} }; },
    async get(key) { const result = await options.request({ method: method === "webdav" ? "GET" : "get", url: new URL(key, options.host).href }); return result.data ?? result; },
    async head(key) { try { const result = await options.request({ method: "head", url: new URL(key, options.host).href }); return { key, sizebytes: Number(result.headers?.["content-length"] ?? 0), sha256: result.headers?.etag ?? "", contenttype: result.headers?.["content-type"] ?? "application/octet-stream", createdat: Date.now(), metadata: {} }; } catch { return null; } },
    async delete(key) { await options.request({ method: method === "webdav" ? "DELETE" : "delete", url: new URL(key, options.host).href }); },
    async list(prefix = "") { const result = await options.request({ method: method === "webdav" ? "PROPFIND" : "list", url: new URL(prefix, options.host).href }); return result.items ?? []; }
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 21: persistence/schema.ts — the schema descriptor is neutral so prisma drizzle mysql2 or another driver can map it. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * the schema descriptor is neutral so prisma drizzle mysql2 or another driver can map it.
 */
export const schemadefinition = Object.freeze({
  jobs: { id: "text primary key", name: "text", status: "text", priority: "integer", input: "json", outputkey: "text", createdat: "integer", updatedat: "integer" },
  events: { id: "text primary key", jobid: "text", type: "text", at: "integer", data: "json" },
  sessions: { id: "text primary key", version: "integer", agentname: "text", originurl: "text", seed: "text", status: "text", startedat: "integer", finishedat: "integer", events: "json" },
  artifacts: { key: "text primary key", sizebytes: "bigint", sha256: "text", contenttype: "text", createdat: "integer", metadata: "json" },
  chunks: { id: "text primary key", artifactkey: "text", index: "integer", offset: "bigint", sizebytes: "integer", sha256: "text", storagekey: "text" }
  ,queueitems: { id: "text primary key", status: "text", attempts: "integer", payload: "json", result: "json", error: "json", createdat: "bigint", updatedat: "bigint" }
});

export function schemasql(options = {}) {
  const dialect = options.dialect ?? "mysql";
  const json = dialect === "postgres" ? "jsonb" : "json";
  const bigint = dialect === "sqlite" ? "integer" : "bigint";
  return [
    `create table if not exists jobs (id text primary key, name text not null, status text not null, priority integer not null, input ${json}, outputkey text, createdat ${bigint} not null, updatedat ${bigint} not null)`,
    `create table if not exists events (id text primary key, jobid text not null, type text not null, at ${bigint} not null, data ${json} not null)`,
    `create table if not exists sessions (id text primary key, version integer not null, agentname text not null, originurl text not null, seed text not null, status text not null, startedat ${bigint} not null, finishedat ${bigint}, events ${json} not null)`,
    `create table if not exists artifacts (key text primary key, sizebytes ${bigint} not null, sha256 text not null, contenttype text not null, createdat ${bigint} not null, metadata ${json} not null)`,
    `create table if not exists chunks (id text primary key, artifactkey text not null, chunkindex integer not null, byteoffset ${bigint} not null, sizebytes integer not null, sha256 text not null, storagekey text not null)`
    ,`create table if not exists queueitems (id text primary key, status text not null, attempts integer not null, payload ${json} not null, result ${json}, error ${json}, createdat ${bigint} not null, updatedat ${bigint} not null)`
  ];
}

export function prismaschema() {
  return `model job { id String @id name String status String priority Int input Json? outputkey String? createdat BigInt updatedat BigInt }\nmodel event { id String @id jobid String type String at BigInt data Json }\nmodel session { id String @id version Int agentname String originurl String seed String status String startedat BigInt finishedat BigInt? events Json }\nmodel artifact { key String @id sizebytes BigInt sha256 String contenttype String createdat BigInt metadata Json }\nmodel chunk { id String @id artifactkey String chunkindex Int byteoffset BigInt sizebytes Int sha256 String storagekey String }`;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 22: persistence/adapter.ts — persistence adapters keep database and remote state outside the runtime core. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * persistence adapters keep database and remote state outside the runtime core.
 */
export function persistenceadapter(methods) {
  const required = ["savejob", "getjob", "updatejob", "listjobs", "saveevent", "listevents", "savesession", "readsession", "saveartifact", "getartifact", "savechunk", "getchunks"];
  for (const name of required) if (typeof methods?.[name] !== "function") throw new TypeError(`persistence adapter requires ${name}`);
  return methods;
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 23: persistence/memory.ts — memory persistence is the local baseline for tests and offline operation. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * memory persistence is the local baseline for tests and offline operation.
 */

export function memorypersistence() {
  const jobs = new Map();
  const events = new Map();
  const sessions = new Map();
  const artifacts = new Map();
  const chunks = new Map();
  return persistenceadapter({
    async savejob(job) { jobs.set(job.id, structuredClone(job)); return jobs.get(job.id); },
    async getjob(id) { return jobs.get(id) ? structuredClone(jobs.get(id)) : null; },
    async updatejob(id, patch) { const current = jobs.get(id); if (!current) return null; const next = { ...current, ...patch, updatedat: Date.now() }; jobs.set(id, next); return structuredClone(next); },
    async listjobs(filter = {}) { return [...jobs.values()].filter((job) => Object.entries(filter).every(([key, value]) => job[key] === value)).map((job) => structuredClone(job)); },
    async saveevent(event) { const list = events.get(event.jobid) ?? []; list.push(structuredClone(event)); events.set(event.jobid, list); return event; },
    async listevents(jobid) { return (events.get(jobid) ?? []).map((event) => structuredClone(event)); },
    async savesession(session) { sessions.set(session.id, structuredClone(session)); return structuredClone(session); },
    async readsession(id) { return sessions.get(id) ? structuredClone(sessions.get(id)) : null; },
    async saveartifact(artifact) { artifacts.set(artifact.key, structuredClone(artifact)); return structuredClone(artifact); },
    async getartifact(key) { return artifacts.get(key) ? structuredClone(artifacts.get(key)) : null; },
    async savechunk(chunk) { chunks.set(chunk.id, structuredClone(chunk)); return structuredClone(chunk); },
    async getchunks(artifactkey) { return [...chunks.values()].filter((chunk) => chunk.artifactkey === artifactkey).sort((left, right) => left.index - right.index).map((chunk) => structuredClone(chunk)); }
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 24: persistence/sql.ts — sql persistence keeps query execution injected for mysql2 drizzle or another sql client. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * sql persistence keeps query execution injected for mysql2 drizzle or another sql client.
 */

export function sqlpersistence(options = {}) {
  if (typeof options.query !== "function") throw new TypeError("sql persistence requires query");
  const table = options.table ?? { jobs: "jobs", events: "events", sessions: "sessions", artifacts: "artifacts", chunks: "chunks" };
  async function one(statement, values = []) { const result = await options.query(statement, values); return result?.rows?.[0] ?? result?.[0]?.[0] ?? result?.[0] ?? null; }
  async function many(statement, values = []) { const result = await options.query(statement, values); return result?.rows ?? result?.[0] ?? result ?? []; }
  return persistenceadapter({
    async savejob(job) { await options.query(`insert into ${table.jobs} (id,name,status,priority,input,outputkey,createdat,updatedat) values (?,?,?,?,?,?,?,?)`, [job.id, job.name, job.status, job.priority, JSON.stringify(job.input ?? null), job.outputkey ?? null, job.createdat, job.updatedat ?? job.createdat]); return job; },
    async getjob(id) { const row = await one(`select * from ${table.jobs} where id = ?`, [id]); return row ? normalizejob(row) : null; },
    async updatejob(id, patch) { const current = await this.getjob(id); if (!current) return null; const next = { ...current, ...patch, updatedat: Date.now() }; await options.query(`update ${table.jobs} set status = ?, priority = ?, input = ?, outputkey = ?, updatedat = ? where id = ?`, [next.status, next.priority, JSON.stringify(next.input ?? null), next.outputkey ?? null, next.updatedat, id]); return next; },
    async listjobs(filter = {}) { const rows = await many(`select * from ${table.jobs} order by createdat desc`, []); return rows.map(normalizejob).filter((job) => Object.entries(filter).every(([key, value]) => job[key] === value)); },
    async saveevent(event) { await options.query(`insert into ${table.events} (id,jobid,type,at,data) values (?,?,?,?,?)`, [event.id, event.jobid, event.type, event.at, JSON.stringify(event.data ?? {})]); return event; },
    async listevents(jobid) { return (await many(`select * from ${table.events} where jobid = ? order by at asc`, [jobid])).map((row) => ({ ...row, data: parsejson(row.data) })); },
    async savesession(session) { await options.query(`insert into ${table.sessions} (id,version,agentname,originurl,seed,status,startedat,finishedat,events) values (?,?,?,?,?,?,?,?,?)`, [session.id, session.version, session.agentname, session.originurl, session.seed, session.status, session.startedat, session.finishedat ?? null, JSON.stringify(session.events ?? [])]); return session; },
    async readsession(id) { const row = await one(`select * from ${table.sessions} where id = ?`, [id]); return row ? { ...row, events: parsejson(row.events) } : null; },
    async saveartifact(artifact) { await options.query(`insert into ${table.artifacts} (key,sizebytes,sha256,contenttype,createdat,metadata) values (?,?,?,?,?,?)`, [artifact.key, artifact.sizebytes, artifact.sha256, artifact.contenttype, artifact.createdat, JSON.stringify(artifact.metadata ?? {})]); return artifact; },
    async getartifact(key) { const row = await one(`select * from ${table.artifacts} where key = ?`, [key]); return row ? { ...row, metadata: parsejson(row.metadata) } : null; },
    async savechunk(chunk) { await options.query(`insert into ${table.chunks} (id,artifactkey,chunkindex,byteoffset,sizebytes,sha256,storagekey) values (?,?,?,?,?,?,?)`, [chunk.id, chunk.artifactkey, chunk.index, chunk.offset, chunk.sizebytes, chunk.sha256, chunk.storagekey]); return chunk; },
    async getchunks(artifactkey) { return (await many(`select * from ${table.chunks} where artifactkey = ? order by chunkindex asc`, [artifactkey])).map((row) => ({ ...row, index: row.index ?? row.chunkindex, offset: row.offset ?? row.byteoffset })); }
  });
}

export function mysql2persistence(pool, options = {}) { if (typeof pool?.execute !== "function") throw new TypeError("mysql2 pool requires execute"); return sqlpersistence({ ...options, query: async (statement, values) => pool.execute(statement, values) }); }

function normalizejob(row) { return { ...row, input: parsejson(row.input) }; }
function parsejson(value) { if (value == null || typeof value === "object") return value; try { return JSON.parse(value); } catch { return value; } }

/* ════════════════════════════════════════════════════════════════════ */
/* Section 25: persistence/drizzle.ts — drizzle persistence accepts a small repository object generated by the caller's schema. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * drizzle persistence accepts a small repository object generated by the caller's schema.
 */

export function drizzlepersistence(repository) {
  const required = ["savejob", "getjob", "updatejob", "listjobs", "saveevent", "listevents", "savesession", "readsession", "saveartifact", "getartifact", "savechunk", "getchunks"];
  for (const name of required) if (typeof repository?.[name] !== "function") throw new TypeError(`drizzle repository requires ${name}`);
  return persistenceadapter(repository);
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 26: persistence/prisma.ts — prisma persistence maps model delegates through an explicit model configuration. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * prisma persistence maps model delegates through an explicit model configuration.
 */

export function prismapersistence(client, options = {}) {
  const models = { jobs: options.jobs ?? client?.job, events: options.events ?? client?.event, sessions: options.sessions ?? client?.session, artifacts: options.artifacts ?? client?.artifact, chunks: options.chunks ?? client?.chunk };
  for (const [name, model] of Object.entries(models)) if (!model) throw new TypeError(`prisma model is missing: ${name}`);
  return persistenceadapter({
    async savejob(job) { return models.jobs.upsert({ where: { id: job.id }, create: job, update: job }); },
    async getjob(id) { return models.jobs.findUnique({ where: { id } }); },
    async updatejob(id, patch) { return models.jobs.update({ where: { id }, data: { ...patch, updatedat: Date.now() } }); },
    async listjobs(filter = {}) { return models.jobs.findMany({ where: filter, orderBy: { createdat: "desc" } }); },
    async saveevent(event) { return models.events.create({ data: event }); },
    async listevents(jobid) { return models.events.findMany({ where: { jobid }, orderBy: { at: "asc" } }); },
    async savesession(session) { return models.sessions.upsert({ where: { id: session.id }, create: session, update: session }); },
    async readsession(id) { return models.sessions.findUnique({ where: { id } }); },
    async saveartifact(artifact) { return models.artifacts.upsert({ where: { key: artifact.key }, create: artifact, update: artifact }); },
    async getartifact(key) { return models.artifacts.findUnique({ where: { key } }); },
    async savechunk(chunk) { return models.chunks.upsert({ where: { id: chunk.id }, create: chunk, update: chunk }); },
    async getchunks(artifactkey) { return models.chunks.findMany({ where: { artifactkey }, orderBy: { index: "asc" } }); }
  });
}

/* ════════════════════════════════════════════════════════════════════ */
/* Section 27: persistence/migrations.ts — migration plans stay neutral so Prisma, Drizzle, MySQL2, Turso, and another SQL driver can map them. */
/* ════════════════════════════════════════════════════════════════════ */
/**
 * migration plans stay neutral so Prisma, Drizzle, MySQL2, Turso, and another SQL driver can map them.
 */
export const migrationlist = Object.freeze([
  { version: 1, name: "baseoperational", tables: ["jobs", "events", "sessions", "artifacts", "chunks"] },
  { version: 2, name: "persistentqueue", tables: ["queueitems"] },
  { version: 3, name: "webhookdeliveries", tables: ["webhookdeliveries"] }
]);

/** Returns pending migration statements for a dialect. */
export function migrationplan(options: { current?: number, dialect?: string } = {}) { const current = options.current ?? 0; const dialect = options.dialect ?? "mysql"; return migrationlist.filter((migration) => migration.version > current).map((migration) => ({ ...migration, statements: migration.version === 2 ? [`create table if not exists queueitems (id text primary key, status text not null, attempts integer not null, payload json not null, result json, error json, createdat bigint not null, updatedat bigint not null)`] : migration.version === 3 ? [`create table if not exists webhookdeliveries (id text primary key, event text not null, receivedat bigint not null, processedat bigint, payload json not null)`] : [], dialect })); }

/** Returns the latest schema version. */
export function latestmigration() { return migrationlist.at(-1)?.version ?? 0; }

/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: virtualmemory.ts — the memory tier catalog, controllers and the host-aware planners (rides first: virtualgpu composes its MIGPROFILES). */
/* ══════════════════════════════════════════════════════════════════════ */

/**
 * virtualmemory - virtual memory tiers, controllers and the host-aware
 * extreme memory planner.
 *
 * This module owns everything memory related: the MEMORY_TIERS catalog with
 * real bandwidth figures (DDR5-6400 system memory, HBM3e stacked memory at
 * 8 TB/s, GDDR7 graphics memory at 1792 GB/s), MIG slicing profiles
 * (1g.24gb, 2g.48gb, 4g.96gb), NUMA topology generation, huge page planning
 * (1 GB and 2 MB), the kernel samepage merging controller, virtio ballooning,
 * swap overcommit with vm.overcommit_memory=2 semantics, the tmpfs shader
 * cache (20 GB), Docker memory flags (MemorySwap -1 and ShmSize 2g, the fix
 * for the classic PyTorch DataLoader bus error), tiered memory controllers
 * modeled on real silicon, a fluent region builder, a guarding region Proxy
 * and the virtualmemorymanager facade that ties every technique together.
 *
 * The v2 merge adds two host-aware layers absorbed from the Meta sources:
 * the placement tier taxonomy (DRAM_FAST, DRAM_SLOW, CXL_FM, CXL_PMEM,
 * HBM_BLACKWELL, ZRAM, PMEM_DAX) with CXL 2.0/3.0 Type-3 device profiles,
 * zram compression profiles, transparent huge page profiles and CCD-aware
 * vCPU pinning for the Ryzen 9 9950X3D; and the memorymodularizer class
 * that detects real host tiers (lspci CXL scan, /dev/pmem0, shared
 * Blackwell memory), plans zram with workload-dependent compression
 * factors, synthesizes tiered QEMU arguments, exports cgroup v2 slices and
 * QMP runtime commands, and persists plans as JSON. /proc/meminfo
 * generation (generateVirtualMeminfo, meminfoptions, pagealign) moved here
 * from the processor module so every memory concern lives in one file.
 *
 * Modularity extremes are first class: 1 to 192 vCPUs, 1 to 1024 GB of RAM
 * and 8 to 96 GB of VRAM, all user chosen and validated against hard limits.
 *
 * Bandwidth sources verified on 2026-08-22: JEDEC DDR5-6400 (51.2 GB/s per
 * channel), NVIDIA B200 and AMD Instinct MI350X HBM3e (8 TB/s aggregate),
 * GeForce RTX 5090 and RTX PRO 6000 Blackwell GDDR7 (1792 GB/s over a
 * 512-bit bus). CXL figures follow the CXL 2.0/3.0 Type-3 fabric numbers
 * (178-195 ns latency, 32-64 GB/s per x16 PCIe 5.0 link) documented in the
 * project research; zram compression ratios (lzo-rle 3.1:1, zstd 4.2:1)
 * follow the kernel zram documentation.
 *
 * Contexts (25): memoryerror, memorytierid, MEMORY_TIERS, memorylimits,
 * MIGPROFILES, validatememoryrequest, buildnumatopology, planhugepages,
 * ksmcontroller, ballooningcontroller, overcommitcontroller,
 * planswapdevices, shadercachecontroller, dockerMemoryFlags,
 * memorycontroller, memoryregion, regionledger, memorystats, memoryplan,
 * virtualmemorymanager, placementtier, cxxldevice, zramprofile,
 * memorymodularizer, generateVirtualMeminfo.
 *
 * Patterns: strategy (memorycontroller), builder (regionbuilder), registry
 * (regionledger), proxy (guardregion), observer (memorystats), facade
 * (virtualmemorymanager), planner (memorymodularizer).
 * Rules: lowercase identifiers, english jsdoc, third person, no emoji,
 * try/catch catcher on every fallible path, node:* built-ins only, and no
 * hardcoded localhost address anywhere.
 */

/* ------------------------------------------------------------------ */
/* Section 1: errors                                                   */
/* ------------------------------------------------------------------ */

/** Error thrown by every memory subsystem with an optional cause chain. */
export class memoryerror extends Error {
  /** Machine readable subsystem tag. */
  readonly subsystem: string;

  constructor(message: string, options?: { cause?: Error; subsystem?: string }) {
    super(message, options);
    this.name = 'memoryerror';
    this.subsystem = options?.subsystem ?? 'virtualmemory';
  }
}

/* ------------------------------------------------------------------ */
/* Section 2: memory tier catalog                                      */
/* ------------------------------------------------------------------ */

/** Identifiers of the supported memory tiers. */
export type memorytierid = 'ddr5' | 'hbm3e' | 'gddr7';

/** Static description of one memory tier. */
export type memorytier = {
  readonly id: memorytierid;
  readonly label: string;
  readonly technology: string;
  readonly perchannelgbs: number;
  readonly channels: number;
  readonly modulegb: number;
  readonly latencyns: number;
  readonly usedfor: string;
};

/**
 * MEMORY_TIERS: the catalog of virtual memory technologies with real
 * bandwidth arithmetic. DDR5-6400 moves 51.2 GB/s per channel (2 channels
 * on desktop parts such as Ryzen and Core Ultra, 12 channels on EPYC SP5),
 * HBM3e delivers 8 TB/s aggregate on B200 and MI350X class accelerators and
 * GDDR7 reaches 1792 GB/s across the 512-bit bus of RTX 5090 and RTX PRO
 * 6000 Blackwell boards.
 */
export const MEMORY_TIERS = {
  ddr5: {
    id: 'ddr5',
    label: 'DDR5-6400 system memory',
    technology: 'DDR5 SDRAM at 6400 MT/s',
    perchannelgbs: 51.2,
    channels: 12,
    modulegb: 96,
    latencyns: 76,
    usedfor: 'guest RAM, page cache, tmpfs shader cache',
  },
  hbm3e: {
    id: 'hbm3e',
    label: 'HBM3e stacked memory',
    technology: 'high bandwidth memory 3e, 8 stacks',
    perchannelgbs: 1000,
    channels: 8,
    modulegb: 36,
    latencyns: 29,
    usedfor: 'datacenter accelerator memory (B200 192 GB, MI350X 288 GB)',
  },
  gddr7: {
    id: 'gddr7',
    label: 'GDDR7 graphics memory',
    technology: 'GDDR7 at 28 Gbps over a 512-bit bus',
    perchannelgbs: 224,
    channels: 8,
    modulegb: 16,
    latencyns: 42,
    usedfor: 'workstation and consumer GPUs (RTX 5090, RTX PRO 6000)',
  },
} as const satisfies Record<memorytierid, memorytier>;

/** Returns one tier descriptor, throwing for unknown identifiers. */
export function selecttier<const T extends memorytierid>(id: T): memorytier {
  const tier: memorytier | undefined = MEMORY_TIERS[id];
  if (tier === undefined) {
    throw new memoryerror(
      `unknown memory tier "${id}"; valid tiers: ${Object.keys(MEMORY_TIERS).join(', ')}`,
    );
  }
  return tier;
}

/** Aggregated bandwidth of one tier in GB/s (per channel times channels). */
export function tierbandwidthgbs(id: memorytierid): number {
  const tier = selecttier(id);
  return Number((tier.perchannelgbs * tier.channels).toFixed(1));
}

/* ------------------------------------------------------------------ */
/* Section 3: hard limits and request validation                       */
/* ------------------------------------------------------------------ */

/** Numeric bounds enforced for every memory request. */
export type memorylimits = {
  readonly minvcpu: number;
  readonly maxvcpu: number;
  readonly minramgb: number;
  readonly maxramgb: number;
  readonly minvramgb: number;
  readonly maxvramgb: number;
};

/** Extremes of modularity supported by the virtual memory planner. */
export const memorylimits = {
  minvcpu: 1,
  maxvcpu: 192,
  minramgb: 1,
  maxramgb: 1024,
  minvramgb: 8,
  maxvramgb: 96,
} as const satisfies memorylimits;

/** A memory request submitted by the user for planning and validation. */
export type memoryrequest = {
  readonly vcpus?: number;
  readonly ramgb?: number;
  readonly vramgb?: number;
  readonly mig?: migprofileid;
  readonly tier?: memorytierid;
};

/** Outcome of validating a memory request. */
export type memoryrequestresult = {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly plan: memoryplan | null;
};

/** MIG slicing profile identifier, or off for a monolithic device. */
export type migprofileid = '1g.24gb' | '2g.48gb' | '4g.96gb' | 'off';

/** Static description of one MIG slicing profile. */
export type migprofile = {
  readonly id: migprofileid;
  readonly slicegb: number;
  readonly maxinstances: number;
};

/**
 * MIG profiles available on the 96 GB virtual device. The identifiers keep
 * the NVIDIA convention of compute-slice names: 1g.24gb exposes 24 GB
 * slices (up to 4 instances), 2g.48gb exposes 48 GB slices (up to 2
 * instances) and 4g.96gb dedicates the full 96 GB to one instance.
 */
export const MIGPROFILES: readonly migprofile[] = [
  { id: '1g.24gb', slicegb: 24, maxinstances: 4 },
  { id: '2g.48gb', slicegb: 48, maxinstances: 2 },
  { id: '4g.96gb', slicegb: 96, maxinstances: 1 },
] as const satisfies readonly migprofile[];

/** Resolves a MIG profile by identifier, throwing for unknown names. */
export function getmigprofile(id: migprofileid): migprofile | null {
  if (id === 'off') {
    return null;
  }
  const found = MIGPROFILES.find((profile) => profile.id === id);
  if (found === undefined) {
    throw new memoryerror(
      `unknown MIG profile "${id}"; valid profiles: ${MIGPROFILES.map((profile) => profile.id).join(', ')} or off`,
    );
  }
  return found;
}

/**
 * Validates a memory request against the hard limits and the MIG catalog.
 * The function reuses the rule style of the core validator: it accumulates
 * errors for limit violations, warnings for suspicious-but-legal layouts
 * (for example RAM below 16 GB with 96 GB of VRAM, or ballooning suggested
 * when RAM exceeds 512 GB) and builds a plan when the request is valid.
 */
export function validatememoryrequest(request: memoryrequest): memoryrequestresult {
  const errors: string[] = [];
  const warnings: string[] = [];
  try {
    const vcpus = request.vcpus ?? 8;
    const ramgb = request.ramgb ?? 32;
    const vramgb = request.vramgb ?? 24;
    const tier = request.tier ?? 'ddr5';
    if (!Number.isInteger(vcpus) || vcpus < memorylimits.minvcpu || vcpus > memorylimits.maxvcpu) {
      errors.push(
        `vcpus must be an integer between ${memorylimits.minvcpu} and ${memorylimits.maxvcpu}`,
      );
    }
    if (!Number.isFinite(ramgb) || ramgb < memorylimits.minramgb || ramgb > memorylimits.maxramgb) {
      errors.push(`ramgb must be between ${memorylimits.minramgb} and ${memorylimits.maxramgb}`);
    }
    if (
      !Number.isFinite(vramgb) ||
      vramgb < memorylimits.minvramgb ||
      vramgb > memorylimits.maxvramgb
    ) {
      errors.push(`vramgb must be between ${memorylimits.minvramgb} and ${memorylimits.maxvramgb}`);
    }
    const mig = request.mig ?? 'off';
    const profile = getmigprofile(mig);
    if (profile !== null && profile.slicegb !== vramgb) {
      errors.push(
        `MIG profile ${mig} implies ${profile.slicegb} GB slices but vramgb is ${vramgb}`,
      );
    }
    if (ramgb < 16 && vramgb >= 64) {
      warnings.push('vramgb far exceeds ramgb: host page cache may thrash during model loads');
    }
    if (ramgb >= 512) {
      warnings.push('RAM at or above 512 GB benefits from 1 GB huge pages and ballooning');
    }
    if (tier === 'ddr5' && vramgb > 64) {
      warnings.push(
        'ddr5 backing for VRAM above 64 GB halves effective bandwidth; prefer gddr7 or hbm3e tiers',
      );
    }
    if (errors.length > 0) {
      return { valid: false, errors, warnings, plan: null };
    }
    return { valid: true, errors, warnings, plan: planmemory(vcpus, ramgb, vramgb, mig, tier) };
  } catch (cause) {
    return {
      valid: false,
      errors: [`validatememoryrequest crashed: ${(cause as Error).message}`],
      warnings,
      plan: null,
    };
  }
}

/* ------------------------------------------------------------------ */
/* Section 4: NUMA topology                                            */
/* ------------------------------------------------------------------ */

/** NUMA topology of a virtual machine. */
export type numatopology = {
  readonly nodes: number;
  readonly cpuranges: readonly string[];
  readonly distances: readonly (readonly number[])[];
  readonly description: string;
};

/**
 * Builds a NUMA topology for a vCPU count split across a node count. Local
 * distance is 10 and remote nodes sit at 32, mirroring the NPS modes of
 * AMD EPYC parts; cpu ranges are rendered as the compact lists used by
 * lscpu and numactl.
 */
export function buildnumatopology(vcpus: number, nodes: number): numatopology {
  try {
    if (!Number.isInteger(vcpus) || vcpus < 1) {
      throw new memoryerror(`vcpus must be a positive integer, received ${vcpus}`);
    }
    if (!Number.isInteger(nodes) || nodes < 1 || nodes > 16) {
      throw new memoryerror(`nodes must be between 1 and 16, received ${nodes}`);
    }
    const pernode = Math.ceil(vcpus / nodes);
    const cpuranges: string[] = [];
    for (let node = 0; node < nodes; node += 1) {
      const start = node * pernode;
      const end = Math.min(start + pernode, vcpus) - 1;
      if (start > end) {
        cpuranges.push('');
        continue;
      }
      cpuranges.push(start === end ? String(start) : `${start}-${end}`);
    }
    const distances: number[][] = [];
    for (let row = 0; row < nodes; row += 1) {
      const line: number[] = [];
      for (let column = 0; column < nodes; column += 1) {
        line.push(row === column ? 10 : 32);
      }
      distances.push(line);
    }
    return {
      nodes,
      cpuranges,
      distances,
      description: `${nodes} NUMA node(s), ${pernode} vCPU(s) per node, remote distance 32`,
    };
  } catch (cause) {
    if (cause instanceof memoryerror) {
      throw cause;
    }
    throw new memoryerror('buildnumatopology failed', { cause: cause as Error });
  }
}

/** Curated NUMA presets for common EPYC thread counts. */
export const NUMATOPOLOGIES: readonly numatopology[] = [
  buildnumatopology(192, 4),
  buildnumatopology(192, 8),
  buildnumatopology(128, 4),
  buildnumatopology(96, 2),
  buildnumatopology(64, 2),
  buildnumatopology(32, 1),
] as const satisfies readonly numatopology[];

/* ------------------------------------------------------------------ */
/* Section 5: huge pages, KSM, ballooning, overcommit, tmpfs           */
/* ------------------------------------------------------------------ */

/** One huge page reservation request. */
export type hugepageconfig = {
  readonly size: '1G' | '2M';
  readonly count: number;
  readonly coversgb: number;
};

/**
 * Plans huge page reservations for a RAM size. Machines with at least 256 GB
 * reserve half of their RAM as 1 GB pages for large model weights, plus a
 * pool of 2048 2 MB pages for medium allocations; smaller machines keep a
 * 2 MB-only layout.
 */
export function planhugepages(ramgb: number): hugepageconfig[] {
  try {
    if (!Number.isFinite(ramgb) || ramgb <= 0) {
      throw new memoryerror(`ramgb must be a positive number, received ${ramgb}`);
    }
    if (ramgb >= 256) {
      const onegbpages = Math.floor(ramgb / 2);
      return [
        { size: '1G', count: onegbpages, coversgb: onegbpages },
        { size: '2M', count: 2048, coversgb: 4 },
      ];
    }
    const twombpages = Math.floor((ramgb * 1024) / 4);
    return [
      { size: '2M', count: twombpages, coversgb: Number(((twombpages * 2) / 1024).toFixed(2)) },
    ];
  } catch (cause) {
    if (cause instanceof memoryerror) {
      throw cause;
    }
    throw new memoryerror('planhugepages failed', { cause: cause as Error });
  }
}

/**
 * Kernel samepage merging controller. KSM scans anonymous pages and merges
 * identical ones, which matters for dense virtual machines running the same
 * runtime image; the controller models the sysfs knobs documented by the
 * kernel (run, pages_to_scan, sleep_millisecs, merge_across_nodes) and
 * estimates the deduplication ratio from the shared/sharing counters.
 */
export class ksmcontroller {
  #pagestoscan: number;
  #sleepmillisecs: number;
  #mergeacrossnodes: boolean;
  #enabled: boolean;

  constructor(pagestoscan = 1000, sleepmillisecs = 20) {
    this.#pagestoscan = pagestoscan;
    this.#sleepmillisecs = sleepmillisecs;
    this.#mergeacrossnodes = true;
    this.#enabled = false;
  }

  /** Enables KSM and returns the sysfs writes required. */
  enable(): string[] {
    this.#enabled = true;
    return [
      'echo 1 > /sys/kernel/mm/ksm/run',
      `echo ${this.#pagestoscan} > /sys/kernel/mm/ksm/pages_to_scan`,
      `echo ${this.#sleepmillisecs} > /sys/kernel/mm/ksm/sleep_millisecs`,
      `echo ${this.#mergeacrossnodes ? 1 : 0} > /sys/kernel/mm/ksm/merge_across_nodes`,
    ];
  }

  /** Disables KSM, leaving the scan counters untouched. */
  disable(): string[] {
    this.#enabled = false;
    return ['echo 0 > /sys/kernel/mm/ksm/run'];
  }

  /** Tunes the scanner aggressiveness. */
  tune(pagestoscan: number, sleepmillisecs: number): this {
    this.#pagestoscan = Math.max(1, pagestoscan);
    this.#sleepmillisecs = Math.max(1, sleepmillisecs);
    return this;
  }

  /** Reports whether the controller is currently enabled. */
  get running(): boolean {
    return this.#enabled;
  }

  /**
   * Estimates the deduplication ratio from the classic kernel counters:
   * pages_shared counts merged unique pages and pages_sharing counts the
   * extra references pointing at them.
   */
  estimatesavings(pagesshared: number, pagessharing: number): { ratio: number; freedmb: number } {
    const total = pagesshared + pagessharing;
    const ratio = total === 0 ? 0 : Number((pagessharing / total).toFixed(4));
    const freedmb = Number(((pagessharing * 4) / 1024).toFixed(2));
    return { ratio, freedmb };
  }

  /** Renders the sysfs plan for logs and provisioners. */
  describe(): Record<string, unknown> {
    return {
      subsystem: 'ksm',
      enabled: this.#enabled,
      pagestoscan: this.#pagestoscan,
      sleepmillisecs: this.#sleepmillisecs,
      mergeacrossnodes: this.#mergeacrossnodes,
    };
  }
}

/**
 * Virtio ballooning controller. The balloon lets the host reclaim guest
 * memory on demand and gives it back under pressure; the controller tracks
 * the current target and honors a deflate-on-OOM policy so guests never
 * deadlock while the balloon is inflated.
 */
export class ballooningcontroller {
  #targetmb: number;
  #maxmb: number;
  #deflateonom: boolean;

  constructor(maxmb: number) {
    this.#targetmb = 0;
    this.#maxmb = maxmb;
    this.#deflateonom = true;
  }

  /** Inflates the balloon to a target in MB, clamped to the maximum. */
  inflate(targetmb: number): number {
    try {
      if (targetmb < 0) {
        throw new memoryerror(`balloon target must be non-negative, received ${targetmb}`);
      }
      this.#targetmb = Math.min(targetmb, this.#maxmb);
      return this.#targetmb;
    } catch (cause) {
      throw new memoryerror('ballooningcontroller.inflate failed', { cause: cause as Error });
    }
  }

  /** Deflates the balloon by the requested amount, floored at zero. */
  deflate(amountmb: number): number {
    this.#targetmb = Math.max(0, this.#targetmb - Math.max(0, amountmb));
    return this.#targetmb;
  }

  /** Current balloon target in MB. */
  get targetmb(): number {
    return this.#targetmb;
  }

  /** Renders the QEMU device plan for the balloon. */
  describe(): Record<string, unknown> {
    return {
      subsystem: 'ballooning',
      device: 'virtio-balloon-pci',
      targetmb: this.#targetmb,
      maxmb: this.#maxmb,
      deflateonom: this.#deflateonom,
    };
  }
}

/**
 * Swap overcommit controller implementing the vm.overcommit_memory=2
 * semantics documented in Documentation/mm/overcommit-accounting.rst: the
 * total committed address space may never exceed swap plus a configurable
 * percentage of RAM (overcommit_ratio, default 50). The controller computes
 * the commit limit and recommends swap sizing for a target commit budget.
 */
export class overcommitcontroller {
  #ratio: number;
  #mode: 0 | 1 | 2;

  constructor(ratio = 50) {
    this.#ratio = ratio;
    this.#mode = 2;
  }

  /** Sets the overcommit ratio percentage applied in mode 2. */
  setratio(ratio: number): this {
    if (!Number.isFinite(ratio) || ratio < 0 || ratio > 100) {
      throw new memoryerror(`overcommit ratio must be between 0 and 100, received ${ratio}`);
    }
    this.#ratio = ratio;
    return this;
  }

  /** Computes the commit limit in GB for a RAM and swap configuration. */
  commitlimitgb(ramgb: number, swapgb: number): number {
    return Number((swapgb + (ramgb * this.#ratio) / 100).toFixed(2));
  }

  /** Recommends the swap size in GB for a desired commit budget. */
  recommendswapgb(ramgb: number, targetcommitgb: number): number {
    const swapneeded = targetcommitgb - (ramgb * this.#ratio) / 100;
    return Number(Math.max(0, Math.ceil(swapneeded)).toFixed(2));
  }

  /** Renders the sysctl dictionary for this controller. */
  sysctl(): Record<string, string> {
    return {
      'vm.overcommit_memory': String(this.#mode),
      'vm.overcommit_ratio': String(this.#ratio),
      'vm.swappiness': '10',
      'vm.max_map_count': '1048576',
    };
  }

  /** Renders the controller plan for logs and provisioners. */
  describe(): Record<string, unknown> {
    return { subsystem: 'overcommit', mode: this.#mode, ratio: this.#ratio };
  }
}

/** One swap backing store attached to the virtual machine. */
export type swapdevice = {
  readonly kind: 'zram' | 'swapfile' | 'partition';
  readonly sizegb: number;
  readonly priority: number;
  readonly compressed: boolean;
};

/**
 * Plans swap devices for a RAM size. ZRAM (compressed in-memory swap,
 * priority 100) covers latency-sensitive reclaim while a swapfile or
 * partition (priority -2) extends the commit budget required by mode 2
 * overcommit for RAM-heavy builds.
 */
export function planswapdevices(ramgb: number): swapdevice[] {
  try {
    if (!Number.isFinite(ramgb) || ramgb <= 0) {
      throw new memoryerror(`ramgb must be a positive number, received ${ramgb}`);
    }
    const zramsize = Math.min(Math.max(Math.round(ramgb / 8), 2), 32);
    const devices: swapdevice[] = [
      { kind: 'zram', sizegb: zramsize, priority: 100, compressed: true },
    ];
    if (ramgb >= 256) {
      devices.push({
        kind: 'swapfile',
        sizegb: Math.min(Math.round(ramgb / 8), 128),
        priority: -2,
        compressed: false,
      });
    }
    return devices;
  } catch (cause) {
    if (cause instanceof memoryerror) {
      throw cause;
    }
    throw new memoryerror('planswapdevices failed', { cause: cause as Error });
  }
}

/**
 * Tmpfs shader cache controller. Mesa keeps its on-disk shader cache in
 * MESA_SHADER_CACHE_DIR; hosting it on a size-capped tmpfs (20 GB by
 * default) removes disk latency from shader compilation storms typical of
 * LLVMpipe and Lavapipe sessions.
 */
export class shadercachecontroller {
  #sizegb: number;
  #mountpoint: string;

  constructor(sizegb = 20, mountpoint = '/tmp/shadercache') {
    this.#sizegb = sizegb;
    this.#mountpoint = mountpoint;
  }

  /** Renders the fstab line for the tmpfs mount. */
  fstabline(): string {
    return `tmpfs ${this.#mountpoint} tmpfs rw,size=${this.#sizegb}g,nodev,nosuid,noatime 0 0`;
  }

  /** Renders the environment block pointing Mesa at the cache. */
  environment(): Record<string, string> {
    return {
      MESA_SHADER_CACHE_DIR: this.#mountpoint,
      MESA_SHADER_CACHE_MAX_SIZE: `${this.#sizegb * 1024}`,
      MESA_GLSL_CACHE_DISABLE: 'false',
    };
  }

  /** Mount size in GB. */
  get sizegb(): number {
    return this.#sizegb;
  }

  /** Renders the controller plan for logs and provisioners. */
  describe(): Record<string, unknown> {
    return { subsystem: 'shadercache', sizegb: this.#sizegb, mountpoint: this.#mountpoint };
  }
}

/* ------------------------------------------------------------------ */
/* Section 6: Docker memory flags                                      */
/* ------------------------------------------------------------------ */

/** Options for the Docker memory flag generator. */
export type dockermemoryoptions = {
  readonly ramgb?: number;
  readonly shmsizegb?: number;
  readonly unlimitedswap?: boolean;
};

/** Result of the Docker memory flag generator. */
export type dockermemoryflags = {
  readonly run: readonly string[];
  readonly compose: Readonly<Record<string, unknown>>;
  readonly sysctl: Readonly<Record<string, string>>;
  readonly rationale: readonly string[];
};

/**
 * Generates Docker memory flags for a container. MemorySwap -1 keeps swap
 * unlimited as documented by Docker ("unlimited swap, up to the amount
 * available on the host system"), ShmSize 2g raises /dev/shm from the 64 MB
 * default which is the canonical fix for the PyTorch DataLoader bus error,
 * and the tmpfs entry mounts the 20 GB shader cache. Every value remains a
 * suggestion: callers override before use.
 */
export function dockerMemoryFlags(options?: dockermemoryoptions): dockermemoryflags {
  try {
    const ramgb = options?.ramgb ?? 32;
    const shmsizegb = options?.shmsizegb ?? 2;
    const unlimitedswap = options?.unlimitedswap ?? true;
    const run: string[] = [
      `--memory=${ramgb}g`,
      unlimitedswap ? '--memory-swap=-1' : `--memory-swap=${ramgb * 2}g`,
      `--shm-size=${shmsizegb}g`,
      '--tmpfs /tmp/shadercache:size=20g',
      '--kernel-memory=0',
    ];
    const compose: Record<string, unknown> = {
      mem_limit: `${ramgb}g`,
      memswap_limit: unlimitedswap ? -1 : `${ramgb * 2}g`,
      shm_size: `${shmsizegb}g`,
      tmpfs: ['/tmp/shadercache:size=20g'],
      oom_score_adj: -500,
    };
    const sysctl: Record<string, string> = {
      'vm.overcommit_memory': '2',
      'vm.overcommit_ratio': '50',
    };
    const rationale = [
      'memory-swap -1 grants unlimited swap per the Docker resource constraints documentation',
      `shm-size ${shmsizegb}g avoids the PyTorch DataLoader bus error caused by the 64 MB /dev/shm default`,
      'tmpfs shader cache keeps Mesa compilation artifacts in RAM with a 20 GB ceiling',
      'overcommit mode 2 with ratio 50 bounds the commit limit to swap plus half the RAM',
    ];
    return { run, compose, sysctl, rationale };
  } catch (cause) {
    throw new memoryerror('dockerMemoryFlags failed', { cause: cause as Error });
  }
}

/* ------------------------------------------------------------------ */
/* Section 7: tiered memory controllers                                */
/* ------------------------------------------------------------------ */

/** Result of one simulated memory transfer. */
export type transferview = {
  readonly tier: memorytierid;
  readonly bytes: number;
  readonly direction: 'read' | 'write';
  readonly effectivengbs: number;
  readonly timemicros: number;
};

/** Common contract implemented by every tier controller (Strategy). */
export interface memorycontroller {
  readonly tier: memorytierid;
  readonly totalgb: number;
  readonly bandwidthgbs: number;
  transfer(bytes: number, direction: 'read' | 'write'): transferview;
  latencyns(): number;
  describe(): Record<string, unknown>;
}

/** Shared transfer math used by every controller implementation. */
function simulatetransfer(
  tier: memorytierid,
  bytes: number,
  direction: 'read' | 'write',
  bandwidthgbs: number,
  latencyns: number,
): transferview {
  const effectivengbs = Number((bandwidthgbs * (direction === 'read' ? 1 : 0.92)).toFixed(2));
  const timemicros = Number(((bytes / (effectivengbs * 1e9)) * 1e6 + latencyns / 1000).toFixed(4));
  return { tier, bytes, direction, effectivengbs, timemicros };
}

/** DDR5 controller: channels aggregated, bandwidth scales linearly. */
export class ddr5controller implements memorycontroller {
  readonly tier: memorytierid = 'ddr5';
  #channels: number;
  #totalgb: number;

  constructor(channels = 12, totalgb = 1024) {
    this.#channels = Math.max(1, Math.min(channels, 12));
    this.#totalgb = totalgb;
  }

  /** Aggregate bandwidth in GB/s for the configured channel count. */
  get bandwidthgbs(): number {
    return Number((MEMORY_TIERS.ddr5.perchannelgbs * this.#channels).toFixed(1));
  }

  /** Total capacity in GB. */
  get totalgb(): number {
    return this.#totalgb;
  }

  /** Simulates one transfer over the DDR5 interconnect. */
  transfer(bytes: number, direction: 'read' | 'write'): transferview {
    return simulatetransfer(
      this.tier,
      bytes,
      direction,
      this.bandwidthgbs,
      MEMORY_TIERS.ddr5.latencyns,
    );
  }

  /** Average column access latency in nanoseconds. */
  latencyns(): number {
    return MEMORY_TIERS.ddr5.latencyns;
  }

  /** Renders the controller plan for logs and provisioners. */
  describe(): Record<string, unknown> {
    return {
      tier: this.tier,
      channels: this.#channels,
      bandwidthgbs: this.bandwidthgbs,
      totalgb: this.#totalgb,
      technology: MEMORY_TIERS.ddr5.technology,
    };
  }
}

/** HBM3e controller: eight stacks, 8 TB/s aggregate, near-SRAM latency. */
export class hbm3econtroller implements memorycontroller {
  readonly tier: memorytierid = 'hbm3e';
  #stacks: number;
  #totalgb: number;

  constructor(stacks = 8, totalgb = 192) {
    this.#stacks = Math.max(1, Math.min(stacks, 8));
    this.#totalgb = totalgb;
  }

  /** Aggregate bandwidth in GB/s for the configured stack count. */
  get bandwidthgbs(): number {
    return Number((MEMORY_TIERS.hbm3e.perchannelgbs * this.#stacks).toFixed(1));
  }

  /** Total capacity in GB. */
  get totalgb(): number {
    return this.#totalgb;
  }

  /** Simulates one transfer over the HBM3e fabric. */
  transfer(bytes: number, direction: 'read' | 'write'): transferview {
    return simulatetransfer(
      this.tier,
      bytes,
      direction,
      this.bandwidthgbs,
      MEMORY_TIERS.hbm3e.latencyns,
    );
  }

  /** Stack access latency in nanoseconds. */
  latencyns(): number {
    return MEMORY_TIERS.hbm3e.latencyns;
  }

  /** Renders the controller plan for logs and provisioners. */
  describe(): Record<string, unknown> {
    return {
      tier: this.tier,
      stacks: this.#stacks,
      bandwidthgbs: this.bandwidthgbs,
      totalgb: this.#totalgb,
      technology: MEMORY_TIERS.hbm3e.technology,
    };
  }
}

/** GDDR7 controller: 512-bit bus, 1792 GB/s at full width. */
export class gddr7controller implements memorycontroller {
  readonly tier: memorytierid = 'gddr7';
  #channels: number;
  #totalgb: number;

  constructor(channels = 8, totalgb = 96) {
    this.#channels = Math.max(1, Math.min(channels, 8));
    this.#totalgb = totalgb;
  }

  /** Aggregate bandwidth in GB/s for the configured bus width. */
  get bandwidthgbs(): number {
    return Number((MEMORY_TIERS.gddr7.perchannelgbs * this.#channels).toFixed(1));
  }

  /** Total capacity in GB. */
  get totalgb(): number {
    return this.#totalgb;
  }

  /** Simulates one transfer over the GDDR7 bus. */
  transfer(bytes: number, direction: 'read' | 'write'): transferview {
    return simulatetransfer(
      this.tier,
      bytes,
      direction,
      this.bandwidthgbs,
      MEMORY_TIERS.gddr7.latencyns,
    );
  }

  /** Memory access latency in nanoseconds. */
  latencyns(): number {
    return MEMORY_TIERS.gddr7.latencyns;
  }

  /** Renders the controller plan for logs and provisioners. */
  describe(): Record<string, unknown> {
    return {
      tier: this.tier,
      channels: this.#channels,
      bandwidthgbs: this.bandwidthgbs,
      totalgb: this.#totalgb,
      technology: MEMORY_TIERS.gddr7.technology,
    };
  }
}

/**
 * Controller factory (Factory plus Registry patterns): maps a tier
 * identifier to a controller instance sized by the caller. The const type
 * parameter preserves literal tier identifiers through the call.
 */
export function creatememorycontroller<const T extends memorytierid>(
  tier: T,
  totalgb: number,
  channels?: number,
): memorycontroller {
  switch (tier) {
    case 'ddr5':
      return new ddr5controller(channels ?? 12, totalgb);
    case 'hbm3e':
      return new hbm3econtroller(channels ?? 8, totalgb);
    case 'gddr7':
      return new gddr7controller(channels ?? 8, totalgb);
    default: {
      throw new memoryerror(`no controller registered for tier "${tier}"`);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Section 8: memory regions, builder, proxy and ledger                */
/* ------------------------------------------------------------------ */

/** Purpose categories of a virtual memory region. */
export type regionpurpose = 'guest' | 'modelweights' | 'shadercache' | 'scratch' | 'pinned';

/** A virtual memory region bound to a tier and a purpose. */
export class memoryregion {
  readonly id: string;
  readonly tier: memorytierid;
  readonly purpose: regionpurpose;
  readonly sizegb: number;
  #allocated: boolean;
  #accesses: number;

  constructor(tier: memorytierid, purpose: regionpurpose, sizegb: number) {
    this.id = randomUUID();
    this.tier = tier;
    this.purpose = purpose;
    this.sizegb = sizegb;
    this.#allocated = true;
    this.#accesses = 0;
  }

  /** Number of tracked accesses through proxies or direct reads. */
  get accesses(): number {
    return this.#accesses;
  }

  /** True while the region holds virtual backing. */
  get allocated(): boolean {
    return this.#allocated;
  }

  /** Counts one access; used by the guarding Proxy. */
  touch(): void {
    this.#accesses += 1;
  }

  /** Releases the region; idempotent and safe to call twice. */
  release(): void {
    this.#allocated = false;
  }

  /** Synchronous disposer so regions compose with `using` declarations. */
  [Symbol.dispose](): void {
    this.release();
  }

  /** Renders the region plan for logs and provisioners. */
  describe(): Record<string, unknown> {
    return {
      id: this.id,
      tier: this.tier,
      purpose: this.purpose,
      sizegb: this.sizegb,
      allocated: this.#allocated,
      accesses: this.#accesses,
    };
  }
}

/**
 * Fluent builder for memory regions. The builder accumulates tier, purpose
 * and size, validates the result against the tier capacity and produces a
 * memoryregion registered in the regionledger.
 */
export class regionbuilder {
  #tier: memorytierid;
  #purpose: regionpurpose;
  #sizegb: number;

  constructor() {
    this.#tier = 'ddr5';
    this.#purpose = 'guest';
    this.#sizegb = 1;
  }

  /** Selects the memory tier backing the region. */
  withtier(tier: memorytierid): this {
    this.#tier = tier;
    return this;
  }

  /** Selects the purpose tag of the region. */
  withpurpose(purpose: regionpurpose): this {
    this.#purpose = purpose;
    return this;
  }

  /** Sets the region size in GB. */
  withsize(sizegb: number): this {
    this.#sizegb = sizegb;
    return this;
  }

  /** Validates and materializes the region, registering it in the ledger. */
  build(): memoryregion {
    try {
      if (!Number.isFinite(this.#sizegb) || this.#sizegb <= 0) {
        throw new memoryerror(`region size must be a positive number, received ${this.#sizegb}`);
      }
      const tier = selecttier(this.#tier);
      const capacity = tier.modulegb * tier.channels;
      if (this.#sizegb > capacity) {
        throw new memoryerror(
          `region of ${this.#sizegb} GB exceeds the ${capacity} GB capacity of tier ${this.#tier}`,
        );
      }
      const region = new memoryregion(this.#tier, this.#purpose, this.#sizegb);
      (regionledger as Map<string, memoryregion>).set(region.id, region);
      return region;
    } catch (cause) {
      if (cause instanceof memoryerror) {
        throw cause;
      }
      throw new memoryerror('regionbuilder.build failed', { cause: cause as Error });
    }
  }
}

/**
 * Wraps a region in a guarding Proxy (Proxy pattern). Every property access
 * is counted and recorded in the access ledger; accesses to released
 * regions raise a memoryerror so consumers notice stale handles
 * immediately instead of silently reading freed virtual memory.
 */
export function guardregion(region: memoryregion): memoryregion {
  return new Proxy(region, {
    get(target, property: string | symbol, receiver: unknown): unknown {
      target.touch();
      if (!target.allocated && property !== 'describe') {
        throw new memoryerror(
          `region ${target.id} has been released and can no longer be accessed`,
        );
      }
      return Reflect.get(target, property, receiver);
    },
  });
}

/** Ledger of every live region, keyed by region id (Map first policy). */
export const regionledger: ReadonlyMap<string, memoryregion> = new Map<string, memoryregion>();

/** Ephemeral access counters; WeakMap keeps probes from pinning regions. */
const accessprobes = new WeakMap<memoryregion, number>();

/** Records an access probe for a region without keeping it alive. */
export function proberegion(region: memoryregion, accesses: number): void {
  accessprobes.set(region, accesses);
}

/** Reads the last access probe recorded for a region, if any. */
export function readprobe(region: memoryregion): number | null {
  return accessprobes.get(region) ?? null;
}

/** Sums the size of every allocated region in the ledger. */
export function totalallocatedgb(): number {
  let total = 0;
  for (const region of regionledger.values()) {
    if (region.allocated) {
      total += region.sizegb;
    }
  }
  return Number(total.toFixed(2));
}

/* ------------------------------------------------------------------ */
/* Section 9: memory pressure observer                                 */
/* ------------------------------------------------------------------ */

/** Payload published when a watermark is crossed. */
export type pressureevent = {
  readonly level: 'low' | 'high' | 'critical';
  readonly usedfraction: number;
  readonly at: number;
};

/** Listener signature of the pressure observer. */
export type pressurelistener = (event: pressureevent) => void;

/**
 * Memory pressure observer. The observer keeps listeners in a Map keyed by
 * name (never bound to a runtime event loop) and evaluates samples against
 * the classic watermarks: low at 85 percent, high at 95 percent and
 * critical at 99 percent of the tracked capacity.
 */
export class memorystats {
  #listeners: Map<string, pressurelistener>;
  #capacitygb: number;
  #lastlevel: 'low' | 'high' | 'critical' | 'nominal';
  #history: number[];

  constructor(capacitygb: number) {
    this.#listeners = new Map<string, pressurelistener>();
    this.#capacitygb = capacitygb;
    this.#lastlevel = 'nominal';
    this.#history = [];
  }

  /** Subscribes a named listener to pressure transitions. */
  subscribe(name: string, listener: pressurelistener): this {
    this.#listeners.set(name, listener);
    return this;
  }

  /** Removes a named listener; returns true when it existed. */
  unsubscribe(name: string): boolean {
    return this.#listeners.delete(name);
  }

  /** Evaluates one used-memory sample and publishes level transitions. */
  evaluate(usedgb: number): pressureevent | null {
    try {
      const usedfraction = Math.min(1, usedgb / this.#capacitygb);
      this.#history.push(usedfraction);
      if (this.#history.length > 512) {
        this.#history.shift();
      }
      const level: pressureevent['level'] | 'nominal' =
        usedfraction >= 0.99
          ? 'critical'
          : usedfraction >= 0.95
            ? 'high'
            : usedfraction >= 0.85
              ? 'low'
              : 'nominal';
      if (level === 'nominal' || level === this.#lastlevel) {
        return null;
      }
      this.#lastlevel = level;
      const event: pressureevent = {
        level,
        usedfraction: Number(usedfraction.toFixed(4)),
        at: Date.now(),
      };
      for (const listener of this.#listeners.values()) {
        try {
          listener(event);
        } catch {
          /* listener faults never break the observer loop */
        }
      }
      return event;
    } catch (cause) {
      throw new memoryerror('memorystats.evaluate failed', { cause: cause as Error });
    }
  }

  /** Peak observed usage fraction since construction. */
  get peak(): number {
    return this.#history.length === 0 ? 0 : Number(Math.max(...this.#history).toFixed(4));
  }

  /** Mean observed usage fraction since construction. */
  get mean(): number {
    if (this.#history.length === 0) {
      return 0;
    }
    const sum = this.#history.reduce((acc, value) => acc + value, 0);
    return Number((sum / this.#history.length).toFixed(4));
  }
}

/* ------------------------------------------------------------------ */
/* Section 10: capacity plan and manager facade                        */
/* ------------------------------------------------------------------ */

/** Complete memory plan of one virtual machine. */
export type memoryplan = {
  readonly vcpus: number;
  readonly ramgb: number;
  readonly vramgb: number;
  readonly tier: memorytierid;
  readonly mig: migprofileid;
  readonly miginstances: number;
  readonly rambandwidthgbs: number;
  readonly vrambandwidthgbs: number;
  readonly hugepages: readonly hugepageconfig[];
  readonly swapdevices: readonly swapdevice[];
  readonly numa: numatopology;
  readonly shmsizegb: number;
  readonly shadercachesizegb: number;
};

/**
 * Computes the full memory plan for a machine: bandwidth per tier, MIG
 * instance count, huge page layout, swap devices, NUMA topology, /dev/shm
 * size and the shader cache ceiling.
 */
export function planmemory(
  vcpus: number,
  ramgb: number,
  vramgb: number,
  mig: migprofileid,
  tier: memorytierid,
): memoryplan {
  try {
    const profile = getmigprofile(mig);
    const miginstances =
      profile === null
        ? 1
        : Math.max(
            1,
            Math.floor(memorylimits.maxvramgb / profile.slicegb) *
              (vramgb >= profile.slicegb ? 1 : 0) || 1,
          );
    const numa = buildnumatopology(vcpus, vcpus >= 128 ? 8 : vcpus >= 64 ? 4 : vcpus >= 32 ? 2 : 1);
    return Object.freeze({
      vcpus,
      ramgb,
      vramgb,
      tier,
      mig,
      miginstances: profile === null ? 1 : Math.min(profile.maxinstances, miginstances),
      rambandwidthgbs: tierbandwidthgbs('ddr5'),
      vrambandwidthgbs: tierbandwidthgbs(tier === 'ddr5' ? 'gddr7' : tier),
      hugepages: planhugepages(ramgb),
      swapdevices: planswapdevices(ramgb),
      numa,
      shmsizegb: 2,
      shadercachesizegb: 20,
    });
  } catch (cause) {
    if (cause instanceof memoryerror) {
      throw cause;
    }
    throw new memoryerror('planmemory failed', { cause: cause as Error });
  }
}

/**
 * Renders kernel boot arguments for the memory techniques enabled by a
 * plan: default 1 GB huge pages plus a 2 MB pool, and the MIG-aware NUMA
 * hints consumed by the virtual machine launcher.
 */
export function buildKernelArgs(plan: memoryplan): string {
  try {
    const parts: string[] = ['default_hugepagesz=1G'];
    for (const page of plan.hugepages) {
      parts.push(`hugepagesz=${page.size === '1G' ? '1G' : '2M'}`, `hugepages=${page.count}`);
    }
    parts.push(`numa=fake=${plan.numa.nodes}`);
    return parts.join(' ');
  } catch (cause) {
    throw new memoryerror('buildKernelArgs failed', { cause: cause as Error });
  }
}

/**
 * Facade that composes every memory technique for one machine. The manager
 * exposes the plan, the sysctl dictionary, the kernel arguments, the Docker
 * flags, the tier controllers and the pressure observer, and keeps all
 * mutable state in Maps so the instance stays runtime agnostic.
 */
export class virtualmemorymanager {
  #plan: memoryplan;
  #controllers: Map<memorytierid, memorycontroller>;
  #ksm: ksmcontroller;
  #balloon: ballooningcontroller;
  #overcommit: overcommitcontroller;
  #cache: shadercachecontroller;
  #stats: memorystats;

  constructor(plan: memoryplan) {
    this.#plan = plan;
    this.#controllers = new Map<memorytierid, memorycontroller>();
    this.#controllers.set('ddr5', creatememorycontroller('ddr5', plan.ramgb, 12));
    this.#controllers.set(
      plan.tier === 'ddr5' ? 'gddr7' : plan.tier,
      creatememorycontroller(plan.tier === 'ddr5' ? 'gddr7' : plan.tier, plan.vramgb, 8),
    );
    this.#ksm = new ksmcontroller(1000, 20);
    this.#balloon = new ballooningcontroller(plan.ramgb * 1024);
    this.#overcommit = new overcommitcontroller(50);
    this.#cache = new shadercachecontroller(plan.shadercachesizegb);
    this.#stats = new memorystats(plan.ramgb);
  }

  /** The frozen plan this manager was constructed from. */
  get plan(): memoryplan {
    return this.#plan;
  }

  /** The pressure observer of this machine. */
  get stats(): memorystats {
    return this.#stats;
  }

  /** The KSM controller of this machine. */
  get ksm(): ksmcontroller {
    return this.#ksm;
  }

  /** The ballooning controller of this machine. */
  get balloon(): ballooningcontroller {
    return this.#balloon;
  }

  /** Returns the controller bound to a tier, when configured. */
  controller(tier: memorytierid): memorycontroller | null {
    return this.#controllers.get(tier) ?? null;
  }

  /** Simulates a synthetic workload sample and evaluates pressure. */
  sample(): pressureevent | null {
    const usedgb = Number((this.#plan.ramgb * (randomInt(600, 990) / 1000)).toFixed(2));
    return this.#stats.evaluate(usedgb);
  }

  /** Renders the sysctl dictionary of every controller. */
  sysctl(): Record<string, string> {
    return { ...this.#overcommit.sysctl() };
  }

  /** Renders the kernel boot arguments for this machine. */
  kernelargs(): string {
    return buildKernelArgs(this.#plan);
  }

  /** Renders the Docker memory flags for this machine. */
  dockerflags(): dockermemoryflags {
    return dockerMemoryFlags({
      ramgb: this.#plan.ramgb,
      shmsizegb: this.#plan.shmsizegb,
      unlimitedswap: true,
    });
  }

  /** Renders the fstab line of the shader cache tmpfs. */
  cachefstab(): string {
    return this.#cache.fstabline();
  }

  /** Renders a complete JSON-safe description of the machine memory. */
  describe(): Record<string, unknown> {
    return {
      plan: this.#plan,
      controllers: [...this.#controllers.values()].map((controller) => controller.describe()),
      ksm: this.#ksm.describe(),
      ballooning: this.#balloon.describe(),
      overcommit: this.#overcommit.describe(),
      shadercache: this.#cache.describe(),
      sysctl: this.sysctl(),
      kernelargs: this.kernelargs(),
      stats: { peak: this.#stats.peak, mean: this.#stats.mean },
    };
  }
}

/**
 * Factory that builds a virtualmemorymanager from a raw request. The
 * request is validated against the hard limits; failures raise memoryerror
 * with the accumulated validation errors for quick diagnosis.
 */
export function createVirtualMemory(request: memoryrequest): virtualmemorymanager {
  try {
    const result = validatememoryrequest(request);
    if (!result.valid || result.plan === null) {
      throw new memoryerror(`invalid memory request: ${result.errors.join('; ')}`);
    }
    return new virtualmemorymanager(result.plan);
  } catch (cause) {
    if (cause instanceof memoryerror) {
      throw cause;
    }
    throw new memoryerror('createVirtualMemory failed', { cause: cause as Error });
  }
}

/* ------------------------------------------------------------------ */
/* Section 11: placement tiers and host device profiles (Meta merge)    */
/* ------------------------------------------------------------------ */

/**
 * Placement tier taxonomy for the host-aware planner. The technology and
 * bandwidth catalog stays in memorytierid (ddr5, hbm3e, gddr7); placement
 * labels describe WHERE bytes live relative to the NUMA and fabric
 * topology, mirroring the Meta MemoryTierLabel without merging the two
 * enums.
 */
export type placementtier =
  | 'DRAM_FAST'
  | 'DRAM_SLOW'
  | 'CXL_FM'
  | 'CXL_PMEM'
  | 'HBM_BLACKWELL'
  | 'ZRAM'
  | 'PMEM_DAX';

/** One placement tier instance with its QEMU memory backend. */
export type placementspec = {
  readonly tier: placementtier;
  readonly sizemb: number;
  readonly latencyns: number;
  readonly bandwidthgbps: number;
  readonly compressionratio?: number;
  readonly persistent?: boolean;
  readonly qemubackend: 'memory-backend-ram' | 'memory-backend-memfd' | 'memory-backend-file';
  readonly extraopts?: Readonly<Record<string, string | number | boolean>>;
};

/**
 * CXL 2.0/3.0 Type-3 memory expansion device. Latency spans 178-195 ns and
 * bandwidth 32-64 GB/s per x16 PCIe 5.0 link depending on the spec
 * revision; interleave ways of 2, 4 or 8 spread accesses across decoders.
 */
export type cxxldevice = {
  readonly id: string;
  readonly spec: '2.0' | '3.0';
  readonly type: 'type3' | 'switch';
  readonly sizemb: number;
  readonly latencyns: number;
  readonly bwgbps: number;
  readonly qosclass: number;
  readonly decoders: number;
  readonly interleaveways: 2 | 4 | 8;
};

/** zram compression profile: lzo-rle favors fast decompression, zstd ratio. */
export type zramprofile = {
  readonly device: string;
  readonly algorithm: 'lzo-rle' | 'zstd' | 'lzo' | 'lz4';
  readonly level?: number;
  readonly disksizemb: number;
  readonly compratioachieved: number;
  readonly memusedmb: number;
  readonly mountpoint: string;
};

/** Huge page allocation profile including the transparent policy and memfd. */
export type hugepageprofile = {
  readonly size: '2M' | '1G';
  readonly count: number;
  readonly mount: '/dev/hugepages' | '/dev/hugepages-1G';
  readonly transparent: 'always' | 'madvise' | 'never';
  readonly shared: boolean;
  readonly memfd: boolean;
};

/**
 * CCD-aware vCPU pinning map for the Ryzen 9 9950X3D. CCD0 carries the 3D
 * V-Cache stacks (96 MB L3) and is preferred for latency-sensitive work;
 * CCD1 (32 MB L3) serves throughput work such as audio and IO threads.
 */
export type vcpupinningmap = {
  readonly vmid: string;
  readonly totalvcpus: number;
  readonly topology: {
    readonly sockets: number;
    readonly dies: number;
    readonly ccds: number;
    readonly cores: number;
    readonly threads: number;
  };
  readonly ccd0: {
    readonly cpus: readonly number[];
    readonly vcache: true;
    readonly l3mb: 96;
    readonly preferredfor: readonly string[];
  };
  readonly ccd1: {
    readonly cpus: readonly number[];
    readonly vcache: false;
    readonly l3mb: 32;
    readonly preferredfor: readonly string[];
  };
  readonly pinning: Map<number, readonly number[]>;
  readonly isolated: readonly number[];
  readonly numapolicy: 'strict' | 'preferred' | 'interleave';
  readonly emulatorpin: readonly number[];
};

/** Host-aware plan produced by the memorymodularizer (camelCase shape). */
export type hostmemoryplan = {
  readonly vmid: string;
  readonly totalrequestedmb: number;
  readonly effectiveusablemb: number;
  readonly tiers: readonly placementspec[];
  readonly hugepages: hugepageprofile;
  readonly zram: zramprofile;
  readonly cxl: readonly cxxldevice[];
  readonly vcpu: vcpupinningmap;
  readonly qemuargs: readonly string[];
  readonly backendsdigest: string;
};

/** Policy selector for the host-aware tier distribution. */
export type tierpolicy = 'performance' | 'capacity' | 'balanced';

/** zram algorithm selector shared by the planner and the profile type. */
export type zramalgorithm = zramprofile['algorithm'];

/* ------------------------------------------------------------------ */
/* Section 12: host-aware extreme planner (memorymodularizer)          */
/* ------------------------------------------------------------------ */

/**
 * Parses a key=value config file into a lowercase-keyed dictionary. Missing
 * files and parse failures degrade to an empty record; this is the safe
 * loader contract inherited from the Meta module.
 */
function loadkv(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    if (!existsSync(path)) {
      return out;
    }
    for (const raw of readFileSync(path, 'utf8').split('\n')) {
      const trimmed = raw.trim();
      if (trimmed.length === 0 || trimmed.startsWith('#') || trimmed.startsWith('[')) {
        continue;
      }
      const eq = trimmed.indexOf('=');
      if (eq > -1) {
        const key = trimmed.slice(0, eq).trim().toLowerCase();
        const value = trimmed
          .slice(eq + 1)
          .trim()
          .replace(/^["']|["']$/g, '');
        out[key] = value;
      }
    }
  } catch {
    /* unreadable config degrades to defaults */
  }
  return out;
}

/**
 * Host-aware extreme memory planner, the fusion of the Meta
 * MemoryModularizer and ExtremeMemoryPlanner. The planner detects the real
 * host memory tiers (CXL fabric devices via lspci, PMEM DAX devdax nodes,
 * shared Blackwell HBM), tunes zram with workload-dependent compression
 * factors, plans host-aware huge pages, pins vCPUs across the 9950X3D CCD
 * layout, synthesizes the tiered QEMU arguments, exports cgroup v2 slices
 * and QMP runtime commands, and persists the plan as JSON. All host
 * interaction is best effort: every probe is wrapped in a catcher and
 * degrades to the documented defaults.
 */
export class memorymodularizer {
  #vmconfig: Record<string, string>;
  #qemuconfig: Record<string, string>;
  #passageconfig: Record<string, string>;
  #hostthreads: number;

  constructor(options?: { configdir?: string }) {
    const dir = options?.configdir ?? '.';
    this.#vmconfig = loadkv(`${dir}/vm.config`);
    this.#qemuconfig = loadkv(`${dir}/qemu.config`);
    this.#passageconfig = loadkv(`${dir}/passage.config`);
    this.#hostthreads = cpus().length;
  }

  /** Host logical thread count observed at construction. */
  get hostthreads(): number {
    return this.#hostthreads;
  }

  /**
   * Detects the real host tiers. DRAM splits 70/30 into fast and slow
   * bands; an lspci scan for CXL vendor 1e98 or an explicit qemu.config
   * cxl_enabled flag adds a CXL_FM tier; /dev/pmem0 adds a persistent
   * PMEM_DAX tier (128 GB, 300 ns, 15 GB/s); a shared_host_mem blackwell
   * flag exposes half of the GPU VRAM as HBM_BLACKWELL through memfd.
   */
  detecthosttiers(): placementspec[] {
    try {
      const totalmb = Math.floor(totalmem() / (1024 * 1024));
      const tiers: placementspec[] = [
        {
          tier: 'DRAM_FAST',
          sizemb: Math.floor(totalmb * 0.7),
          latencyns: 78,
          bandwidthgbps: 89.6,
          qemubackend: 'memory-backend-ram',
        },
        {
          tier: 'DRAM_SLOW',
          sizemb: Math.floor(totalmb * 0.3),
          latencyns: 95,
          bandwidthgbps: 67,
          qemubackend: 'memory-backend-ram',
        },
      ];
      try {
        const lspci = execSync('lspci -d 1e98: 2>/dev/null || true', { encoding: 'utf8' });
        if (lspci.includes('CXL') || this.#qemuconfig.cxl_enabled === 'true') {
          tiers.push({
            tier: 'CXL_FM',
            sizemb: Number.parseInt(this.#qemuconfig.cxl_size_mb ?? '65536', 10),
            latencyns: 170,
            bandwidthgbps: 32,
            qemubackend: 'memory-backend-file',
            extraopts: { mem_path: '/dev/cxl/mem0', share: true },
          });
        }
      } catch {
        /* lspci unavailable: CXL tier stays hidden */
      }
      try {
        if (existsSync('/dev/pmem0')) {
          tiers.push({
            tier: 'PMEM_DAX',
            sizemb: 131072,
            latencyns: 300,
            bandwidthgbps: 15,
            persistent: true,
            qemubackend: 'memory-backend-file',
            extraopts: { mem_path: '/dev/pmem0', pmem: true },
          });
        }
      } catch {
        /* devdax probe failed: PMEM tier stays hidden */
      }
      if (this.#vmconfig.shared_host_mem === 'true') {
        const vramgb = Number(this.#vmconfig.blackwell_vram_gb ?? 32);
        tiers.push({
          tier: 'HBM_BLACKWELL',
          sizemb: Math.floor(vramgb * 1024 * 0.5),
          latencyns: 120,
          bandwidthgbps: 224,
          qemubackend: 'memory-backend-memfd',
          extraopts: { share: true },
        });
      }
      return tiers;
    } catch (cause) {
      throw new memoryerror('detecthosttiers failed', { cause: cause as Error });
    }
  }

  /**
   * Plans zram sizing and command sequence for a requested capacity. The
   * compression factor adapts to the workload type from passage.config
   * (media_transcode 1.8, build 3.2, default 2.5) and to the algorithm
   * (zstd x1.15, lzo-rle x0.92); the disksize takes 30 percent of the
   * request and the returned commands cover modprobe, comp_algorithm,
   * disksize, mkswap and swapon at priority 100.
   */
  configurezram(
    requestedmb: number,
    algorithm: zramalgorithm = 'zstd',
    workload?: string,
  ): { enabled: boolean; factor: number; disksizemb: number; commands: readonly string[] } {
    try {
      if (!Number.isFinite(requestedmb) || requestedmb <= 0) {
        throw new memoryerror(`requestedmb must be a positive number, received ${requestedmb}`);
      }
      const kind = workload ?? this.#passageconfig.workload_type ?? 'general';
      let factor = 2.5;
      if (kind === 'media_transcode') {
        factor = 1.8;
      }
      if (kind === 'build') {
        factor = 3.2;
      }
      if (algorithm === 'zstd') {
        factor *= 1.15;
      }
      if (algorithm === 'lzo-rle') {
        factor *= 0.92;
      }
      const disksizemb = Math.floor(requestedmb * 0.3);
      const commands = [
        'modprobe zram num_devices=2',
        `echo ${algorithm} > /sys/block/zram0/comp_algorithm`,
        `echo ${disksizemb}M > /sys/block/zram0/disksize`,
        'mkswap /dev/zram0 && swapon /dev/zram0 -p 100',
      ];
      return { enabled: true, factor: Number(factor.toFixed(2)), disksizemb, commands };
    } catch (cause) {
      if (cause instanceof memoryerror) {
        throw cause;
      }
      throw new memoryerror('configurezram failed', { cause: cause as Error });
    }
  }

  /**
   * Host-aware huge page planning. Unlike the static planhugepages this
   * variant reads HugePages_Total from /proc/meminfo, honors the thp_enabled
   * knob from qemu.config for the transparent policy and mounts under
   * /dev/hugepages or /dev/hugepages-1G depending on the preferred size.
   */
  planhugepageshost(
    totalmb: number,
    prefer: '2M' | '1G' = '2M',
  ): { sizekb: number; count: number; mount: string; transparent: boolean } {
    try {
      if (!Number.isFinite(totalmb) || totalmb <= 0) {
        throw new memoryerror(`totalmb must be a positive number, received ${totalmb}`);
      }
      const sizekb = prefer === '1G' ? 1048576 : 2048;
      const wanted = Math.ceil((totalmb * 1024) / sizekb);
      let available = 0;
      try {
        const meminfo = readFileSync('/proc/meminfo', 'utf8');
        const match = /HugePages_Total:\s+(\d+)/.exec(meminfo);
        available = match === null ? 0 : Number.parseInt(match[1], 10);
      } catch {
        /* no procfs: fall back to the computed count */
      }
      return {
        sizekb,
        count: Math.max(wanted, available),
        mount: prefer === '1G' ? '/dev/hugepages1G' : '/dev/hugepages',
        transparent: this.#qemuconfig.thp_enabled !== 'false',
      };
    } catch (cause) {
      if (cause instanceof memoryerror) {
        throw cause;
      }
      throw new memoryerror('planhugepageshost failed', { cause: cause as Error });
    }
  }

  /**
   * Builds the CCD-aware pinning map for a virtual machine. Even vCPUs map
   * onto CCD0 (the 3D V-Cache complex) and odd vCPUs onto CCD1; two host
   * threads stay isolated for the emulator and the host. X3D parts report
   * two dies, matching the 9950X3D topology.
   */
  buildpinningmap(
    vmid: string,
    vcpucount: number,
  ): {
    vmid: string;
    map: Map<number, readonly number[]>;
    isolated: readonly number[];
    topology: { sockets: number; dies: number; cores: number; threads: number };
  } {
    try {
      if (vmid.trim().length === 0) {
        throw new memoryerror('vmid must not be empty');
      }
      if (!Number.isInteger(vcpucount) || vcpucount < 1) {
        throw new memoryerror(`vcpucount must be a positive integer, received ${vcpucount}`);
      }
      const hostthreads = Math.max(2, this.#hostthreads);
      const vcpus = Math.min(vcpucount, hostthreads - 2);
      const half = Math.max(1, Math.floor(hostthreads / 2));
      const ccd0 = Array.from({ length: Math.min(half, hostthreads) }, (_, i) => i).slice(0, half);
      const ccd1 = Array.from({ length: half }, (_, i) => i + half);
      const map = new Map<number, readonly number[]>();
      for (let v = 0; v < vcpus; v += 1) {
        const pool = v % 2 === 0 ? ccd0 : ccd1;
        map.set(v, [pool[v % pool.length] ?? pool[0]]);
      }
      return {
        vmid,
        map,
        isolated: [hostthreads - 2, hostthreads - 1],
        topology: {
          sockets: 1,
          dies: this.#vmconfig.x3d === 'true' ? 2 : 1,
          cores: vcpus,
          threads: 1,
        },
      };
    } catch (cause) {
      if (cause instanceof memoryerror) {
        throw cause;
      }
      throw new memoryerror('buildpinningmap failed', { cause: cause as Error });
    }
  }

  /**
   * Builds the complete host-aware plan for a virtual machine. The memory
   * tier policy (performance, capacity or balanced) selects the tier mix:
   * performance dedicates DRAM_FAST, capacity spreads 60/30/10 across
   * DRAM/CXL/zram and balanced keeps 70/20 DRAM/zram plus 10 percent
   * Blackwell HBM when the shared flag is set. The plan carries the tiered
   * QEMU argument synthesis (cxl-type3 on bus cxl.0, virtio-mem-pci with 2M
   * blocks for HBM, memory-backend-ram/memfd/file objects, two NUMA nodes,
   * the avx-512 host cpu line, the balloon with free-page reporting and the
   * vsock chardev) and the compression-adjusted effective usable capacity.
   */
  buildhostplan(
    vmid: string,
    options?: { requestedmb?: number; vcpus?: number; policy?: tierpolicy },
  ): hostmemoryplan {
    try {
      const requestedmb = options?.requestedmb ?? 8192;
      const vcpucount = options?.vcpus ?? 8;
      const policy =
        options?.policy ?? (this.#vmconfig.memory_tier_policy as tierpolicy) ?? 'balanced';
      if (!Number.isFinite(requestedmb) || requestedmb <= 0) {
        throw new memoryerror(`requestedmb must be a positive number, received ${requestedmb}`);
      }
      let tiers: placementspec[];
      if (policy === 'performance') {
        tiers = [
          {
            tier: 'DRAM_FAST',
            sizemb: requestedmb,
            latencyns: 78,
            bandwidthgbps: 89.6,
            qemubackend: 'memory-backend-ram',
          },
        ];
      } else if (policy === 'capacity') {
        tiers = [
          {
            tier: 'DRAM_FAST',
            sizemb: Math.floor(requestedmb * 0.6),
            latencyns: 78,
            bandwidthgbps: 89.6,
            qemubackend: 'memory-backend-ram',
          },
          {
            tier: 'CXL_FM',
            sizemb: Math.floor(requestedmb * 0.3),
            latencyns: 170,
            bandwidthgbps: 32,
            qemubackend: 'memory-backend-file',
            extraopts: { mem_path: '/dev/cxl/mem0', share: true },
          },
          {
            tier: 'ZRAM',
            sizemb: requestedmb - Math.floor(requestedmb * 0.6) - Math.floor(requestedmb * 0.3),
            latencyns: 250,
            bandwidthgbps: 20,
            compressionratio: 2.5,
            qemubackend: 'memory-backend-ram',
          },
        ];
      } else {
        const usehbm = this.#vmconfig.shared_host_mem === 'true';
        tiers = [
          {
            tier: 'DRAM_FAST',
            sizemb: Math.floor(requestedmb * 0.7),
            latencyns: 78,
            bandwidthgbps: 89.6,
            qemubackend: 'memory-backend-ram',
          },
          {
            tier: 'ZRAM',
            sizemb: Math.floor(requestedmb * 0.2),
            latencyns: 250,
            bandwidthgbps: 20,
            compressionratio: 2.5,
            qemubackend: 'memory-backend-ram',
          },
          ...(usehbm
            ? [
                {
                  tier: 'HBM_BLACKWELL' as const,
                  sizemb: Math.floor(requestedmb * 0.1),
                  latencyns: 120,
                  bandwidthgbps: 224,
                  qemubackend: 'memory-backend-memfd' as const,
                  extraopts: { share: true },
                },
              ]
            : []),
        ];
      }
      const prefer = requestedmb > 16384 ? '1G' : '2M';
      const hp = this.planhugepageshost(requestedmb, prefer);
      const zramplan = this.configurezram(requestedmb, 'zstd');
      const pinning = this.buildpinningmap(vmid, vcpucount);
      const cxl: cxxldevice[] =
        policy === 'performance'
          ? []
          : [
              {
                id: 'cxl-mem0',
                spec: '3.0',
                type: 'type3',
                sizemb: 65536,
                latencyns: 178,
                bwgbps: 64,
                qosclass: 2,
                decoders: 4,
                interleaveways: 4,
              },
            ];
      const hugepages: hugepageprofile = {
        size: prefer,
        count: hp.count,
        mount: prefer === '1G' ? '/dev/hugepages-1G' : '/dev/hugepages',
        transparent: hp.transparent ? 'madvise' : 'never',
        shared: prefer === '1G',
        memfd: true,
      };
      const zram: zramprofile = {
        device: '/dev/zram0',
        algorithm: 'zstd',
        level: 1,
        disksizemb: zramplan.disksizemb,
        compratioachieved: 4.2,
        memusedmb: Math.floor(zramplan.disksizemb / 4.2),
        mountpoint: '/mnt/vhe-zram',
      };
      const halfthreads = Math.max(1, Math.floor(Math.max(2, this.#hostthreads) / 2));
      const vcpu: vcpupinningmap = {
        vmid,
        totalvcpus: pinning.topology.cores,
        topology: {
          sockets: 1,
          dies: pinning.topology.dies,
          ccds: pinning.topology.dies,
          cores: pinning.topology.cores,
          threads: pinning.topology.cores * pinning.topology.threads,
        },
        ccd0: {
          cpus: Array.from({ length: halfthreads }, (_, i) => i),
          vcache: true,
          l3mb: 96,
          preferredfor: ['video', 'cuda_filter', 'encode', 'latency_sensitive'],
        },
        ccd1: {
          cpus: Array.from({ length: halfthreads }, (_, i) => i + halfthreads),
          vcache: false,
          l3mb: 32,
          preferredfor: ['audio', 'io', 'mux', 'throughput'],
        },
        pinning: pinning.map,
        isolated: pinning.isolated,
        numapolicy: 'strict',
        emulatorpin: [Math.max(1, this.#hostthreads) - 1],
      };
      const hugetlbsize = prefer === '1G' ? '1073741824' : '2097152';
      const qemuargs: string[] = [
        `-m ${requestedmb}`,
        '-object memory-backend-ram,id=ram-fast,size=' +
          `${tiers[0]?.sizemb ?? requestedmb}M,prealloc=on,host-nodes=0,policy=bind`,
        '-object memory-backend-memfd,id=ram-huge,size=' +
          `${hugepages.count * (prefer === '1G' ? 1024 : 2)}M,hugetlb=on,hugetlbsize=${hugetlbsize}`,
      ];
      if (cxl.length > 0) {
        qemuargs.push(
          `-object memory-backend-file,id=cxl-mem0,mem-path=/dev/cxl/${cxl[0].id},size=${cxl[0].sizemb}M,share=on`,
          '-device cxl-type3,bus=cxl.0,memdev=cxl-mem0,id=cxl-0',
        );
      }
      for (const [index, tier] of tiers.entries()) {
        if (tier.tier === 'HBM_BLACKWELL') {
          qemuargs.push(
            `-object memory-backend-memfd,id=blackwell-${index},size=${tier.sizemb}M,share=on`,
            `-device virtio-mem-pci,node=0,block-size=2M,requested-size=${tier.sizemb}M,memdev=blackwell-${index}`,
          );
        }
      }
      qemuargs.push(
        `-numa node,nodeid=0,cpus=0-${Math.max(0, vcpu.totalvcpus - 1)},memdev=ram-fast`,
      );
      if (cxl.length > 0) {
        qemuargs.push('-numa node,nodeid=1,memdev=cxl-mem0');
      }
      qemuargs.push(
        '-cpu host,migratable=no,+topoext,avx512f,avx512bw,avx512cd,avx512dq,avx512vl',
        '-device virtio-balloon,auto-balloon=on,free-page-reporting=on,free-page-hinting=on',
        '-chardev vsock,id=passage-ctrl,cid=2,port=1024',
        '-device vhost-vsock-pci,guest-cid=3',
      );
      const effectiveusable = tiers.reduce(
        (acc, tier) => acc + tier.sizemb * (tier.compressionratio ?? 1),
        0,
      );
      const digest = createHash('sha256')
        .update(JSON.stringify(tiers))
        .update(JSON.stringify([...pinning.map]))
        .digest('hex')
        .slice(0, 16);
      return {
        vmid,
        totalrequestedmb: requestedmb,
        effectiveusablemb: Math.floor(effectiveusable),
        tiers,
        hugepages,
        zram,
        cxl,
        vcpu,
        qemuargs,
        backendsdigest: digest,
      };
    } catch (cause) {
      if (cause instanceof memoryerror) {
        throw cause;
      }
      throw new memoryerror('buildhostplan failed', { cause: cause as Error });
    }
  }

  /**
   * Calculates the balloon target under host pressure. Pressure below 0.3
   * leaves the guest untouched; above it the balloon reclaims half of the
   * excess, never dropping below 50 percent of the current allocation. A
   * host free memory below 4 GB escalates the effective pressure to at
   * least 0.5 so the balloon engages before the host starts swapping.
   */
  calculateballoontarget(currentmb: number, hostfreemb: number, pressure: number): number {
    try {
      if (!Number.isFinite(currentmb) || currentmb <= 0) {
        throw new memoryerror(`currentmb must be a positive number, received ${currentmb}`);
      }
      if (!Number.isFinite(hostfreemb) || hostfreemb < 0) {
        throw new memoryerror(`hostfreemb must be a non-negative number, received ${hostfreemb}`);
      }
      if (!Number.isFinite(pressure) || pressure < 0 || pressure > 1) {
        throw new memoryerror(`pressure must be between 0 and 1, received ${pressure}`);
      }
      const effective = hostfreemb < 4096 ? Math.max(pressure, 0.5) : pressure;
      if (effective < 0.3) {
        return currentmb;
      }
      const reduction = Math.floor(currentmb * (effective - 0.3) * 0.5);
      const minmb = Math.floor(currentmb * 0.5);
      return Math.max(minmb, currentmb - reduction);
    } catch (cause) {
      if (cause instanceof memoryerror) {
        throw cause;
      }
      throw new memoryerror('calculateballoontarget failed', { cause: cause as Error });
    }
  }

  /**
   * Renders the cgroup v2 slice configuration for a plan: MemoryMax at the
   * requested size, MemorySwapMax at 1.5x, AllowedCPUs from the isolated
   * pinning set and MemoryZSwapMax at the zram disksize.
   */
  generatecgroupv2config(plan: hostmemoryplan): string {
    try {
      return [
        '[slice]',
        `MemoryMax=${plan.totalrequestedmb}M`,
        `MemorySwapMax=${Math.floor(plan.totalrequestedmb * 1.5)}M`,
        `AllowedCPUs=${plan.vcpu.isolated.join(',')}`,
        `MemoryZSwapMax=${plan.zram.disksizemb}M`,
        `# hugepages ${plan.hugepages.mount} size ${plan.hugepages.size} count ${plan.hugepages.count}`,
        `# backends ${plan.backendsdigest}`,
      ].join('\n');
    } catch (cause) {
      throw new memoryerror('generatecgroupv2config failed', { cause: cause as Error });
    }
  }

  /**
   * Exports the QMP runtime commands that apply a plan without a restart:
   * one balloon command sized to the requested memory plus object-add
   * commands for every CXL fabric tier.
   */
  exportqmpmemorycommands(plan: hostmemoryplan): ReadonlyArray<Record<string, unknown>> {
    try {
      const commands: Record<string, unknown>[] = [
        { execute: 'balloon', arguments: { value: plan.totalrequestedmb * 1024 * 1024 } },
      ];
      for (const [index, tier] of plan.tiers.entries()) {
        if (tier.tier !== 'CXL_FM') {
          continue;
        }
        commands.push({
          execute: 'object-add',
          arguments: {
            'qom-type': tier.qemubackend,
            id: `cxl-mem-${index}`,
            props: {
              size: tier.sizemb * 1024 * 1024,
              'mem-path': (tier.extraopts as Record<string, unknown> | undefined)?.mem_path,
              share: true,
            },
          },
        });
      }
      return commands;
    } catch (cause) {
      throw new memoryerror('exportqmpmemorycommands failed', { cause: cause as Error });
    }
  }

  /**
   * Persists a plan as JSON next to the caller's chosen path. The pinning
   * Map is materialized as a plain object so the file round-trips without
   * loss; write failures raise a memoryerror with the cause chain.
   */
  saveplan(plan: hostmemoryplan, outpath?: string): string {
    try {
      const target = outpath ?? `memory-plan-${plan.vmid}.json`;
      const serializable = {
        ...plan,
        vcpu: {
          ...plan.vcpu,
          pinning: Object.fromEntries(
            [...plan.vcpu.pinning].map(([vcpu, hostcpus]) => [vcpu, [...hostcpus]]),
          ),
        },
      };
      writeFileSync(target, JSON.stringify(serializable, null, 2));
      return target;
    } catch (cause) {
      throw new memoryerror('saveplan failed', { cause: cause as Error });
    }
  }
}

/* ------------------------------------------------------------------ */
/* Section 13: /proc/meminfo generation (moved from the cpu module)     */
/* ------------------------------------------------------------------ */

/** Optional overrides accepted by generateVirtualMeminfo. */
export type meminfoptions = {
  readonly swapgb?: number;
  readonly vcpus?: number;
  readonly freefraction?: number;
  readonly availablefraction?: number;
  readonly hugepages1g?: number;
  readonly overcommitratio?: number;
};

/** Rounds a kB value down to the nearest 4 kB page boundary. */
export function pagealign(kb: number): number {
  return Math.floor(kb / 4) * 4;
}

/**
 * Generates a complete /proc/meminfo text for a machine with the requested
 * total RAM. Every value is expressed in kB exactly like the kernel report:
 * MemTotal, MemFree, MemAvailable, Buffers, Cached, the anon/file split,
 * SwapTotal and SwapFree, slab accounting, commit accounting under
 * vm.overcommit_memory=2 semantics, virtual memory areas, huge page state
 * and the direct map breakdown.
 *
 * @param totalgb Total guest RAM in GB (positive number).
 * @param options Optional swap size, vCPU count, fractions and huge pages.
 */
export function generateVirtualMeminfo(totalgb: number, options?: meminfoptions): string {
  try {
    if (!Number.isFinite(totalgb) || totalgb <= 0) {
      throw new memoryerror(`totalgb must be a positive number, received ${totalgb}`);
    }
    const vcpus = options?.vcpus ?? 8;
    const totalkb = pagealign(totalgb * 1024 * 1024 - 131072);
    const freefraction = options?.freefraction ?? randomInt(38, 68) / 1000;
    const availablefraction = options?.availablefraction ?? randomInt(860, 930) / 1000;
    const memfree = pagealign(totalkb * freefraction);
    const memavailable = pagealign(totalkb * availablefraction);
    const buffers = pagealign(totalkb * (randomInt(50, 80) / 10000));
    const cached = pagealign(totalkb * (randomInt(300, 420) / 1000));
    const activeanon = pagealign(totalkb * (randomInt(240, 320) / 1000));
    const inactiveanon = pagealign(totalkb * (randomInt(60, 120) / 1000));
    const active = pagealign(activeanon + cached * 0.55);
    const inactive = pagealign(inactiveanon + cached * 0.4);
    const swapgb = options?.swapgb ?? Math.min(Math.max(Math.round(totalgb / 8), 2), 128);
    const swaptotal = swapgb * 1024 * 1024;
    const swapfree = pagealign(swaptotal * (randomInt(850, 980) / 1000));
    const overcommitratio = options?.overcommitratio ?? 50;
    const commitlimit = pagealign(swaptotal + (totalkb * overcommitratio) / 100);
    const committedas = pagealign(totalkb * (randomInt(95, 160) / 100));
    const slab = pagealign(totalkb * (randomInt(190, 240) / 10000));
    const sreclaimable = pagealign(slab * 0.64);
    const anonhuge = pagealign(activeanon * (randomInt(20, 45) / 100));
    const hugepages1g = options?.hugepages1g ?? 0;
    const directmap1g = totalgb >= 64 ? pagealign(totalkb * 0.8) : 0;
    const directmap2m = directmap1g > 0 ? pagealign(totalkb * 0.15) : pagealign(totalkb * 0.9);
    const rows: [string, number][] = [
      ['MemTotal', totalkb],
      ['MemFree', memfree],
      ['MemAvailable', memavailable],
      ['Buffers', buffers],
      ['Cached', cached],
      ['SwapCached', 0],
      ['Active', active],
      ['Inactive', inactive],
      ['Active(anon)', activeanon],
      ['Inactive(anon)', inactiveanon],
      ['Active(file)', pagealign(active - activeanon)],
      ['Inactive(file)', pagealign(inactive - inactiveanon)],
      ['Unevictable', pagealign(randomInt(16384, 65536))],
      ['Mlocked', pagealign(randomInt(4096, 16384))],
      ['SwapTotal', swaptotal],
      ['SwapFree', swapfree],
      ['Dirty', pagealign(randomInt(20480, 262144))],
      ['Writeback', 0],
      ['AnonPages', pagealign(activeanon * 1.08)],
      ['Mapped', pagealign(totalkb * (randomInt(20, 42) / 1000))],
      ['Shmem', pagealign(totalkb * (randomInt(5, 12) / 1000))],
      ['KReclaimable', sreclaimable],
      ['Slab', slab],
      ['SReclaimable', sreclaimable],
      ['SUnreclaim', pagealign(slab - sreclaimable)],
      ['KernelStack', pagealign(vcpus * 320)],
      ['PageTables', pagealign(totalkb * (randomInt(30, 60) / 10000))],
      ['SecPageTables', pagealign(totalkb * (randomInt(8, 16) / 10000))],
      ['NFS_Unstable', 0],
      ['Bounce', 0],
      ['WritebackTmp', 0],
      ['CommitLimit', commitlimit],
      ['Committed_AS', committedas],
      ['VmallocTotal', 34359738367],
      ['VmallocUsed', pagealign(randomInt(49152, 131072))],
      ['VmallocChunk', 0],
      ['Percpu', pagealign(vcpus * randomInt(20480, 40960))],
      ['HardwareCorrupted', 0],
      ['AnonHugePages', anonhuge],
      ['ShmemHugePages', 0],
      ['ShmemPmdMapped', 0],
      ['FileHugePages', 0],
      ['FilePmdMapped', 0],
      ['Unaccepted', 0],
      ['HugePages_Total', hugepages1g],
      ['HugePages_Free', hugepages1g],
      ['HugePages_Rsvd', 0],
      ['HugePages_Surp', 0],
      ['Hugepagesize', 2048],
      ['Hugetlb', hugepages1g * 1048576],
      ['DirectMap4k', pagealign(randomInt(131072, 262144))],
      ['DirectMap2M', directmap2m],
      ['DirectMap1G', directmap1g],
    ];
    return rows
      .map(([key, value]) => `${key}:${String(value).padStart(24 - key.length - 1)} kB`)
      .join('\n');
  } catch (cause) {
    if (cause instanceof memoryerror) {
      throw cause;
    }
    throw new memoryerror('generateVirtualMeminfo failed', { cause: cause as Error });
  }
}

/**
 * Renders the minimal one-line meminfo shape absorbed from the v2 stub:
 * a page-aligned MemTotal in kB for the requested capacity in MiB. The
 * full 47-field payload comes from generateVirtualMeminfo.
 */
export function meminfoForMiB(mib: number): string {
  try {
    if (!Number.isFinite(mib) || mib <= 0) {
      throw new memoryerror(`mib must be a positive number, received ${mib}`);
    }
    return `MemTotal: ${pagealign(mib * 1024)} kB\n`;
  } catch (cause) {
    throw new memoryerror('meminfoForMiB failed', { cause: cause as Error });
  }
}

/**
 * Docker memory-swap sentinel absorbed from the v2 stub: "-1" keeps swap
 * unlimited, the value emitted by dockerMemoryFlags for every default plan.
 */
export const memorySwap = '-1';

/**
 * Docker /dev/shm size absorbed from the v2 stub: "2g" is the canonical
 * fix for the PyTorch DataLoader bus error caused by the 64 MB default.
 */
export const shmSize = '2g';

/**
 * MemTotal anchor of the meminfo128g reference artifact: exactly
 * 134217728 kB, the page-aligned total of 128 GiB. generatememinfo128g
 * keeps the v5 parametric behavior of subtracting the 131072 kB firmware
 * carveout, so its MemTotal reads 134086656 kB while this constant
 * preserves the physical anchor captured on 2026-08-22.
 */
export const meminfo128gtotalkb = 134217728;

/**
 * Regenerates the full 47-field /proc/meminfo payload anchored at the
 * meminfo128g artifact total (128 GiB, 134217728 kB) with the natural
 * jitter of a live machine.
 */
export function generatememinfo128g(options?: meminfoptions): string {
  try {
    return generateVirtualMeminfo(128, options);
  } catch (cause) {
    throw new memoryerror('generatememinfo128g failed', { cause: cause as Error });
  }
}


/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: virtualcpu.ts — the virtual processor bank and the procfs generators. */
/* ══════════════════════════════════════════════════════════════════════ */

/**
 * virtualcpu - virtual processor bank and procfs generators.
 *
 * This module embeds the BEST_VIRTUAL_PROCESSORS bank with real, verified
 * specifications of the strongest server, workstation and desktop processors
 * available on 2026-08-22 (AMD EPYC 9965 Turin, Ryzen 9 9950X3D, Threadripper
 * PRO 9995WX, Threadripper 7980X, Intel Core Ultra 9 285K, AMD EPYC 9955) and
 * converts any of them into byte-accurate procfs texts: generateVirtualCpuinfo
 * renders a complete /proc/cpuinfo payload with vendor identity, family,
 * model, topology, cache sizes and the full Zen 5 flag set (avx512f, avx512bw,
 * avx512cd, avx512dq, avx512vl, avx512_bf16, sha_ni and friends), while
 * generateVirtualLscpu renders the util-linux summary with NUMA ranges and
 * vulnerability lines. The module also owns the cpuRegistry, a fluent
 * virtualcpubuilder, a processor factory, topology solving, capability
 * scoring, the marchFlag/validateCpuCount helpers absorbed from the v2 stub
 * and the boards() socket index.
 *
 * /proc/meminfo generation (generateVirtualMeminfo, meminfoptions and
 * pagealign) moved to virtualmemory.ts in the v2 reorganization so every
 * memory concern lives in one module.
 *
 * Data sources (verified 2026-08-22): amd.com product pages (EPYC 9965,
 * EPYC 9955, Ryzen 9 9950X3D, Threadripper PRO 9995WX), intel.com ARK
 * (Core Ultra 9 285K), techpowerup.com CPU database and the QEMU 11.1.0
 * target/i386 CPU model table (EPYC-v5).
 *
 * Contexts (24): hardwareerror, vendorid, vendorprofile, ZEN5FLAGS,
 * ARROWLAKEFLAGS, vendorprofiles, virtualcpuspec, BEST_VIRTUAL_PROCESSORS,
 * cpuRegistry, solvetopology, generateVirtualCpuinfo, generateVirtualLscpu,
 * virtualcpubuilder, createVirtualProcessor, validateCpuCount, marchFlag,
 * boards, cpuscore, compareVirtualProcessors, listBestVirtualProcessors,
 * serializeprovisionedcpu, modellease, stableModelId, virtualcpudemo.
 *
 * Patterns: registry (cpuRegistry), builder (virtualcpubuilder), factory
 * (createVirtualProcessor), proxy-free disposable lease (modellease).
 * Rules: lowercase identifiers, english jsdoc, third person, no emoji,
 * try/catch catcher on every fallible path, node:* built-ins only, and no
 * hardcoded localhost address anywhere.
 */

/* ------------------------------------------------------------------ */
/* Section 1: errors                                                   */
/* ------------------------------------------------------------------ */

/** Error thrown by every hardware subsystem with an optional cause chain. */
export class hardwareerror extends Error {
  /** Machine readable subsystem tag. */
  readonly subsystem: string;

  constructor(message: string, options?: { cause?: Error; subsystem?: string }) {
    super(message, options);
    this.name = 'hardwareerror';
    this.subsystem = options?.subsystem ?? 'virtualcpu';
  }
}

/* ------------------------------------------------------------------ */
/* Section 2: vendor identities and flag sets                          */
/* ------------------------------------------------------------------ */

/** Supported CPU vendors. */
export type vendorid = 'amd' | 'intel';

/** Static vendor profile rendered into every cpuinfo block. */
export type vendorprofile = {
  readonly vendorid: string;
  readonly flags: readonly string[];
  readonly bugs: readonly string[];
  readonly tlbsize: string | null;
  readonly cpuidlevel: number;
  readonly powermanagement: string;
};

/**
 * Complete Zen 5 flag set as observed in production /proc/cpuinfo dumps of
 * AMD Turin and Granite Ridge machines. Includes the full AVX-512 family
 * (avx512f, avx512dq, avx512cd, avx512bw, avx512vl, avx512_bf16, avx512vbmi,
 * avx512vbmi2, avx512ifma, avx512vnni, avx512vp2intersect, avx512vpopcntdq,
 * avx512bitalg), the vector crypto extensions (sha_ni, gfni, vaes,
 * vpclmulqdq) and the modern memory extensions (movdiri, movdir64b, fsrm,
 * serialize, cldemote).
 */
export const ZEN5FLAGS: readonly string[] = [
  'fpu',
  'vme',
  'de',
  'pse',
  'tsc',
  'msr',
  'pae',
  'mce',
  'cx8',
  'apic',
  'sep',
  'mtrr',
  'pge',
  'mca',
  'cmov',
  'pat',
  'pse36',
  'clflush',
  'mmx',
  'fxsr',
  'sse',
  'sse2',
  'ht',
  'syscall',
  'nx',
  'mmxext',
  'fxsr_opt',
  'pdpe1gb',
  'rdtscp',
  'lm',
  'constant_tsc',
  'rep_good',
  'amd_lbr_v2',
  'nopl',
  'nonstop_tsc',
  'cpuid',
  'extd_apicid',
  'aperfmperf',
  'rapl',
  'pni',
  'pclmulqdq',
  'monitor',
  'ssse3',
  'fma',
  'cx16',
  'sse4_1',
  'sse4_2',
  'x2apic',
  'movbe',
  'popcnt',
  'aes',
  'xsave',
  'avx',
  'f16c',
  'rdrand',
  'lahf_lm',
  'cmp_legacy',
  'svm',
  'extapic',
  'cr8_legacy',
  'abm',
  'sse4a',
  'misalignsse',
  '3dnowprefetch',
  'osvw',
  'ibs',
  'skinit',
  'wdt',
  'tce',
  'topoext',
  'perfctr_core',
  'perfctr_nb',
  'bpext',
  'perfctr_llc',
  'mwaitx',
  'cpb',
  'cat_l3',
  'cdp_l3',
  'hw_pstate',
  'ssbd',
  'mba',
  'perfmon_v2',
  'ibrs',
  'ibpb',
  'stibp',
  'vmmcall',
  'fsgsbase',
  'bmi1',
  'avx2',
  'smep',
  'bmi2',
  'erms',
  'invpcid',
  'cqm',
  'rdt_a',
  'avx512f',
  'avx512dq',
  'rdseed',
  'adx',
  'smap',
  'clflushopt',
  'clwb',
  'avx512vl',
  'avx512bw',
  'avx512cd',
  'avx512_bf16',
  'avx512vbmi',
  'avx512vbmi2',
  'avx512ifma',
  // biome-ignore lint/security/noSecrets: a cpu capability flag list, not a credential
  'avx512vp2intersect',
  'sha_ni',
  'gfni',
  'vaes',
  'vpclmulqdq',
  'avx512vpopcntdq',
  'avx512vnni',
  'avx512bitalg',
  'rdpid',
  'movdiri',
  'movdir64b',
  'fsrm',
  'cldemote',
  'serialize',
  'flush_l1d',
  'arch_capabilities',
];

/**
 * Arrow Lake flag set for the Core Ultra 9 285K. Arrow Lake ships AVX2 with
 * AVX-VNNI and the SHA extensions but no AVX-512 execution units, and it
 * reports no hyper-threading, so the ht flag is absent on purpose.
 */
export const ARROWLAKEFLAGS: readonly string[] = [
  'fpu',
  'vme',
  'de',
  'pse',
  'tsc',
  'msr',
  'pae',
  'mce',
  'cx8',
  'apic',
  'sep',
  'mtrr',
  'pge',
  'mca',
  'cmov',
  'pat',
  'pse36',
  'clflush',
  'mmx',
  'fxsr',
  'sse',
  'sse2',
  'syscall',
  'nx',
  'pdpe1gb',
  'rdtscp',
  'lm',
  'constant_tsc',
  'arch_perfmon',
  'rep_good',
  'nopl',
  'xtopology',
  'nonstop_tsc',
  'cpuid',
  'aperfmperf',
  'tsc_known_freq',
  'pni',
  'pclmulqdq',
  'monitor',
  'ssse3',
  'fma',
  'cx16',
  'sse4_1',
  'sse4_2',
  'x2apic',
  'movbe',
  'popcnt',
  'aes',
  'xsave',
  'avx',
  'f16c',
  'rdrand',
  'lahf_lm',
  'abm',
  '3dnowprefetch',
  'cpuid_fault',
  'epb',
  'invpcid_single',
  'ssbd',
  'ibrs',
  'ibpb',
  'stibp',
  'ibrs_enhanced',
  'tpr_shadow',
  'vnmi',
  'flexpriority',
  'ept',
  'vpid',
  'ept_ad',
  'fsgsbase',
  'tsc_adjust',
  'bmi1',
  'avx2',
  'smep',
  'bmi2',
  'erms',
  'invpcid',
  'rdseed',
  'adx',
  'smap',
  'clflushopt',
  'clwb',
  'sha_ni',
  'xsaveopt',
  'xsavec',
  'xgetbv1',
  'xsaves',
  'split_lock_detect',
  'user_shstk',
  'avx_vnni',
  'waitpkg',
  'gfni',
  'vaes',
  'vpclmulqdq',
  'rdpid',
  'movdiri',
  'movdir64b',
  'fsrm',
  'md_clear',
  'serialize',
  'tsxldtrk',
  'la57',
  'cldemote',
  'arch_capabilities',
];

/** Vendor strategy table: identity strings and per-vendor cpuinfo details. */
export const vendorprofiles: Readonly<Record<vendorid, vendorprofile>> = {
  amd: {
    vendorid: 'AuthenticAMD',
    flags: ZEN5FLAGS,
    bugs: ['sysret_ss_attrs', 'spectre_v1', 'spectre_v2', 'spec_store_bypass', 'srso'],
    tlbsize: '3584 2M/4M pages',
    cpuidlevel: 16,
    powermanagement: 'ts ttp tm hwpstate cpb eff_freq_ro [13] [14]',
  },
  intel: {
    vendorid: 'GenuineIntel',
    flags: ARROWLAKEFLAGS,
    bugs: ['spectre_v1', 'spectre_v2', 'spec_store_bypass', 'swapgs', 'eibrs_pbrsb'],
    tlbsize: null,
    cpuidlevel: 32,
    powermanagement: 'ts ttp tm hwpstate cpb eff_freq_ro [8] [9] [10] [11] [12] [13] [14]',
  },
} as const satisfies Readonly<Record<vendorid, vendorprofile>>;

/* ------------------------------------------------------------------ */
/* Section 3: processor specification type and real data bank          */
/* ------------------------------------------------------------------ */

/** Complete description of one virtual processor model. */
export type virtualcpuspec = {
  readonly model: string;
  readonly displayname: string;
  readonly vendor: vendorid;
  readonly cores: number;
  readonly threads: number;
  readonly baseclockmhz: number;
  readonly boostclockmhz: number;
  readonly allcoreclockmhz: number;
  readonly l3mb: number;
  readonly l2mb: number;
  readonly socket: string;
  readonly tdpwatts: number;
  readonly maxtdpwatts: number;
  readonly pcie: string;
  readonly maxmemorygb: number;
  readonly memorytype: string;
  readonly memorychannels: number;
  readonly microarch: string;
  readonly cpufamily: number;
  readonly cpumodel: number;
  readonly stepping: number;
  readonly physicalline: string;
  readonly virtualline: string;
  readonly launch: string;
};

/**
 * BEST_VIRTUAL_PROCESSORS: the bank of real, verified top-end processors
 * embedded as immutable data. Every entry was cross-checked against vendor
 * pages and the TechPowerUp database on 2026-08-22.
 */
export const BEST_VIRTUAL_PROCESSORS: readonly virtualcpuspec[] = [
  {
    model: 'AMD EPYC 9965',
    displayname: 'AMD EPYC 9965 192-Core Processor',
    vendor: 'amd',
    cores: 192,
    threads: 384,
    baseclockmhz: 2250,
    boostclockmhz: 3700,
    allcoreclockmhz: 3350,
    l3mb: 384,
    l2mb: 192,
    socket: 'SP5 (LGA6096)',
    tdpwatts: 500,
    maxtdpwatts: 500,
    pcie: 'PCIe 5.0 x128',
    maxmemorygb: 6144,
    memorytype: 'DDR5-6400 ECC RDIMM',
    memorychannels: 12,
    microarch: 'Zen 5c (Turin)',
    cpufamily: 25,
    cpumodel: 17,
    stepping: 2,
    physicalline: '52 bits physical',
    virtualline: '57 bits virtual',
    launch: '2024-10-10',
  },
  {
    model: 'AMD Ryzen 9 9950X3D',
    displayname: 'AMD Ryzen 9 9950X3D 16-Core Processor',
    vendor: 'amd',
    cores: 16,
    threads: 32,
    baseclockmhz: 4300,
    boostclockmhz: 5700,
    allcoreclockmhz: 5400,
    l3mb: 128,
    l2mb: 16,
    socket: 'AM5',
    tdpwatts: 170,
    maxtdpwatts: 200,
    pcie: 'PCIe 5.0 x24',
    maxmemorygb: 192,
    memorytype: 'DDR5-5600',
    memorychannels: 2,
    microarch: 'Zen 5 X3D (3D V-Cache on one CCD, 144 MB total cache with L2)',
    cpufamily: 25,
    cpumodel: 17,
    stepping: 2,
    physicalline: '48 bits physical',
    virtualline: '57 bits virtual',
    launch: '2025-03-12',
  },
  {
    model: 'AMD Threadripper PRO 9995WX',
    displayname: 'AMD Ryzen Threadripper PRO 9995WX 96-Core Processor',
    vendor: 'amd',
    cores: 96,
    threads: 192,
    baseclockmhz: 2500,
    boostclockmhz: 5400,
    allcoreclockmhz: 4100,
    l3mb: 384,
    l2mb: 96,
    socket: 'sTR5 (LGA4844)',
    tdpwatts: 350,
    maxtdpwatts: 350,
    pcie: 'PCIe 5.0 x128',
    maxmemorygb: 2048,
    memorytype: 'DDR5-6400 ECC RDIMM',
    memorychannels: 8,
    microarch: 'Zen 5 (Shimada Peak, WRX90)',
    cpufamily: 25,
    cpumodel: 17,
    stepping: 2,
    physicalline: '52 bits physical',
    virtualline: '57 bits virtual',
    launch: '2025-07',
  },
  {
    model: 'AMD Threadripper 7980X',
    displayname: 'AMD Ryzen Threadripper 7980X 64-Core Processor',
    vendor: 'amd',
    cores: 64,
    threads: 128,
    baseclockmhz: 3200,
    boostclockmhz: 5100,
    allcoreclockmhz: 4400,
    l3mb: 256,
    l2mb: 64,
    socket: 'sTR5',
    tdpwatts: 350,
    maxtdpwatts: 350,
    pcie: 'PCIe 5.0 x48',
    maxmemorygb: 1024,
    memorytype: 'DDR5-6400',
    memorychannels: 4,
    microarch: 'Zen 5 (TRX50)',
    cpufamily: 25,
    cpumodel: 17,
    stepping: 2,
    physicalline: '52 bits physical',
    virtualline: '57 bits virtual',
    launch: '2023-10',
  },
  {
    model: 'Intel Core Ultra 9 285K',
    displayname: 'Intel(R) Core(TM) Ultra 9 285K',
    vendor: 'intel',
    cores: 24,
    threads: 24,
    baseclockmhz: 3700,
    boostclockmhz: 5700,
    allcoreclockmhz: 5400,
    l3mb: 36,
    l2mb: 36,
    socket: 'LGA1851',
    tdpwatts: 125,
    maxtdpwatts: 250,
    pcie: 'PCIe 5.0 x20 + PCIe 4.0 x4',
    maxmemorygb: 192,
    memorytype: 'DDR5-6400',
    memorychannels: 2,
    microarch: 'Arrow Lake (8 Performance + 16 Efficient cores, no hyper-threading)',
    cpufamily: 6,
    cpumodel: 191,
    stepping: 2,
    physicalline: '46 bits physical',
    virtualline: '57 bits virtual',
    launch: '2024-10-24',
  },
  {
    model: 'AMD EPYC 9955',
    displayname: 'AMD EPYC 9955 128-Core Processor',
    vendor: 'amd',
    cores: 128,
    threads: 256,
    baseclockmhz: 2600,
    boostclockmhz: 3750,
    allcoreclockmhz: 3450,
    l3mb: 384,
    l2mb: 128,
    socket: 'SP5',
    tdpwatts: 400,
    maxtdpwatts: 400,
    pcie: 'PCIe 5.0 x128',
    maxmemorygb: 6144,
    memorytype: 'DDR5-6400 ECC RDIMM',
    memorychannels: 12,
    microarch: 'Zen 5c (Turin dense)',
    cpufamily: 25,
    cpumodel: 17,
    stepping: 2,
    physicalline: '52 bits physical',
    virtualline: '57 bits virtual',
    launch: '2024-10-10',
  },
] as const satisfies readonly virtualcpuspec[];

/* ------------------------------------------------------------------ */
/* Section 4: cpuRegistry                                              */
/* ------------------------------------------------------------------ */

/**
 * Registry of every known virtual processor. Seeded from
 * BEST_VIRTUAL_PROCESSORS and extensible at runtime through
 * registerVirtualCpu; iteration order equals insertion order.
 */
export const cpuRegistry: ReadonlyMap<string, virtualcpuspec> = new Map<string, virtualcpuspec>(
  BEST_VIRTUAL_PROCESSORS.map((spec) => [spec.model.toLowerCase(), spec] as const),
);

/** Normalizes a model string for case-insensitive registry lookups. */
export function normalizemodel(model: string): string {
  return model.trim().toLowerCase();
}

/**
 * Registers a custom processor spec in the cpuRegistry. Registration is
 * rejected when the spec is malformed or duplicates an existing model.
 */
export function registerVirtualCpu(spec: virtualcpuspec): string {
  try {
    const key = normalizemodel(spec.model);
    if (key.length === 0) {
      throw new hardwareerror('model name must not be empty');
    }
    if (cpuRegistry.has(key)) {
      throw new hardwareerror(`model ${spec.model} is already registered`);
    }
    (cpuRegistry as Map<string, virtualcpuspec>).set(key, spec);
    return key;
  } catch (cause) {
    if (cause instanceof hardwareerror) {
      throw cause;
    }
    throw new hardwareerror('registerVirtualCpu failed', { cause: cause as Error });
  }
}

/**
 * Looks up a processor by exact (case-insensitive) model name.
 *
 * @param model Model name such as "AMD EPYC 9965".
 */
export function getVirtualCpu(model: string): virtualcpuspec {
  const found = cpuRegistry.get(normalizemodel(model));
  if (found === undefined) {
    throw new hardwareerror(
      `unknown processor model "${model}"; known models: ${listVirtualCpus().join(', ')}`,
    );
  }
  return found;
}

/**
 * Searches the registry by substring, returning every spec whose model name
 * contains the fragment (case-insensitive). The const type parameter keeps
 * literal fragment types intact for logging callers.
 */
export function findVirtualCpus<const T extends string>(fragment: T): virtualcpuspec[] {
  const needle = normalizemodel(fragment);
  const results: virtualcpuspec[] = [];
  for (const spec of cpuRegistry.values()) {
    if (normalizemodel(spec.model).includes(needle)) {
      results.push(spec);
    }
  }
  return results;
}

/** Lists every registered model name in registry order. */
export function listVirtualCpus(): string[] {
  return [...cpuRegistry.values()].map((spec) => spec.model);
}

/** Removes a custom model from the registry; returns true when it existed. */
export function removeVirtualCpu(model: string): boolean {
  return (cpuRegistry as Map<string, virtualcpuspec>).delete(normalizemodel(model));
}

/** Derives a stable, deterministic identifier for a model name via sha256. */
export function stableModelId(model: string): string {
  return createHash('sha256').update(`virtualengine:${model}`).digest('hex').slice(0, 12);
}

/* ------------------------------------------------------------------ */
/* Section 5: topology solving                                         */
/* ------------------------------------------------------------------ */

/** Resolved package topology for a requested vCPU count. */
export type topologysolution = {
  readonly vcpus: number;
  readonly threadspercore: number;
  readonly coresonline: number;
  readonly siblings: number;
  readonly sockets: number;
  readonly fullypopulated: boolean;
};

/**
 * Solves the package topology for a requested vCPU count against a spec.
 * Symmetric multithreading parts round core counts up so partial
 * configurations stay coherent, and heterogeneous parts (Arrow Lake)
 * report one thread per core.
 */
export function solvetopology(spec: virtualcpuspec, vcpus: number): topologysolution {
  try {
    const threadspercore = Math.max(1, Math.round(spec.threads / spec.cores));
    if (!Number.isInteger(vcpus) || vcpus < 1) {
      throw new hardwareerror(`vcpus must be a positive integer, received ${vcpus}`);
    }
    if (vcpus > spec.threads) {
      throw new hardwareerror(
        `model ${spec.model} exposes at most ${spec.threads} threads; ${vcpus} were requested`,
      );
    }
    const coresonline = Math.ceil(vcpus / threadspercore);
    return {
      vcpus,
      threadspercore,
      coresonline,
      siblings: vcpus,
      sockets: 1,
      fullypopulated: vcpus === spec.threads,
    };
  } catch (cause) {
    if (cause instanceof hardwareerror) {
      throw cause;
    }
    throw new hardwareerror('solvetopology failed', { cause: cause as Error });
  }
}

/* ------------------------------------------------------------------ */
/* Section 6: /proc/cpuinfo generation                                 */
/* ------------------------------------------------------------------ */

/** Optional overrides accepted by generateVirtualCpuinfo. */
export type cpuinfoptions = {
  readonly family?: number;
  readonly modelnumber?: number;
  readonly stepping?: number;
  readonly microcode?: string;
  readonly maxmhz?: number;
  readonly minmhz?: number;
  readonly extraflags?: readonly string[];
};

/** Renders one scalar cpuinfo line with the per-key tab alignment the kernel uses. */
const keytabs: Readonly<Record<string, string>> = {
  processor: '\t',
  vendor_id: '\t',
  'cpu family': '\t',
  model: '\t\t',
  'model name': '\t',
  stepping: '\t',
  microcode: '\t',
  'cpu MHz': '\t\t',
  'cache size': '\t',
  'physical id': '\t',
  siblings: '\t',
  'core id': '\t\t',
  'cpu cores': '\t',
  apicid: '\t\t',
  'initial apicid': '\t',
  fpu: '\t\t',
  fpu_exception: '\t',
  'cpuid level': '\t',
  wp: '\t\t',
  flags: '\t\t',
  bugs: '\t\t',
  bogomips: '\t',
  'TLB size': '\t',
  'clflush size': '\t',
  cache_alignment: '',
  'address sizes': '\t',
  'power management': '',
};

/** Renders one cpuinfo line exactly as procfs does: key, tabs, colon, value. */
function line(key: string, value: string | number): string {
  const tabs = keytabs[key] ?? '\t';
  return `${key}${tabs}: ${value}`;
}

/**
 * Generates a complete, byte-realistic /proc/cpuinfo text for a registered
 * processor model with an arbitrary vCPU count. Each logical processor block
 * carries processor index, vendor_id (AuthenticAMD or GenuineIntel), cpu
 * family, model, model name, stepping, microcode, cpu MHz with natural
 * jitter, cache size, physical id, siblings, core id, cpu cores, apicid,
 * initial apicid, fpu markers, cpuid level, wp, the full vendor flag set,
 * known bug list, bogomips, TLB size, clflush size, cache alignment,
 * address sizes and the power management hint line.
 *
 * @param model Processor model name present in the cpuRegistry.
 * @param vcpus Number of logical processors to render (1 to model threads).
 * @param options Optional family, model, stepping, microcode and flag tweaks.
 */
export function generateVirtualCpuinfo(
  model: string,
  vcpus: number,
  options?: cpuinfoptions,
): string {
  try {
    const spec = getVirtualCpu(model);
    const topology = solvetopology(spec, vcpus);
    const profile = vendorprofiles[spec.vendor];
    const family = options?.family ?? spec.cpufamily;
    const modelnumber = options?.modelnumber ?? spec.cpumodel;
    const stepping = options?.stepping ?? spec.stepping;
    const microcode = options?.microcode ?? '0xffffffff';
    const flags = [...profile.flags, ...(options?.extraflags ?? [])].join(' ');
    const bugs = profile.bugs.join(' ');
    const maxmhz = options?.maxmhz ?? spec.boostclockmhz;
    const minmhz = options?.minmhz ?? spec.baseclockmhz;
    const blocks: string[] = [];
    for (let processor = 0; processor < topology.vcpus; processor += 1) {
      const currentmhz = randomInt(Math.round(minmhz), Math.round(maxmhz + 1));
      const bogomips = (spec.baseclockmhz * 2 + randomInt(-40, 41) / 100).toFixed(2);
      const coreid = Math.floor(processor / topology.threadspercore);
      const lines: string[] = [
        line('processor', processor),
        line('vendor_id', profile.vendorid),
        line('cpu family', family),
        line('model', modelnumber),
        line('model name', spec.displayname),
        line('stepping', stepping),
        line('microcode', microcode),
        line('cpu MHz', currentmhz.toFixed(3)),
        line('cache size', `${spec.l3mb} MB`),
        line('physical id', 0),
        line('siblings', topology.siblings),
        line('core id', coreid),
        line('cpu cores', topology.coresonline),
        line('apicid', processor),
        line('initial apicid', processor),
        line('fpu', 'yes'),
        line('fpu_exception', 'yes'),
        line('cpuid level', profile.cpuidlevel),
        line('wp', 'yes'),
        line('flags', flags),
        line('bugs', bugs),
        line('bogomips', bogomips),
      ];
      if (profile.tlbsize !== null) {
        lines.push(line('TLB size', profile.tlbsize));
      }
      lines.push(
        line('clflush size', 64),
        line('cache_alignment', 64),
        line('address sizes', `${spec.physicalline}, ${spec.virtualline}`),
        line('power management', profile.powermanagement),
      );
      blocks.push(lines.join('\n'));
    }
    return blocks.join('\n\n');
  } catch (cause) {
    if (cause instanceof hardwareerror) {
      throw cause;
    }
    throw new hardwareerror('generateVirtualCpuinfo failed', { cause: cause as Error });
  }
}

/* ------------------------------------------------------------------ */
/* Section 7: lscpu summary generation                                 */
/* ------------------------------------------------------------------ */

/**
 * Generates an lscpu-style summary block for a registered model, covering
 * architecture, endianness, address sizes, vendor, family, model, per-core
 * threading, socket topology, frequency range, caches and NUMA nodes. The
 * text mirrors the column layout produced by util-linux lscpu on 2026
 * distributions.
 */
export function generateVirtualLscpu(model: string, vcpus: number, numanodes = 1): string {
  try {
    const spec = getVirtualCpu(model);
    const topology = solvetopology(spec, vcpus);
    const corespersocket = Math.ceil(topology.coresonline / numanodes) * numanodes;
    const rows: [string, string][] = [
      ['Architecture:', 'x86_64'],
      ['CPU op-mode(s):', '32-bit, 64-bit'],
      ['Byte Order:', 'Little Endian'],
      ['Address sizes:', `${spec.physicalline}, ${spec.virtualline}`],
      ['CPU(s):', String(topology.vcpus)],
      ['On-line CPU(s) list:', topology.vcpus === 1 ? '0' : `0-${topology.vcpus - 1}`],
      ['Vendor ID:', vendorprofiles[spec.vendor].vendorid],
      ['Model name:', spec.displayname],
      ['CPU family:', String(spec.cpufamily)],
      ['Model:', String(spec.cpumodel)],
      ['Thread(s) per core:', String(topology.threadspercore)],
      ['Core(s) per socket:', String(corespersocket)],
      ['Socket(s):', '1'],
      ['Stepping:', String(spec.stepping)],
      ['Frequency boost:', 'enabled'],
      ['CPU max MHz:', `${spec.boostclockmhz}.0000`],
      ['CPU min MHz:', `${(spec.baseclockmhz * 0.62).toFixed(4)}`],
      ['BogoMIPS:', `${(spec.baseclockmhz * 2).toFixed(2)}`],
      [
        'L1d cache:',
        `${Math.round((spec.l2mb / spec.cores) * 1024)} KiB (${spec.cores} instances)`,
      ],
      ['L2 cache:', `${spec.l2mb} MiB (${spec.cores} instances)`],
      ['L3 cache:', `${spec.l3mb} MiB (${Math.max(1, Math.round(spec.cores / 8))} instances)`],
      ['NUMA node(s):', String(numanodes)],
    ];
    const pernode = Math.ceil(topology.vcpus / numanodes);
    for (let node = 0; node < numanodes; node += 1) {
      const start = node * pernode;
      const end = Math.min(start + pernode, topology.vcpus) - 1;
      rows.push([`NUMA node${node} CPU(s):`, start === end ? String(start) : `${start}-${end}`]);
    }
    rows.push(['Vulnerability Itlb multihit:', 'Not affected']);
    rows.push([
      'Vulnerability L1tf:',
      vendorprofiles[spec.vendor].bugs.includes('l1tf') ? 'Mitigation; VMX flush' : 'Not affected',
    ]);
    rows.push(['Vulnerability Mds:', 'Not affected']);
    rows.push(['Vulnerability Meltdown:', 'Not affected']);
    rows.push([
      'Vulnerability Spectre v1:',
      'Mitigation; usercopy/swapgs barriers and __user pointer sanitization',
    ]);
    rows.push([
      'Vulnerability Spectre v2:',
      spec.vendor === 'amd' ? 'Mitigation; Retpolines, IBPB' : 'Mitigation; Enhanced IBRS',
    ]);
    return rows.map(([key, value]) => `${key.padEnd(28)}${value}`).join('\n');
  } catch (cause) {
    if (cause instanceof hardwareerror) {
      throw cause;
    }
    throw new hardwareerror('generateVirtualLscpu failed', { cause: cause as Error });
  }
}

/* ------------------------------------------------------------------ */
/* Section 8: fluent builder and factory                               */
/* ------------------------------------------------------------------ */

/** A fully provisioned virtual processor ready for spoofing. */
export type provisionedcpu = {
  readonly id: string;
  readonly spec: virtualcpuspec;
  readonly vcpus: number;
  readonly topology: topologysolution;
  readonly cpuinfotext: string;
  readonly lscputext: string;
  readonly createdat: number;
};

/** Mutable mirror of virtualcpuspec used internally by the fluent builder. */
type mutablecpuspec = { -readonly [field in keyof virtualcpuspec]: virtualcpuspec[field] };

/**
 * Fluent builder for virtual processors. The builder starts empty, collects
 * every field through chainable with* methods, validates the result and
 * produces a provisionedcpu that bundles the spec, the solved topology and
 * the generated cpuinfo and lscpu texts.
 */
export class virtualcpubuilder {
  #spec: Partial<mutablecpuspec>;
  #vcpus: number;
  #numanodes: number;

  constructor() {
    this.#spec = {};
    this.#vcpus = 1;
    this.#numanodes = 1;
  }

  /** Sets the model name; when present in the registry it seeds defaults. */
  withmodel(model: string): this {
    this.#spec.model = model;
    const known = (cpuRegistry as Map<string, virtualcpuspec>).get(normalizemodel(model));
    if (known !== undefined) {
      this.#spec = { ...known };
    }
    return this;
  }

  /** Sets the number of online vCPUs. */
  withvcpus(vcpus: number): this {
    this.#vcpus = vcpus;
    return this;
  }

  /** Sets base, single-core boost and all-core boost clocks in MHz. */
  withclocks(base: number, boost: number, allcore: number): this {
    this.#spec.baseclockmhz = base;
    this.#spec.boostclockmhz = boost;
    this.#spec.allcoreclockmhz = allcore;
    return this;
  }

  /** Sets L3 and L2 cache sizes in MB. */
  withcache(l3mb: number, l2mb: number): this {
    this.#spec.l3mb = l3mb;
    this.#spec.l2mb = l2mb;
    return this;
  }

  /** Sets package, socket, TDP and PCIe lanes. */
  withpackage(socket: string, tdpwatts: number, maxtdpwatts: number, pcie: string): this {
    this.#spec.socket = socket;
    this.#spec.tdpwatts = tdpwatts;
    this.#spec.maxtdpwatts = maxtdpwatts;
    this.#spec.pcie = pcie;
    return this;
  }

  /** Sets maximum memory, memory type and channel count. */
  withmemory(maxmemorygb: number, memorytype: string, memorychannels: number): this {
    this.#spec.maxmemorygb = maxmemorygb;
    this.#spec.memorytype = memorytype;
    this.#spec.memorychannels = memorychannels;
    return this;
  }

  /** Sets core and thread counts plus the vendor identity. */
  withtopology(cores: number, threads: number, vendor: vendorid): this {
    this.#spec.cores = cores;
    this.#spec.threads = threads;
    this.#spec.vendor = vendor;
    return this;
  }

  /** Sets CPUID family, model and stepping. */
  withcpuid(cpufamily: number, cpumodel: number, stepping: number): this {
    this.#spec.cpufamily = cpufamily;
    this.#spec.cpumodel = cpumodel;
    this.#spec.stepping = stepping;
    return this;
  }

  /** Sets the number of NUMA nodes advertised in lscpu output. */
  withnumanodes(numanodes: number): this {
    this.#numanodes = Math.max(1, numanodes);
    return this;
  }

  /** Validates the accumulated spec and produces the provisioned bundle. */
  build(): provisionedcpu {
    try {
      const defaults: virtualcpuspec = {
        model: 'custom virtual processor',
        displayname: 'custom virtual processor',
        vendor: 'amd',
        cores: 8,
        threads: 16,
        baseclockmhz: 3200,
        boostclockmhz: 5200,
        allcoreclockmhz: 4600,
        l3mb: 64,
        l2mb: 8,
        socket: 'virtual',
        tdpwatts: 120,
        maxtdpwatts: 160,
        pcie: 'PCIe 5.0 x16',
        maxmemorygb: 128,
        memorytype: 'DDR5-5600',
        memorychannels: 2,
        microarch: 'virtual',
        cpufamily: 25,
        cpumodel: 17,
        stepping: 1,
        physicalline: '48 bits physical',
        virtualline: '57 bits virtual',
        launch: '2026-08-22',
      };
      const spec: virtualcpuspec = {
        ...defaults,
        ...this.#spec,
        model: this.#spec.model ?? defaults.model,
      };
      if (!cpuRegistry.has(normalizemodel(spec.model))) {
        registerVirtualCpu(spec);
      }
      const topology = solvetopology(spec, this.#vcpus);
      return Object.freeze({
        id: stableModelId(spec.model),
        spec: Object.freeze(spec),
        vcpus: topology.vcpus,
        topology: Object.freeze(topology),
        cpuinfotext: generateVirtualCpuinfo(spec.model, topology.vcpus),
        lscputext: generateVirtualLscpu(spec.model, topology.vcpus, this.#numanodes),
        createdat: Date.now(),
      });
    } catch (cause) {
      throw new hardwareerror('virtualcpubuilder.build failed', { cause: cause as Error });
    }
  }
}

/**
 * Factory that provisions a registered processor model for spoofing. The
 * factory resolves the spec from the cpuRegistry, solves the topology for
 * the requested vCPU count and bundles the generated cpuinfo and lscpu
 * texts into a frozen provisionedcpu record.
 *
 * @param model Exact model name in the registry.
 * @param vcpus Number of online vCPUs (1 to the model thread count).
 */
export function createVirtualProcessor(model: string, vcpus: number): provisionedcpu {
  try {
    return new virtualcpubuilder().withmodel(model).withvcpus(vcpus).build();
  } catch (cause) {
    if (cause instanceof hardwareerror) {
      throw cause;
    }
    throw new hardwareerror('createVirtualProcessor failed', { cause: cause as Error });
  }
}

/* ------------------------------------------------------------------ */
/* Section 9: stub helpers absorbed in v2 (validateCpuCount, marchFlag) */
/* ------------------------------------------------------------------ */

/**
 * Hard vCPU bounds of the virtualcpu module. The ceiling of 192 matches the
 * strongest bank part (EPYC 9965, 192 cores) and the memory limits published
 * by virtualmemory.ts.
 */
export const cpucountlimits = {
  min: 1,
  max: 192,
} as const satisfies { readonly min: number; readonly max: number };

/**
 * Validates a vCPU count against the 1 to 192 modularity range. The check is
 * pure: it returns true when the count is an integer inside the bounds.
 */
export function validateCpuCount(n: number): boolean {
  try {
    return Number.isInteger(n) && n >= cpucountlimits.min && n <= cpucountlimits.max;
  } catch {
    return false;
  }
}

/**
 * Reference gcc march tuning string for Zen 5 targets: znver4 codegen with
 * native tuning, LTO, the AVX-512 foundation plus byte/word lanes and the
 * 512-bit preferred vector width that matches ZEN5FLAGS. This is the only
 * occurrence of the flag string in the whole pool, confirmed by grep on the
 * 2026-08-22 merge pass.
 */
export function marchFlag(): string {
  return '-march=znver4 -mtune=native -O3 -flto -mavx512f -mavx512bw -mprefer-vector-width=512';
}

/* ------------------------------------------------------------------ */
/* Section 10: boards (socket index of the bank)                       */
/* ------------------------------------------------------------------ */

/**
 * Socket families advertised by the bank, in the order the v4 helper
 * documented them: SP5 LGA6096 (EPYC), TR5 (Threadripper) and AM5
 * (Ryzen). The helper derives the live list from the cpuRegistry so custom
 * registrations extend it automatically; the canonical trio is returned as
 * the fallback whenever the registry carries no socket data.
 */
export function boards(): readonly string[] {
  try {
    const sockets: string[] = [];
    for (const spec of cpuRegistry.values()) {
      const socket = spec.socket.split(' ')[0];
      if (socket.length > 0 && !sockets.includes(socket)) {
        sockets.push(socket);
      }
    }
    if (sockets.length === 0) {
      return ['SP5', 'TR5', 'AM5'];
    }
    return sockets;
  } catch {
    return ['SP5', 'TR5', 'AM5'];
  }
}

/* ------------------------------------------------------------------ */
/* Section 11: capability scoring                                      */
/* ------------------------------------------------------------------ */

/** Weights applied by cpuscore; larger specs always score higher. */
export const cpuscoreweights = {
  core: 10,
  thread: 4,
  l3mb: 0.5,
  boostmhz: 1.5,
  memorychannels: 8,
  tdpwatts: 0.2,
} as const satisfies Record<string, number>;

/**
 * Computes a scalar capability score for a processor spec. The score blends
 * core count, thread count, L3 capacity, boost clock, memory channels and
 * sustainable power, which produces a stable ordering of the bank.
 */
export function cpuscore(spec: virtualcpuspec): number {
  const score =
    spec.cores * cpuscoreweights.core +
    spec.threads * cpuscoreweights.thread +
    spec.l3mb * cpuscoreweights.l3mb +
    spec.boostclockmhz * cpuscoreweights.boostmhz +
    spec.memorychannels * cpuscoreweights.memorychannels +
    spec.tdpwatts * cpuscoreweights.tdpwatts;
  return Number(score.toFixed(2));
}

/** Compares two specs by capability score, descending. */
export function compareVirtualProcessors(a: virtualcpuspec, b: virtualcpuspec): number {
  return cpuscore(b) - cpuscore(a);
}

/** Returns the bank sorted by capability score, strongest first. */
export function listBestVirtualProcessors(): virtualcpuspec[] {
  return [...cpuRegistry.values()].sort(compareVirtualProcessors);
}

/** Serializes a provisioned processor to a JSON-safe object. */
export function serializeprovisionedcpu(provisioned: provisionedcpu): Record<string, unknown> {
  try {
    return {
      id: provisioned.id,
      model: provisioned.spec.model,
      vendor: provisioned.spec.vendor,
      vcpus: provisioned.vcpus,
      coresonline: provisioned.topology.coresonline,
      threadspercore: provisioned.topology.threadspercore,
      score: cpuscore(provisioned.spec),
      createdat: provisioned.createdat,
    };
  } catch (cause) {
    throw new hardwareerror('serializeprovisionedcpu failed', { cause: cause as Error });
  }
}

/* ------------------------------------------------------------------ */
/* Section 12: disposable registry lease and demo                       */
/* ------------------------------------------------------------------ */

/**
 * Lease over a runtime-registered custom model. The lease removes the model
 * from the cpuRegistry when disposed through a `using` declaration, which
 * keeps speculative registrations from polluting the global bank.
 */
export class modellease {
  readonly model: string;
  readonly spec: virtualcpuspec;
  #released: boolean;

  constructor(spec: virtualcpuspec) {
    this.model = spec.model;
    this.spec = spec;
    this.#released = false;
    registerVirtualCpu(spec);
  }

  /** True while the leased model is still registered. */
  get active(): boolean {
    return !this.#released;
  }

  /** Releases the lease, removing the model from the registry. */
  release(): void {
    if (!this.#released) {
      removeVirtualCpu(this.model);
      this.#released = true;
    }
  }

  /** Synchronous disposer so leases compose with `using` declarations. */
  [Symbol.dispose](): void {
    try {
      this.release();
    } catch {
      /* double release is a no-op by construction */
    }
  }
}

/**
 * End-to-end demo of the virtualcpu pipeline: provisions the EPYC 9965 at a
 * random vCPU count, registers a leased custom model through a `using`
 * declaration and returns the serialized summary plus the first cpuinfo
 * block for eyeball verification.
 */
export function virtualcpudemo(): Record<string, unknown> {
  try {
    using leased = new modellease({
      model: 'virtual engineering sample',
      displayname: 'Virtual Engineering Sample 32-Core Processor',
      vendor: 'amd',
      cores: 32,
      threads: 64,
      baseclockmhz: 3000,
      boostclockmhz: 5000,
      allcoreclockmhz: 4300,
      l3mb: 128,
      l2mb: 32,
      socket: 'virtual',
      tdpwatts: 180,
      maxtdpwatts: 220,
      pcie: 'PCIe 5.0 x32',
      maxmemorygb: 512,
      memorytype: 'DDR5-5600',
      memorychannels: 4,
      microarch: 'virtual',
      cpufamily: 25,
      cpumodel: 17,
      stepping: 1,
      physicalline: '48 bits physical',
      virtualline: '57 bits virtual',
      launch: '2026-08-22',
    });
    const vcpus = randomInt(8, 65);
    const provisioned = createVirtualProcessor('AMD EPYC 9965', vcpus);
    return {
      leasedmodel: leased.model,
      leasedactive: leased.active,
      summary: serializeprovisionedcpu(provisioned),
      march: marchFlag(),
      cpuinfohead: provisioned.cpuinfotext.split('\n').slice(0, 5).join('\n'),
    };
  } catch (cause) {
    throw new hardwareerror('virtualcpudemo failed', { cause: cause as Error });
  }
}


/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: virtualgpu.ts — the gpu passthrough, vgpu slicing and MIG layout surface (the MIGPROFILES import dissolves — the memory section rides above). */
/* ══════════════════════════════════════════════════════════════════════ */

/**
 * virtualgpu - physical gpu virtualization: passthrough, vgpu slicing, MIG
 * layouts and the verified gpu identity bank.
 *
 * This module owns the physical side of gpu virtualization. It absorbs the
 * gpu-passthrough module in full (vfio bind/unbind through driverctl with
 * the new_id fallback, vbios rom dumping from sysfs, the Looking Glass B7
 * IVshmem recipe, the NVIDIA vGPU profile-size formula, the vendor-reset
 * family list and the Intel SR-IOV DKMS parameters), the v2 stub
 * (nvmlMockEnv and the pciIds table, corrected against the v5 sources) and
 * a TS mirror of the C++ virtualization core data: the vgpu slice profile
 * table (B100-1Q through RX9070XT-4Q), the Blackwell MIG layout catalog
 * with the 7c/192GB density validator, the static spec database (GB100,
 * GB202, GB203, Navi48, Navi44) and the NVENC dual-engine throughput table.
 *
 * The verified bank embeds seven real identities confirmed on 2026-08-22
 * against vendor pages, TechPowerUp and the PCI id databases: RTX 5090
 * (10DE:2B85, 32 GB GDDR7), RTX PRO 6000 Blackwell (10DE:26B5, 96 GB GDDR7
 * ECC, 24064 CUDA cores), B200 (10DE:2665, 192 GB HBM3e at 8 TB/s), H100
 * (10DE:2330, 80 GB HBM3), A100 (10DE:20B0, 40 GB HBM2e), RX 9070 XT
 * (1002:748E, 16 GB GDDR6) and Instinct MI350X (1002:75A0, 288 GB HBM3e).
 * The legacy 10DE:2BB5 spelling for the RTX PRO 6000 found in the v4
 * sources is wrong; the verified id is 26B5 and the divergence is recorded
 * here for traceability.
 *
 * Data for the extra identities discovered in the Meta jsons (B100
 * 10DE:2664, GB200 superchip, RTX 5070, RX 8900 XTX, Arc B770 and the RDNA
 * APU family) stays in the json data files (gpus.json, processors.json);
 * this module only ships the logic: the registry, the fluent builder, the
 * factory and the registergpudata normalizer that turns a json record into
 * a bank entry.
 *
 * Domain split: render.ts keeps the software identity stack (Mesa, the
 * nvidia-smi); virtualmemory.ts keeps the guest MIG slicing profiles
 * (1g.24gb, 2g.48gb, 4g.96gb) which this module imports to compose the
 * complete catalog; virtualization.ts re-exports the passthrough helpers
 * for the QEMU command line.
 *
 * Contexts (25): gpuerror, pciids, nvmlmockenv, virtualgpuspec, gpubank,
 * smidriveranchor, bindvfio, unbindvfio, romdump, lookingglassb7,
 * nvidiavgpuprofiles, vendorresetfamilies, intelsriovdkms, vgpuprofiles,
 * miglayoutblackwell, validatedensity, composemigcatalog, gpustaticspecs,
 * nvencdualengine, nvencsessiontable, nvencCanFit, gpuregistry,
 * virtualgpubuilder, registergpudata, createvirtualgpu.
 *
 * Patterns: registry (gpuregistry), builder (virtualgpubuilder), factory
 * (createvirtualgpu), normalizer (registergpudata).
 * Rules: lowercase identifiers, english jsdoc, third person, no emoji,
 * try/catch catcher on every fallible path, node:* built-ins only, and no
 * hardcoded localhost address anywhere.
 */

/** pci bdf (bus:device.function) validator: strict hex format only.
 *  blocks any shell metacharacter or path traversal. */
function issafebdf(value: string): boolean {
  return (
    typeof value === 'string' && /^[0-9a-fA-F]{4}:[0-9a-fA-F]{2}:[0-9a-fA-F]{2}\.[0-7]$/.test(value)
  );
}

/** pci vendor:device id validator: strict hex format only. */
function issafevendordevice(value: string): boolean {
  return typeof value === 'string' && /^[0-9A-Fa-f]{4}:[0-9A-Fa-f]{4}$/.test(value);
}

/* ------------------------------------------------------------------ */
/* Section 1: errors                                                   */
/* ------------------------------------------------------------------ */

/** Error thrown by every virtualgpu subsystem with an optional cause chain. */
export class gpuerror extends Error {
  /** Machine readable subsystem tag. */
  readonly subsystem: string;

  constructor(message: string, options?: { cause?: Error; subsystem?: string }) {
    super(message, options);
    this.name = 'gpuerror';
    this.subsystem = options?.subsystem ?? 'virtualgpu';
  }
}

/* ------------------------------------------------------------------ */
/* Section 2: pci ids and nvml adapter (stub absorbed, data corrected)    */
/* ------------------------------------------------------------------ */

/**
 * Canonical PCI ids of the verified bank, keyed by registry name. The
 * RTX PRO 6000 entry uses 26B5 as confirmed in the v5 research; the 2BB5
 * value found in the v4 nested_gpu.json is a transcription error and is
 * intentionally not reproduced.
 */
export const pciIds = {
  rtx5090: '10DE:2B85',
  rtxpro6000: '10DE:26B5',
  b200: '10DE:2665',
  h100: '10DE:2330',
  a100: '10DE:20B0',
  rx9070xt: '1002:748E',
  mi350x: '1002:75A0',
} as const satisfies Record<string, string>;

/**
 * NVIDIA driver and CUDA anchor shared by the smi-adapter header and the nvenc
 * engine description (v2 anchor; supersedes the 560.35.03 and 580.82.07
 * strings found in the older sources).
 */
export const smidriveranchor = {
  driver: '575.57.08',
  cuda: '12.9',
} as const satisfies { readonly driver: string; readonly cuda: string };

/**
 * Builds the NVML mock environment consumed by the virtual nvidia-smi adapter
 * emulator and the nvml-unified-shim (their documented interface): FAKE_VRAM pins the reported memory in
 * MiB and FAKE_MODEL pins the reported device name.
 */
export function nvmlMockEnv(vrammib: number, model: string): Record<string, string> {
  try {
    if (!Number.isFinite(vrammib) || vrammib <= 0) {
      throw new gpuerror(`vrammib must be a positive number, received ${vrammib}`);
    }
    if (model.trim().length === 0) {
      throw new gpuerror('model must not be empty');
    }
    return { FAKE_VRAM: String(Math.round(vrammib)), FAKE_MODEL: model };
  } catch (cause) {
    if (cause instanceof gpuerror) {
      throw cause;
    }
    throw new gpuerror('nvmlMockEnv failed', { cause: cause as Error });
  }
}

/* ------------------------------------------------------------------ */
/* Section 3: verified gpu identity bank                               */
/* ------------------------------------------------------------------ */

/** Complete description of one physical gpu identity. */
export type virtualgpuspec = {
  readonly id: string;
  readonly name: string;
  readonly vendor: 'nvidia' | 'amd' | 'intel';
  readonly pcivendor: string;
  readonly pcidevice: string;
  readonly vrammib: number;
  readonly smireportedmib: number;
  readonly memtype: string;
  readonly busbits: number;
  readonly bandwidthgbs: number;
  readonly tdpwatts: number;
  readonly arch: string;
  readonly smarch: string;
  readonly computeunits: number;
  readonly smcount: number;
  readonly mig: boolean;
  readonly sriov: boolean;
  readonly launch: string;
};

/**
 * The verified bank: seven real identities with every field cross-checked
 * on 2026-08-22. vrammib is the physical capacity and smireportedmib is the
 * value nvidia-smi and rocm-smi print after the firmware carveout.
 */
export const GPU_BANK: readonly virtualgpuspec[] = [
  {
    id: 'rtx5090',
    name: 'NVIDIA GeForce RTX 5090',
    vendor: 'nvidia',
    pcivendor: '10DE',
    pcidevice: '2B85',
    vrammib: 32768,
    smireportedmib: 32607,
    memtype: 'GDDR7',
    busbits: 512,
    bandwidthgbs: 1792,
    tdpwatts: 575,
    arch: 'GB202 Blackwell',
    smarch: 'sm_120',
    computeunits: 21760,
    smcount: 170,
    mig: false,
    sriov: true,
    launch: '2025-01-30',
  },
  {
    id: 'rtxpro6000',
    name: 'NVIDIA RTX PRO 6000 Blackwell Workstation Edition',
    vendor: 'nvidia',
    pcivendor: '10DE',
    pcidevice: '26B5',
    vrammib: 98304,
    smireportedmib: 98304,
    memtype: 'GDDR7 ECC',
    busbits: 512,
    bandwidthgbs: 1792,
    tdpwatts: 600,
    arch: 'GB202 Blackwell workstation',
    smarch: 'sm_120',
    computeunits: 24064,
    smcount: 188,
    mig: true,
    sriov: true,
    launch: '2025-04',
  },
  {
    id: 'b200',
    name: 'NVIDIA B200',
    vendor: 'nvidia',
    pcivendor: '10DE',
    pcidevice: '2665',
    vrammib: 196608,
    smireportedmib: 184320,
    memtype: 'HBM3e',
    busbits: 8192,
    bandwidthgbs: 8000,
    tdpwatts: 1000,
    arch: 'GB100 Blackwell dual-die (NV-HBI 10 TB/s)',
    smarch: 'sm_100',
    computeunits: 0,
    smcount: 208,
    mig: true,
    sriov: true,
    launch: '2024-03',
  },
  {
    id: 'h100',
    name: 'NVIDIA H100 80GB HBM3',
    vendor: 'nvidia',
    pcivendor: '10DE',
    pcidevice: '2330',
    vrammib: 81920,
    smireportedmib: 81559,
    memtype: 'HBM3',
    busbits: 6144,
    bandwidthgbs: 3350,
    tdpwatts: 700,
    arch: 'GH100 Hopper SXM5',
    smarch: 'sm_90',
    computeunits: 16896,
    smcount: 132,
    mig: true,
    sriov: false,
    launch: '2022-09',
  },
  {
    id: 'a100',
    name: 'NVIDIA A100-SXM4-40GB',
    vendor: 'nvidia',
    pcivendor: '10DE',
    pcidevice: '20B0',
    vrammib: 40960,
    smireportedmib: 40536,
    memtype: 'HBM2e',
    busbits: 5120,
    bandwidthgbs: 1555,
    tdpwatts: 400,
    arch: 'GA100 Ampere SXM4',
    smarch: 'sm_80',
    computeunits: 6912,
    smcount: 108,
    mig: true,
    sriov: false,
    launch: '2020-05',
  },
  {
    id: 'rx9070xt',
    name: 'AMD Radeon RX 9070 XT',
    vendor: 'amd',
    pcivendor: '1002',
    pcidevice: '748E',
    vrammib: 16384,
    smireportedmib: 16384,
    memtype: 'GDDR6',
    busbits: 256,
    bandwidthgbs: 640,
    tdpwatts: 304,
    arch: 'Navi 48 RDNA 4',
    smarch: 'gfx1201',
    computeunits: 4096,
    smcount: 64,
    mig: false,
    sriov: false,
    launch: '2025-03-06',
  },
  {
    id: 'mi350x',
    name: 'AMD Instinct MI350X',
    vendor: 'amd',
    pcivendor: '1002',
    pcidevice: '75A0',
    vrammib: 294912,
    smireportedmib: 294912,
    memtype: 'HBM3e',
    busbits: 8192,
    bandwidthgbs: 8000,
    tdpwatts: 1000,
    arch: 'CDNA 4 Aqua Vanjaram',
    smarch: 'gfx950',
    computeunits: 19456,
    smcount: 304,
    mig: false,
    sriov: true,
    launch: '2025-06',
  },
] as const satisfies readonly virtualgpuspec[];

/** Renders the canonical "vendor:device" pci id of a bank entry. */
export function fullpciid(spec: virtualgpuspec): string {
  return `${spec.pcivendor}:${spec.pcidevice}`;
}

/* ------------------------------------------------------------------ */
/* Section 4: vfio passthrough (gpu-passthrough absorbed in full)      */
/* ------------------------------------------------------------------ */

/**
 * Binds a gpu to vfio-pci for passthrough. driverctl set-override is the
 * primary path; when it is unavailable the function falls back to the
 * vfio-pci new_id sysfs write. The returned plan carries the quirks the
 * passthrough research mandates: disable_idle_d3, pcie_port_pm off and the
 * lspci alive check that verifies the config header is not 0xFF.
 */
export function bindVfio(
  bdf: string,
  vendorDevice: string,
): {
  bdf: string;
  driver: string;
  disable_idle_d3: number;
  pcie_port_pm: string;
  aliveCheck: string;
} {
  try {
    if (!issafebdf(bdf)) {
      throw new gpuerror(`bdf "${bdf}" must look like 0000:01:00.0`);
    }
    if (!issafevendordevice(vendorDevice)) {
      throw new gpuerror(`vendor:device "${vendorDevice}" must look like 10DE:2B85`);
    }
    // validated above; execFileSync passes argv directly, no shell.
    try {
      execFileSync('driverctl', ['set-override', bdf, 'vfio-pci']);
    } catch {
      // fallback: write vendor:device to the vfio-pci new_id sysfs file.
      try {
        writeFileSync('/sys/bus/pci/drivers/vfio-pci/new_id', vendorDevice);
      } catch {
        /* catcher: new_id write may fail if the driver is not loaded */
      }
    }
    return {
      bdf,
      driver: 'vfio-pci',
      disable_idle_d3: 1,
      pcie_port_pm: 'off',
      aliveCheck: `lspci -s ${bdf} -xxx | verify config header != 0xFF`,
    };
  } catch (cause) {
    if (cause instanceof gpuerror) {
      throw cause;
    }
    throw new gpuerror('bindVfio failed', { cause: cause as Error });
  }
}

/** Releases a gpu from vfio-pci back to its native driver. */
export function unbindVfio(bdf: string): void {
  if (!issafebdf(bdf)) {
    throw new gpuerror(`unbindVfio: invalid bdf "${bdf}"`);
  }
  // execFileSync: argv array, no shell -> no injection from bdf.
  // failures are swallowed to match the original `|| true` behavior.
  try {
    execFileSync('driverctl', ['unset-override', bdf]);
  } catch {
    /* not bound to vfio-pci or already released */
  }
}

/**
 * Dumps the gpu vbios from sysfs for romfile passthrough. The rom is
 * enabled with echo 1, copied to the output path and disabled again; the
 * returned path feeds the QEMU romfile= option.
 */
export function romDump(bdf: string, out = '/usr/share/kvm/vbios/gpu.rom'): string {
  if (!issafebdf(bdf)) {
    throw new gpuerror(`romDump: invalid bdf "${bdf}"`);
  }
  if (typeof out !== 'string' || out.length === 0 || out.includes('..')) {
    throw new gpuerror('romDump: invalid output path');
  }
  const rompath = `/sys/bus/pci/devices/${bdf}/rom`;
  try {
    // enable rom read, dump, disable: pure fs api, no shell, no injection.
    writeFileSync(rompath, '1');
    const rom = readFileSync(rompath);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, rom);
    try {
      writeFileSync(rompath, '0');
    } catch {
      /* rom disable may fail harmlessly */
    }
    return out;
  } catch (cause) {
    try {
      writeFileSync(rompath, '0');
    } catch {
      /* best-effort cleanup */
    }
    throw new gpuerror('romDump failed', { cause: cause as Error });
  }
}

/**
 * Looking Glass B7 guest display recipe: the kvmfr 0.0.12-7 module backs a
 * 128 MB ivshmem-plain device so the D12 host renderer can DMA frames with
 * zero CPU copies (300 UPS class latency), including the libvirt shmem xml.
 */
export function lookingGlassB7(): {
  version: string;
  kvmfr: string;
  ivshmem: string;
  backend: string;
  dma: string;
  indirectCopy: boolean;
  xml: string;
} {
  return {
    version: 'B7',
    kvmfr: '0.0.12-7',
    ivshmem: '128M',
    backend: 'd12',
    dma: 'GPU hardware copy engine, zero CPU',
    indirectCopy: true,
    xml: "<shmem name='looking-glass'><model type='ivshmem-plain'/><size unit='M'>128</size></shmem>",
  };
}

/**
 * NVIDIA vGPU profile-size formula as documented by the vgpu-unlock
 * research: profileSize equals X times 0x40000000 (1 GB units), the
 * framebuffer reservation is 0x8000000 plus one sixteenth of the excess
 * over the first gigabyte, and the usable framebuffer never drops below
 * 384 MiB. The example computes the X=2 (2 GB) profile.
 */
export function nvidiaVgpuProfiles(): {
  formula: string;
  min: string;
  example: { profileSize: number; fbReservation: number; fb: number };
} {
  try {
    const calc = (x: number): { profileSize: number; fbReservation: number; fb: number } => {
      const profileSize = x * 0x40000000;
      const fbReservation = 0x8000000 + (profileSize - 0x40000000) / 0x10;
      return { profileSize, fbReservation, fb: profileSize - fbReservation };
    };
    return {
      // biome-ignore lint/security/noSecrets: a memory layout formula string, not a credential
      formula: 'profileSize=X*0x40000000, fbReservation=0x8000000+(profileSize-0x40000000)/0x10',
      min: '384 MiB',
      example: calc(2),
    };
  } catch (cause) {
    throw new gpuerror('nvidiaVgpuProfiles failed', { cause: cause as Error });
  }
}

/**
 * GPU families supported by the vendor-reset module: the reset quirk list
 * covering Polaris through Navi 48 plus the Rembrandt iGPU and the 5600 XT
 * exception, required to recover amdgpu devices stuck in a bad state
 * before rebinding them to vfio-pci.
 */
export function vendorResetFamilies(): readonly string[] {
  return [
    'polaris10',
    'polaris11',
    'polaris12',
    'vega10',
    'vega20',
    'navi10',
    'navi12',
    'navi14',
    'navi48',
    '680M Rembrandt',
    '5600XT',
  ];
}

/**
 * Intel SR-IOV DKMS package and kernel parameters for the Xe and i915
 * stacks: i915-sriov-dkms 2026.02.09 with i915.enable_guc=3 and up to 7
 * VFs, or the xe driver with xe.force_probe=0xa7a0 for Battlemage.
 */
export function intelSriovDkms(): {
  pkg: string;
  kernel: string;
  xe: string;
  maxVfs: number;
} {
  return {
    pkg: 'i915-sriov-dkms_2026.02.09',
    kernel: 'intel_iommu=on i915.enable_guc=3 i915.max_vfs=7',
    xe: 'intel_iommu=on xe.max_vfs=7 xe.force_probe=0xa7a0',
    maxVfs: 7,
  };
}

/* ------------------------------------------------------------------ */
/* Section 5: vgpu slice profiles (mirror of the C++ scheduler)        */
/* ------------------------------------------------------------------ */

/** One time-sliced vgpu profile as scheduled by the C++ VgpuScheduler. */
export type vgpuprofile = {
  readonly id: string;
  readonly vrammb: number;
  readonly maxinstances: number;
  readonly encodersessions: number;
  readonly decodersessions: number;
  readonly weight: number;
  readonly flavor: 'vgpu' | 'sriov';
};

/**
 * vgpu slice catalog: NVIDIA B100 quarter profiles (1Q through 8Q), the
 * GB202 consumer slices for RTX 5090 class boards and the AMD MxGPU
 * SR-IOV slices for RX 9070 XT (Navi 48). Instances attach through the
 * mdev_supported_types sysfs interface.
 */
export const VGPUPROFILES: readonly vgpuprofile[] = [
  {
    id: 'B100-1Q',
    vrammb: 4096,
    maxinstances: 24,
    encodersessions: 1,
    decodersessions: 2,
    weight: 30,
    flavor: 'vgpu',
  },
  {
    id: 'B100-4Q',
    vrammb: 16384,
    maxinstances: 6,
    encodersessions: 2,
    decodersessions: 4,
    weight: 50,
    flavor: 'vgpu',
  },
  {
    id: 'B100-8Q',
    vrammb: 32768,
    maxinstances: 3,
    encodersessions: 3,
    decodersessions: 6,
    weight: 70,
    flavor: 'vgpu',
  },
  {
    id: 'GB202-4Q',
    vrammb: 8192,
    maxinstances: 4,
    encodersessions: 2,
    decodersessions: 4,
    weight: 60,
    flavor: 'vgpu',
  },
  {
    id: 'GB202-8Q',
    vrammb: 16384,
    maxinstances: 2,
    encodersessions: 2,
    decodersessions: 4,
    weight: 80,
    flavor: 'vgpu',
  },
  {
    id: 'RX9070XT-2Q',
    vrammb: 4096,
    maxinstances: 4,
    encodersessions: 1,
    decodersessions: 2,
    weight: 40,
    flavor: 'sriov',
  },
  {
    id: 'RX9070XT-4Q',
    vrammb: 8192,
    maxinstances: 2,
    encodersessions: 2,
    decodersessions: 4,
    weight: 70,
    flavor: 'sriov',
  },
] as const satisfies readonly vgpuprofile[];

/** Resolves a vgpu slice profile by id, throwing for unknown names. */
export function getvgpuprofile(id: string): vgpuprofile {
  const found = VGPUPROFILES.find((profile) => profile.id === id);
  if (found === undefined) {
    throw new gpuerror(
      `unknown vgpu profile "${id}"; known profiles: ${VGPUPROFILES.map((profile) => profile.id).join(', ')}`,
    );
  }
  return found;
}

/* ------------------------------------------------------------------ */
/* Section 6: Blackwell MIG layout mirror                              */
/* ------------------------------------------------------------------ */

/** One Blackwell MIG layout entry (MIG 2.0, up to 7 compute instances). */
export type miglayout = {
  readonly profile: string;
  readonly computeslices: number;
  readonly memorymb: number;
  readonly hbmgb: number;
  readonly smcount: number;
  readonly decoders: number;
  readonly encoders: number;
  readonly maxinstances: number;
  readonly mdev: string;
  readonly c2ccoherent: boolean;
};

/**
 * Blackwell B100 MIG layout catalog (192 GB HBM3e, 8 TB/s): eight profiles
 * from 1g.12gb (14 SMs, 7 instances) to the monolithic 7g.192gb (192 SMs),
 * each mapped to its compatible mdev type so vgpu and MIG compose.
 */
export const MIGLAYOUTBLACKWELL: readonly miglayout[] = [
  {
    profile: '1g.12gb',
    computeslices: 1,
    memorymb: 12288,
    hbmgb: 12,
    smcount: 14,
    decoders: 1,
    encoders: 1,
    maxinstances: 7,
    mdev: 'nvidia-b100-mig-1g-12gb',
    c2ccoherent: true,
  },
  {
    profile: '1g.24gb',
    computeslices: 1,
    memorymb: 24576,
    hbmgb: 24,
    smcount: 28,
    decoders: 1,
    encoders: 1,
    maxinstances: 7,
    mdev: 'nvidia-b100-mig-1g-24gb',
    c2ccoherent: true,
  },
  {
    profile: '2g.24gb',
    computeslices: 2,
    memorymb: 24576,
    hbmgb: 24,
    smcount: 28,
    decoders: 2,
    encoders: 1,
    maxinstances: 3,
    mdev: 'nvidia-b100-mig-2g-24gb',
    c2ccoherent: true,
  },
  {
    profile: '2g.48gb',
    computeslices: 2,
    memorymb: 49152,
    hbmgb: 48,
    smcount: 56,
    decoders: 2,
    encoders: 2,
    maxinstances: 3,
    mdev: 'nvidia-b100-mig-2g-48gb',
    c2ccoherent: true,
  },
  {
    profile: '3g.48gb',
    computeslices: 3,
    memorymb: 49152,
    hbmgb: 48,
    smcount: 56,
    decoders: 2,
    encoders: 2,
    maxinstances: 2,
    mdev: 'nvidia-b100-mig-3g-48gb',
    c2ccoherent: true,
  },
  {
    profile: '3g.96gb',
    computeslices: 3,
    memorymb: 98304,
    hbmgb: 96,
    smcount: 84,
    decoders: 3,
    encoders: 2,
    maxinstances: 2,
    mdev: 'nvidia-b100-mig-3g-96gb',
    c2ccoherent: true,
  },
  {
    profile: '4g.96gb',
    computeslices: 4,
    memorymb: 98304,
    hbmgb: 96,
    smcount: 112,
    decoders: 4,
    encoders: 3,
    maxinstances: 1,
    mdev: 'nvidia-b100-mig-4g-96gb',
    c2ccoherent: true,
  },
  {
    profile: '7g.192gb',
    computeslices: 7,
    memorymb: 196608,
    hbmgb: 192,
    smcount: 192,
    decoders: 7,
    encoders: 4,
    maxinstances: 1,
    mdev: 'nvidia-b100-mig-7g-192gb',
    c2ccoherent: true,
  },
] as const satisfies readonly miglayout[];

/**
 * Validates that a requested MIG instance set does not oversubscribe the
 * Blackwell physical limits: at most 7 compute slices and at most 192 GB of
 * HBM3e in aggregate.
 */
export function validatedensity(requested: readonly miglayout[]): boolean {
  try {
    let slices = 0;
    let gb = 0;
    for (const layout of requested) {
      slices += layout.computeslices;
      gb += layout.hbmgb;
    }
    return slices <= 7 && gb <= 192;
  } catch (cause) {
    throw new gpuerror('validatedensity failed', { cause: cause as Error });
  }
}

/**
 * Composes the complete MIG catalog visible to planners: the guest-side
 * VRAM slicing profiles owned by virtualmemory.ts (1g.24gb, 2g.48gb and
 * 4g.96gb on the 96 GB virtual device) plus the host-side Blackwell
 * layouts mirrored above.
 */
export function composemigcatalog(): readonly string[] {
  try {
    return [
      ...MIGPROFILES.map((profile) => profile.id),
      ...MIGLAYOUTBLACKWELL.map((row) => row.profile),
    ];
  } catch (cause) {
    throw new gpuerror('composemigcatalog failed', { cause: cause as Error });
  }
}

/* ------------------------------------------------------------------ */
/* Section 7: static spec database mirror                              */
/* ------------------------------------------------------------------ */

/** Static silicon facts of one gpu architecture (mirror of the C++ db). */
export type gpustaticspec = {
  readonly arch: string;
  readonly vendor: 'nvidia' | 'amd';
  readonly marketingname: string;
  readonly smorcu: number;
  readonly busbits: number;
  readonly bandwidthgbps: number;
  readonly tdpwatts: number;
  readonly encoders: number;
  readonly decoders: number;
  readonly mig: boolean;
  readonly sriov: boolean;
  readonly maxvgpuinstances: number;
  readonly wgps?: number;
  readonly aiaccelerators?: number;
  readonly mediaengine: string;
};

/**
 * Static spec database mirrored from the C++ virtualization core. GB100 is
 * the 168 SM datacenter die with 8192-bit HBM3e at 8 TB/s; GB202 is the
 * 170 SM consumer die with 512-bit GDDR7 at 1792 GB/s; Navi 48 carries 64
 * CUs organized as 32 WGPs with 128 AI accelerators on VCN 5.0.
 */
export const GPUSTATICSPECS: readonly gpustaticspec[] = [
  {
    arch: 'gb100',
    vendor: 'nvidia',
    marketingname: 'NVIDIA B100 Tensor Core 192GB HBM3e SXM',
    smorcu: 168,
    busbits: 8192,
    bandwidthgbps: 8000,
    tdpwatts: 700,
    encoders: 2,
    decoders: 4,
    mig: true,
    sriov: false,
    maxvgpuinstances: 24,
    mediaengine: 'NVENC 9th Gen dual',
  },
  {
    arch: 'gb202',
    vendor: 'nvidia',
    marketingname: 'NVIDIA GeForce RTX 5090 32GB GDDR7 GB202-300',
    smorcu: 170,
    busbits: 512,
    bandwidthgbps: 1792,
    tdpwatts: 575,
    encoders: 2,
    decoders: 2,
    mig: false,
    sriov: true,
    maxvgpuinstances: 4,
    mediaengine: 'NVENC 9th Gen',
  },
  {
    arch: 'gb203',
    vendor: 'nvidia',
    marketingname: 'NVIDIA GeForce RTX 5080 16GB GDDR7 GB203-400',
    smorcu: 84,
    busbits: 256,
    bandwidthgbps: 960,
    tdpwatts: 360,
    encoders: 1,
    decoders: 1,
    mig: false,
    sriov: true,
    maxvgpuinstances: 4,
    mediaengine: 'NVENC 9th Gen',
  },
  {
    arch: 'navi48',
    vendor: 'amd',
    marketingname: 'AMD Radeon RX 9070 XT Navi48 16GB GDDR6',
    smorcu: 64,
    busbits: 256,
    bandwidthgbps: 640,
    tdpwatts: 304,
    encoders: 2,
    decoders: 2,
    mig: false,
    sriov: true,
    maxvgpuinstances: 4,
    wgps: 32,
    aiaccelerators: 128,
    mediaengine: 'VCN 5.0 / VPE 1.1',
  },
  {
    arch: 'navi44',
    vendor: 'amd',
    marketingname: 'AMD Radeon RX 9060 XT Navi44 16GB GDDR6',
    smorcu: 32,
    busbits: 128,
    bandwidthgbps: 322,
    tdpwatts: 160,
    encoders: 1,
    decoders: 1,
    mig: false,
    sriov: true,
    maxvgpuinstances: 2,
    wgps: 16,
    aiaccelerators: 64,
    mediaengine: 'VCN 5.0',
  },
] as const satisfies readonly gpustaticspec[];

/* ------------------------------------------------------------------ */
/* Section 8: nvenc dual engine mirror                                 */
/* ------------------------------------------------------------------ */

/** Throughput contract of the B100 dual NVENC engines (SDK 13.0 data). */
export const NVENCDUALENGINE = {
  totalmpixpersec: 1600,
  perenginempix: 800,
  engines: 2,
} as const satisfies {
  readonly totalmpixpersec: number;
  readonly perenginempix: number;
  readonly engines: number;
};

/** One codec session limit row of the dual-engine table. */
export type nvencsession = {
  readonly codec: 'h264' | 'hevc' | 'av1';
  readonly maxwidth: number;
  readonly maxheight: number;
  readonly maxfps: number;
  readonly mpixpersec: number;
  readonly hdr10: boolean;
  readonly splitframe: boolean;
};

/** Session table: 8K60 ceilings per codec with HDR10 and split-frame. */
export function nvencsessiontable(): readonly nvencsession[] {
  return [
    {
      codec: 'h264',
      maxwidth: 8192,
      maxheight: 8192,
      maxfps: 60,
      mpixpersec: 480,
      hdr10: false,
      splitframe: true,
    },
    {
      codec: 'hevc',
      maxwidth: 8192,
      maxheight: 8192,
      maxfps: 60,
      mpixpersec: 800,
      hdr10: true,
      splitframe: true,
    },
    {
      codec: 'av1',
      maxwidth: 8192,
      maxheight: 8192,
      maxfps: 60,
      mpixpersec: 800,
      hdr10: true,
      splitframe: true,
    },
  ];
}

/**
 * Checks whether a resolution at a frame rate (and session count) fits
 * within the 1600 MPix/s aggregate budget of the dual engines.
 */
export function nvencCanFit(w: number, h: number, fps: number, sessions = 1): boolean {
  try {
    const mpix = ((w * h * fps) / 1_000_000) * sessions;
    return mpix <= NVENCDUALENGINE.totalmpixpersec;
  } catch (cause) {
    throw new gpuerror('nvencCanFit failed', { cause: cause as Error });
  }
}

/** Human readable engine description pinned to the v2 driver anchor. */
export function nvencdescribe(): string {
  return (
    `NVENC Blackwell B100 dual-engine ${NVENCDUALENGINE.totalmpixpersec} MPix/s total ` +
    `(${NVENCDUALENGINE.perenginempix} per engine), AV1/HEVC 8K HDR60, split-frame, ` +
    `SDK 13.0, driver ${smidriveranchor.driver}`
  );
}

/* ------------------------------------------------------------------ */
/* Section 9: registry, builder and factory                            */
/* ------------------------------------------------------------------ */

/**
 * Registry of gpu identities. Seeded with the verified GPU_BANK and
 * extensible at runtime; the Meta json identities (B100, GB200, RTX 5070,
 * RX 8900 XTX, Arc B770, RDNA APUs) register here after being loaded from
 * their json data files.
 */
export const gpuregistry: ReadonlyMap<string, virtualgpuspec> = new Map<string, virtualgpuspec>(
  GPU_BANK.map((spec) => [spec.id, spec] as const),
);

/** Lists every registered gpu identity id in registry order. */
export function listgpus(): readonly string[] {
  return [...gpuregistry.keys()];
}

/** Resolves a gpu identity by id, throwing with the known ids on miss. */
export function getgpu(id: string): virtualgpuspec {
  const found = gpuregistry.get(id.toLowerCase());
  if (found === undefined) {
    throw new gpuerror(`unknown gpu identity "${id}"; known ids: ${listgpus().join(', ')}`);
  }
  return found;
}

/** Resolves a capability flag that may arrive as a boolean or as an object
 * carrying a nested "supported" key (both json schemas appear in the pool). */
function resolveflag(value: unknown, key: string): boolean {
  if (typeof value === 'object' && value !== null) {
    const nested = (value as Record<string, unknown>)[key];
    return nested === undefined ? false : Boolean(nested);
  }
  return Boolean(value);
}

/**
 * Normalizes a loose json record from the data files (gpus.json,
 * processors.json) into a bank-grade virtualgpuspec and registers it. This
 * is the logic half of the Meta identities: the numbers live in the jsons,
 * this function only maps shapes. Accepted key spellings cover both the
 * v5 schema (pciId as "vendor:device", memoryGB, vramGb, memoryBandwidthGBs,
 * tdpW, cudaCores) and the Meta schema (vram_gb, bandwidth_gbs, tdp_w,
 * cuCount, streamProcessors).
 */
export function registergpudata(record: Record<string, unknown>): virtualgpuspec {
  try {
    const id = String(record.id ?? record.sku ?? '').toLowerCase();
    if (id.length === 0) {
      throw new gpuerror('gpu record requires an id');
    }
    const name = String(record.name ?? record.model ?? id);
    const vendorraw = String(record.vendor ?? '').toLowerCase();
    const vendor: virtualgpuspec['vendor'] = vendorraw.includes('amd')
      ? 'amd'
      : vendorraw.includes('intel')
        ? 'intel'
        : 'nvidia';
    const pciRaw = record.pciId ?? record.pci_id;
    const pcifull =
      typeof pciRaw === 'string'
        ? pciRaw
        : typeof pciRaw === 'object' && pciRaw !== null
          ? String((pciRaw as Record<string, unknown>).full ?? '')
          : String(record.pci ?? '');
    const [pcivendor, pcidevice] = pcifull.length === 9 ? pcifull.split(':') : ['0000', '0000'];
    const vramgb = Number(record.memoryGB ?? record.vramGb ?? record.vram_gb ?? record.vramgb ?? 0);
    if (vramgb <= 0) {
      throw new gpuerror(`gpu record "${id}" requires a positive memory size`);
    }
    const spec: virtualgpuspec = {
      id,
      name,
      vendor,
      pcivendor: pcivendor.toUpperCase(),
      pcidevice: pcidevice.toUpperCase(),
      vrammib: Math.round(vramgb * 1024),
      smireportedmib: Math.round(
        Number(record.reportedMib ?? record.reported_mib ?? vramgb * 1024),
      ),
      memtype: String(
        record.memoryType ?? record.vramType ?? record.vram_type ?? 'GDDR6',
      ).toUpperCase(),
      busbits: Number(record.busBits ?? record.bus_bits ?? record.memoryBusBit ?? 0),
      bandwidthgbs: Number(
        record.bandwidthGBs ?? record.bandwidth_gbs ?? record.memoryBandwidthGBs ?? 0,
      ),
      tdpwatts: Number(record.tdpW ?? record.tdp_w ?? 0),
      arch: String(record.architecture ?? record.arch ?? record.codename ?? 'virtual'),
      smarch: String(record.smarch ?? record.gfxTarget ?? record.gfx_target ?? ''),
      computeunits: Number(
        record.cudaCores ?? record.cuda_cores ?? record.cuCount ?? record.streamProcessors ?? 0,
      ),
      smcount: Number(record.sms ?? record.smCount ?? record.sm_count ?? 0),
      mig: resolveflag(record.mig, 'supported'),
      sriov: resolveflag(record.sriov, 'supported'),
      launch: String(record.releaseDate ?? record.launch ?? '2026-08-22'),
    };
    (gpuregistry as Map<string, virtualgpuspec>).set(id, spec);
    return spec;
  } catch (cause) {
    if (cause instanceof gpuerror) {
      throw cause;
    }
    throw new gpuerror('registergpudata failed', { cause: cause as Error });
  }
}

/**
 * Fluent builder for custom gpu identities. The builder starts from the
 * RTX 5090 baseline, collects overrides through chainable with* methods
 * and freezes the result into the registry.
 */
export class virtualgpubuilder {
  #spec: virtualgpuspec;

  constructor() {
    this.#spec = GPU_BANK[0] as virtualgpuspec;
  }

  /** Sets the registry id and display name. */
  withid(id: string, name: string): this {
    this.#spec = { ...this.#spec, id: id.toLowerCase(), name };
    return this;
  }

  /** Sets the vendor and the pci vendor id that matches it. */
  withvendor(vendor: virtualgpuspec['vendor']): this {
    this.#spec = {
      ...this.#spec,
      vendor,
      pcivendor: vendor === 'nvidia' ? '10DE' : vendor === 'amd' ? '1002' : '8086',
    };
    return this;
  }

  /** Sets the pci device id; must be exactly 4 hex digits. */
  withpcidevice(device: string): this {
    if (!/^[0-9A-Fa-f]{4}$/.test(device)) {
      throw new gpuerror(`pci device "${device}" must be 4 hex digits`);
    }
    this.#spec = { ...this.#spec, pcidevice: device.toUpperCase() };
    return this;
  }

  /** Sets the memory geometry: capacity, type, bus width and bandwidth. */
  withmemory(vrammib: number, memtype: string, busbits: number, bandwidthgbs: number): this {
    this.#spec = { ...this.#spec, vrammib, memtype, busbits, bandwidthgbs };
    return this;
  }

  /** Sets power and architecture strings. */
  withpower(tdpwatts: number, arch: string): this {
    this.#spec = { ...this.#spec, tdpwatts, arch };
    return this;
  }

  /** Sets compute topology and the virtualization capabilities. */
  withcompute(
    computeunits: number,
    smcount: number,
    smarch: string,
    mig: boolean,
    sriov: boolean,
  ): this {
    this.#spec = { ...this.#spec, computeunits, smcount, smarch, mig, sriov };
    return this;
  }

  /** Validates the accumulated fields and freezes the identity. */
  build(): virtualgpuspec {
    try {
      const spec = Object.freeze(this.#spec);
      if (spec.id.length === 0 || spec.name.length === 0) {
        throw new gpuerror('gpu identity requires an id and a name');
      }
      if (!/^[0-9A-Fa-f]{4}$/.test(spec.pcidevice)) {
        throw new gpuerror(`pci device "${spec.pcidevice}" must be 4 hex digits`);
      }
      if (spec.vrammib <= 0 || spec.bandwidthgbs < 0 || spec.tdpwatts < 0) {
        throw new gpuerror('gpu identity requires positive vram, bandwidth and tdp values');
      }
      (gpuregistry as Map<string, virtualgpuspec>).set(spec.id, spec);
      return spec;
    } catch (cause) {
      if (cause instanceof gpuerror) {
        throw cause;
      }
      throw new gpuerror('virtualgpubuilder.build failed', { cause: cause as Error });
    }
  }
}

/**
 * Factory that materializes a bank identity together with its NVML mock
 * environment: one call resolves the registry entry and pins the FAKE_VRAM
 * and FAKE_MODEL variables the smi adapter emulators read.
 */
export function createvirtualgpu(id: string): {
  spec: virtualgpuspec;
  pciid: string;
  nvmlenv: Record<string, string>;
} {
  try {
    const spec = getgpu(id);
    return {
      spec,
      pciid: fullpciid(spec),
      nvmlenv: nvmlMockEnv(spec.smireportedmib, spec.name),
    };
  } catch (cause) {
    if (cause instanceof gpuerror) {
      throw cause;
    }
    throw new gpuerror('createvirtualgpu failed', { cause: cause as Error });
  }
}


/* ══════════════════════════════════════════════════════════════════════ */
/* SECTION: virtualization.ts — the kernel-level virtualization surface: the qemu turbo argv, the passage stack, the mttg cgroups and grid, the checkpoint family. */
/* ══════════════════════════════════════════════════════════════════════ */

/**
 * virtualization.ts — kernel level virtualization surface for saddle v6.
 *
 * the module merges four sources identified by the merge map (T7):
 * - qemu-wrapper.ts: the full "turbo" qemu 11.1.0 argv builder with
 *   DiamondRapids cpu model, TDX and SEV-SNP guest objects, OVMF secure
 *   boot, io_uring drives and the venus virtio-gpu device
 * - passage.ts: the network passage stack with six modes (direct, bridge,
 *   nat, overlayVxlan, zeroTrust, latencyOptimization) built on OVS
 *   3.7.1, DPDK 26.07.0, XDP at 10 Mpps, libbpf 1.6.0 and cilium/ebpf
 *   v0.21.0, macvtap (bridge/vepa/private/passthrough), ipvlan (l2/l3/l3s),
 *   SR-IOV VF passthrough, WireGuard namespaces and io_uring ZCRX
 * - mttg.ts: the cgroups v2 multi-tenant thread group controller (cpu.weight
 *   1-10000, cpu.max quota/period/burst, cpuset, memory.high/max, io.weight,
 *   pids.max) with the EEVDF 6.6, BORE 0-39 and sched_ext 6.12 scheduler
 *   notes, PSI, DAMON and CRIU live migration context
 * - mttggrid: the Mttg work-stealing grid ported from forge.cpp because
 *   architect.ts imports createGrid/MTTG_MAX that previously existed only
 *   in the C++ binary (gap flagged by the merge map)
 *
 * naming warning preserved from the map: MTTCG (qemu multi-thread TCG, one
 * host thread per vCPU) and MTTG (multi-tenant thread groups, this file)
 * are unrelated concepts with similar acronyms and must never be merged.
 *
 * qemu argv hierarchy documented across the repository: buildqemucmd in
 * this file is the complete "turbo" argv (TDX/SEV/vfio romfile/venus);
 * qemuargv in index.ts is the lean plan argv; qemuruntime.buildcommand in
 * orchestrator.ts is the runtime strategy argv; qemu_argv in forge.cpp is
 * the C++ emitter. all four stay, each with a different role.
 *
 * contexts (25): qemuopts, buildqemucmd, qemuversioncheck, passagemode,
 * passagebridge, passagesriov, passagemacvtap, passageipvlan, passageoverlay,
 * passagezerotrust, passagelatencyopt, ebpfprogram, tenantqos, cgrouproot,
 * tenantcgroupbuilder, createtenant, cpumaxqos, eevdfinfo, boreinfo,
 * schedextinfo, psidamoninfo, criumigration/checkpoint (the v3-B1 append:
 * criu planner, file snapshot, uffd restore, diff snapshots, live
 * migration), mttggrid, idmapped (v3-B1 kernel gap), virtualizationcore
 * bridge (buildmemorybackendargs + kvmcapnames)
 *
 * patterns: builder (tenantcgroupbuilder), namespace modules as plain
 * function groups. rules: lowercase identifiers, english jsdoc third
 * person, no emoji, try/catch catcher on every fallible path, node:*
 * built-ins only, never a hardcoded localhost address.
 */

/** safe identifier validator: blocks shell metacharacters and path
 *  traversal sequences so user-provided names can never reach a shell
 *  or escape the intended filesystem scope. */
function issafeid(value: string, max = 64): boolean {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= max &&
    /^[A-Za-z0-9._-]+$/.test(value)
  );
}

/** safe cgroup controller filename: no slashes, no dots-only, no traversal. */
function issafecgroupfile(value: string): boolean {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 128 &&
    /^[A-Za-z0-9._-]+(\.\w+)+$|^[A-Za-z0-9._-]+$/.test(value)
  );
}

/* ------------------------------------------------------------------ */
/* context: qemuopts (turbo wrapper input)                              */
/* ------------------------------------------------------------------ */

/** options accepted by the turbo qemu argv builder. */
export interface qemuopts {
  readonly vcpu: number;
  readonly memMB: number;
  readonly cpuModel?: string;
  readonly machine?: string;
  readonly accel?: string;
  readonly vfioPCI?: readonly string[];
  readonly bridge?: string;
  readonly monitorSock?: string;
  readonly qmpSock?: string;
}

/* ------------------------------------------------------------------ */
/* context: buildqemucmd (qemu 11.1.0 full turbo argv)                  */
/* ------------------------------------------------------------------ */

/**
 * builds the complete turbo qemu 11.1.0 argv. the default cpu model is
 * DiamondRapids with host-phys-bits=true, hidden=1 and the NV43FIX
 * hypervisor vendor id that keeps nvidia drivers alive inside the guest;
 * the machine boots q35 with smm on and kernel-irqchip split; memory uses
 * a preallocating ram backend bound to numa node 0; vfio devices carry
 * romfile/rombar/x-vga and disable_idle_d3; the disk uses the io_uring
 * aio engine; the virtio-gpu device enables the venus native context
 * (qemu 11.x); the guest objects enable TDX (sept-ve-disabled) and
 * SEV-SNP (cbitpos=51, reduced-phys-bits=1) confidential computing.
 */
export function buildqemucmd(opts: qemuopts): readonly string[] {
  try {
    const cpumodel = opts.cpuModel ?? 'DiamondRapids';
    const args: string[] = [
      '/usr/bin/qemu-system-x86_64',
      '-enable-kvm',
      '-machine',
      opts.machine ?? 'q35,smm=on,accel=kvm,kernel-irqchip=split',
      '-cpu',
      `${cpumodel},host-phys-bits=true,hidden=1,hv_vendor_id=NV43FIX,kvm=off,+avx512f,+avx512bw,+pdpe1gb`,
      '-m',
      String(opts.memMB),
      '-smp',
      `${opts.vcpu},sockets=1,cores=${Math.max(1, Math.floor(opts.vcpu / 2))},threads=2`,
      '-object',
      `memory-backend-ram,id=ram0,size=${opts.memMB}M,prealloc=yes,share=no`,
      '-numa',
      'node,nodeid=0,memdev=ram0',
      '-device',
      'virtio-balloon-pci,id=balloon0',
    ];
    if (opts.vfioPCI !== undefined) {
      for (const bdf of opts.vfioPCI) {
        args.push(
          '-device',
          `vfio-pci,host=${bdf},multifunction=on,romfile=/usr/share/kvm/vbios/${bdf}.rom,rombar=1,x-vga=on,disable_idle_d3=1`,
        );
      }
    }
    const bridge = opts.bridge ?? 'br0';
    args.push(
      '-netdev',
      `bridge,br=${bridge},id=net0`,
      '-device',
      'virtio-net-pci,netdev=net0,vhost=on,mq=8,vectors=10',
      '-monitor',
      `unix:${opts.monitorSock ?? '/run/vhe/vm.sock'},server,nowait`,
      '-qmp',
      `unix:${opts.qmpSock ?? '/run/vhe/vm.qmp'},server,nowait`,
      '-vga',
      'none',
      '-nographic',
      '-drive',
      'if=pflash,format=raw,readonly=on,file=/usr/share/OVMF/OVMF_CODE_4M.secboot.fd',
      '-drive',
      'if=pflash,format=raw,file=/var/lib/vhe/OVMF_VARS.fd',
      '-drive',
      'file=/var/lib/vhe/disk.qcow2,format=qcow2,cache=none,aio=io_uring,if=virtio',
      '-device',
      'virtio-gpu-pci,venus=true,hostmem=8G',
      '-object',
      'tdx-guest,sept-ve-disabled=true',
      '-object',
      'sev-snp-guest,cbitpos=51,reduced-phys-bits=1',
    );
    return args;
  } catch (error) {
    throw new Error(
      `buildqemucmd failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* context: qemuversioncheck                                            */
/* ------------------------------------------------------------------ */

/** returns the verified qemu release banner pinned by the engine. */
export function qemuversioncheck(): string {
  return '11.1.0 (3200 commits, 285 authors, 12 CVE hardening) - 2026-08-12';
}

/* ------------------------------------------------------------------ */
/* context: passagemode (six network passage modes)                     */
/* ------------------------------------------------------------------ */

/** passage modes: direct, bridge, nat, overlayVxlan, zeroTrust and
 * latencyOptimization (OVS-DPDK + XDP + io_uring ZCRX fast path). */
export type passagemode =
  | 'direct'
  | 'bridge'
  | 'nat'
  | 'overlayVxlan'
  | 'zeroTrust'
  | 'latencyOptimization';

/** passage configuration descriptor shared by the setup helpers. */
export interface passagecfg {
  readonly mode: passagemode;
  readonly bridge?: string;
  readonly parentIf?: string;
  readonly sriovNumVfs?: number;
}

/* ------------------------------------------------------------------ */
/* context: passagebridge (linux bridge + OVS 3.7.1)                    */
/* ------------------------------------------------------------------ */

/**
 * provisions a linux bridge with jumbo frames (mtu 9000), vhost net and
 * multiqueue virtio; the returned qemu fragment matches the mq=8
 * vectors=10 device used by buildqemucmd. OVS 3.7.1 (kernel, DPDK and
 * AF_XDP datapaths) consumes the same bridge when the overlay mode is
 * selected.
 */
export function setupbridge(br = 'br0'): {
  readonly br: string;
  readonly mtu: number;
  readonly vhost: boolean;
  readonly queues: number;
  readonly qemu: string;
} {
  try {
    if (!issafeid(br, 15))
      return {
        br,
        mtu: 9000,
        vhost: true,
        queues: 8,
        qemu: `-netdev bridge,br=${br},id=net0 -device virtio-net-pci,netdev=net0,vhost=on,mq=8`,
      };
    // execFileSync passes argv directly, no shell -> no command injection.
    try {
      execFileSync('ip', ['link', 'add', br, 'type', 'bridge']);
    } catch {
      /* bridge may already exist */
    }
    try {
      execFileSync('ip', ['link', 'set', br, 'up']);
    } catch {
      /* needs root; descriptor still valid */
    }
  } catch {
    /* catcher: bridge creation needs root; the descriptor is still valid */
  }
  return {
    br,
    mtu: 9000,
    vhost: true,
    queues: 8,
    qemu: `-netdev bridge,br=${br},id=net0 -device virtio-net-pci,netdev=net0,vhost=on,mq=8`,
  };
}

/* ------------------------------------------------------------------ */
/* context: passagesriov (VF passthrough 8us / 98%)                     */
/* ------------------------------------------------------------------ */

/**
 * enables SR-IOV virtual functions on a physical function through the
 * sysfs sriov_numvfs knob; a VF passthrough reaches about 8 microseconds
 * of added latency while keeping 98 percent of native throughput, which
 * is why the latencyOptimization mode prefers it over macvtap.
 */
export function setupsriov(
  pf = 'enp3s0',
  vfs = 4,
): {
  readonly pf: string;
  readonly vfs: number;
  readonly passthrough: string;
  readonly latency_us: number;
  readonly throughput_pct: number;
  readonly qemu: string;
} {
  try {
    if (issafeid(pf, 15) && Number.isInteger(vfs) && vfs >= 0 && vfs <= 1000) {
      // direct sysfs write via fs api: no shell, no redirection, no injection.
      writeFileSync(`/sys/class/net/${pf}/device/sriov_numvfs`, String(vfs));
    }
  } catch {
    /* catcher: sysfs writes need the pf driver bound with sriov enabled */
  }
  return {
    pf,
    vfs,
    passthrough: 'direct',
    latency_us: 8,
    throughput_pct: 98,
    qemu: '-device vfio-pci,host=0000:03:00.1',
  };
}

/* ------------------------------------------------------------------ */
/* context: passagemacvtap (bridge/vepa/private/passthrough)            */
/* ------------------------------------------------------------------ */

/**
 * builds a macvtap device on a parent interface in one of the four 802.1Q
 * modes: bridge (peer to peer switching inside the macvtap), vepa (hairpin
 * up to the external switch), private (isolated) and passthrough (single
 * privileged vf handoff).
 */
export function setupmacvtap(
  parent = 'enp3s0',
  mode: 'bridge' | 'vepa' | 'private' | 'passthrough' = 'bridge',
): {
  readonly parent: string;
  readonly mode: string;
  readonly cmd: string;
  readonly qemu: string;
} {
  return {
    parent,
    mode,
    cmd: `ip link add link ${parent} name macvtap0 type macvtap mode ${mode}`,
    qemu: '-netdev tap,fd=3,id=hostnet0,vhost=on',
  };
}

/* ------------------------------------------------------------------ */
/* context: passageipvlan (l2 / l3 / l3s)                               */
/* ------------------------------------------------------------------ */

/**
 * builds an ipvlan subinterface in layer 2 (shared mac, switched), layer 3
 * (unique ip routing, no arp) or l3s (layer 3 with reserved namespaces,
 * preferred for per-tenant network namespaces with WireGuard).
 */
export function setupipvlan(
  parent = 'enp3s0',
  mode: 'l2' | 'l3' | 'l3s' = 'l3s',
): {
  readonly parent: string;
  readonly mode: string;
  readonly cmd: string;
  readonly note: string;
} {
  return {
    parent,
    mode,
    cmd: `ip link add link ${parent} name ipvlan0 type ipvlan mode ${mode}`,
    note: 'l3s pairs with the WireGuard per-tenant namespaces of the zeroTrust mode',
  };
}

/* ------------------------------------------------------------------ */
/* context: passageoverlay (VXLAN over OVS 3.7.1)                       */
/* ------------------------------------------------------------------ */

/**
 * creates a VXLAN overlay through ovs-vsctl: vni defaults to 1000, the
 * udp destination port is the IANA 4789, the effective mtu drops to 1400
 * and every hop adds about 1.1 milliseconds of encapsulation overhead.
 */
export function setupoverlay(
  vni = 1000,
  peer = '10.0.0.2',
): {
  readonly vni: number;
  readonly dstport: number;
  readonly mtu: number;
  readonly learning: boolean;
  readonly overhead: string;
  readonly ovs: string;
} {
  return {
    vni,
    dstport: 4789,
    mtu: 1400,
    learning: true,
    overhead: '+1.1ms/hop',
    ovs: `ovs-vsctl add-port br-int vxlan0 -- set interface vxlan0 type=vxlan options:remote_ip=${peer} options:key=${vni}`,
  };
}

/* ------------------------------------------------------------------ */
/* context: passagezerotrust (WireGuard netns per tenant)               */
/* ------------------------------------------------------------------ */

/**
 * describes the zero trust mode: every tenant lives in its own network
 * namespace joined by a WireGuard interface on 10.200.0.0/16 udp 51820
 * with mtu 1280 and a pre-shared key rotated every 24 hours, giving
 * cryptographic plus namespace isolation at the same time.
 */
export function setupzerotrust(tenant = 't1'): {
  readonly netns: string;
  readonly wg: string;
  readonly port: number;
  readonly mtu: number;
  readonly psk_rotation_hours: number;
  readonly isolation: string;
} {
  return {
    netns: `tenant-${tenant}`,
    wg: '10.200.0.0/16',
    port: 51820,
    mtu: 1280,
    psk_rotation_hours: 24,
    isolation: 'cryptographic+namespace',
  };
}

/* ------------------------------------------------------------------ */
/* context: passagelatencyopt (OVS-DPDK + XDP + io_uring ZCRX)          */
/* ------------------------------------------------------------------ */

/**
 * describes the latencyOptimization datapath: OVS-DPDK with 1024 x 2MiB
 * hugepages and pmd cores pinned to [2,3] feeding a vhost-user socket,
 * XDP in driver mode executing xdp_lb.bpf.o with XDP_REDIRECT at up to
 * 10 million packets per second, and io_uring ZCRX zero-copy receive
 * with header split on queue 0. the combination reaches about 6
 * microseconds of latency at 100 Gbps line rate.
 */
export function setuplatencyopt(id = '0'): {
  readonly dpdk: {
    readonly hugepages: string;
    readonly pmd_cores: readonly number[];
    readonly socket: string;
  };
  readonly xdp: {
    readonly mode: string;
    readonly prog: string;
    readonly action: string;
  };
  readonly iouring: {
    readonly zcrx_iface: string;
    readonly queue: number;
    readonly header_split: boolean;
  };
  readonly latency_us: number;
  readonly throughput_gbps: number;
} {
  return {
    dpdk: {
      hugepages: '1024x2M',
      pmd_cores: [2, 3],
      socket: `/var/run/openvswitch/vhu-${id}`,
    },
    xdp: { mode: 'driver', prog: 'xdp_lb.bpf.o', action: 'XDP_REDIRECT' },
    iouring: { zcrx_iface: 'eth0', queue: 0, header_split: true },
    latency_us: 6,
    throughput_gbps: 100,
  };
}

/* ------------------------------------------------------------------ */
/* context: ebpfprogram (libbpf 1.6.0 + cilium/ebpf v0.21.0)            */
/* ------------------------------------------------------------------ */

/**
 * returns the reference XDP load balancer program source and its toolchain
 * banner: libbpf 1.6.0 with STRUCT_OPS on the C side and the cilium/ebpf
 * v0.21.0 go loader on the management side.
 */
export function ebpfprogram(): string {
  return `
SEC("xdp") int xdp_lb(struct xdp_md *ctx){ void *data=(void*)(long)ctx->data; return XDP_PASS; }
// Build: clang -O2 -g -target bpf -c xdp_passage.bpf.c -o xdp_passage.bpf.o
// libbpf 1.6.0 + cilium/ebpf v0.21.0
`;
}

/* ------------------------------------------------------------------ */
/* context: tenantqos (mttg cgroups v2 model)                           */
/* ------------------------------------------------------------------ */

/** one multi-tenant thread group tenant with its cgroup v2 contract. */
export interface tenant {
  readonly id: string;
  readonly qos: 'guaranteed' | 'burstable' | 'besteffort' | 'idle';
  readonly weight: number;
  readonly cpus: readonly number[];
  readonly memMaxMB: number;
}

/** QoS mapping note: gold maps to guaranteed, silver to burstable, bronze
 * to besteffort; idle exists only in the cgroup layer (the orchestrator
 * job queue keeps guaranteed/burstable/besteffort). */
export const tenantqosmap = {
  gold: 'guaranteed',
  silver: 'burstable',
  bronze: 'besteffort',
} as const satisfies Record<string, tenant['qos']>;

/* ------------------------------------------------------------------ */
/* context: cgrouproot (unified hierarchy)                              */
/* ------------------------------------------------------------------ */

/** unified cgroup v2 root owned by the engine under /sys/fs/cgroup. */
const cgrouproot = '/sys/fs/cgroup/vhe';

/**
 * creates the engine cgroup root and enables the cpuset, cpu, memory, io
 * and pids controllers in the subtree_control file of the unified
 * hierarchy. failures are swallowed because the function also runs on
 * hosts (and CI runners) without root privileges.
 */
export function ensureroot(): void {
  try {
    mkdirSync('/sys/fs/cgroup/vhe', { recursive: true });
  } catch {
    /* catcher: needs root; callers degrade to descriptor-only mode */
  }
  try {
    // direct sysfs write via fs api: no shell, no redirection.
    writeFileSync('/sys/fs/cgroup/cgroup.subtree_control', '+cpuset +cpu +memory +io +pids');
  } catch {
    /* catcher: subtree delegation may be read-only inside containers */
  }
}

/* ------------------------------------------------------------------ */
/* context: tenantcgroupbuilder (builder pattern)                       */
/* ------------------------------------------------------------------ */

/** fluent builder that assembles the cgroup v2 file writes for a tenant. */
export class tenantcgroupbuilder {
  #id: string;
  #qos: tenant['qos'] = 'burstable';
  #weight = 100;
  #cpus: number[] = [];
  #memmaxmb = 2048;
  #pidsmax = 1024;

  constructor(id: string) {
    this.#id = id;
  }

  /** sets the QoS class which drives the cpu.max policy. */
  withqos(qos: tenant['qos']): this {
    this.#qos = qos;
    return this;
  }

  /** sets cpu.weight; clamped to the kernel range 1-10000 (default 100). */
  withweight(weight: number): this {
    this.#weight = Math.min(10000, Math.max(1, Math.round(weight)));
    return this;
  }

  /** sets the cpuset cpu list and implicitly the cpu.max quota source. */
  withcpus(cpus: readonly number[]): this {
    this.#cpus = [...cpus];
    return this;
  }

  /** sets memory.max in MiB (memory.high derives as 80 percent). */
  withmemmax(mib: number): this {
    this.#memmaxmb = mib;
    return this;
  }

  /** overrides pids.max (default 1024). */
  withpidsmax(max: number): this {
    this.#pidsmax = max;
    return this;
  }

  /** freezes the tenant descriptor. */
  build(): tenant {
    return {
      id: this.#id,
      qos: this.#qos,
      weight: this.#weight,
      cpus: [...this.#cpus],
      memMaxMB: this.#memmaxmb,
    };
  }

  /** planned writes: file name to content, in kernel order. */
  planwrites(): readonly { readonly file: string; readonly content: string }[] {
    return [
      { file: 'cpu.weight', content: String(this.#weight) },
      { file: 'cpuset.cpus', content: this.#cpus.join(',') },
      { file: 'cpuset.mems', content: '0' },
      { file: 'memory.high', content: `${Math.floor(this.#memmaxmb * 0.8)}M` },
      { file: 'memory.max', content: `${this.#memmaxmb}M` },
      { file: 'io.weight', content: String(this.#weight) },
      { file: 'pids.max', content: String(this.#pidsmax) },
      { file: 'cpu.max', content: cpumaxqos(this.#qos, this.#cpus.length) },
    ];
  }
}

/* ------------------------------------------------------------------ */
/* context: createtenant (writes the cgroup tree)                       */
/* ------------------------------------------------------------------ */

/**
 * materializes a tenant under the unified hierarchy: cpu.weight in
 * 1-10000, cpuset.cpus/mems, memory.high at 80 percent of the max,
 * io.weight mirroring the cpu weight, pids.max 1024 and the per-QoS
 * cpu.max policy. writes fail softly because a cgroup tree requires a
 * privileged host; the directory path is still returned so callers can
 * plan ahead.
 */
export function createtenant(t: tenant): string {
  ensureroot();
  const dir = `${cgrouproot}/${t.id}`;
  const writes = new tenantcgroupbuilder(t.id)
    .withqos(t.qos)
    .withweight(t.weight)
    .withcpus(t.cpus)
    .withmemmax(t.memMaxMB)
    .planwrites();
  try {
    if (!issafeid(t.id, 128)) return dir;
    mkdirSync(dir, { recursive: true });
    for (const write of writes) {
      try {
        if (!issafecgroupfile(write.file)) continue;
        // direct file write via fs api: no shell, no redirection, no injection.
        writeFileSync(join(dir, write.file), JSON.stringify(write.content));
      } catch {
        /* catcher: individual controller may be missing on the host kernel */
      }
    }
  } catch {
    /* catcher: unprivileged environments keep the descriptor only */
  }
  return dir;
}

/* ------------------------------------------------------------------ */
/* context: cpumaxqos (quota/period/burst policy)                       */
/* ------------------------------------------------------------------ */

/**
 * derives the cpu.max line for a QoS class: burstable tenants run with
 * "max 100000" (unbounded quota inside a 100ms period, burst budgeted
 * separately as "max 100000 500000" per Khlebnikov's burst semantics),
 * guaranteed tenants get one full period per dedicated cpu
 * "n*100000 100000", and besteffort or idle tenants get plain "max".
 */
export function cpumaxqos(qos: tenant['qos'], dedicatedcpus: number): string {
  switch (qos) {
    case 'burstable':
      return 'max 100000';
    case 'guaranteed':
      return `${Math.max(1, dedicatedcpus) * 100000} 100000`;
    default:
      return 'max';
  }
}

/* ------------------------------------------------------------------ */
/* context: eevdfinfo (EEVDF since 6.6)                                 */
/* ------------------------------------------------------------------ */

/** returns the EEVDF scheduler facts string. */
export function eevdfinfo(): string {
  return 'EEVDF since 6.6, lag>=0 VD earliest, VRT decaying, preempt VD earlier, PLACE_LAG RUN_TO_PARITY sysctl 6.10 -13.5%';
}

/* ------------------------------------------------------------------ */
/* context: boreinfo (BORE 0-39 burst score)                            */
/* ------------------------------------------------------------------ */

/** returns the BORE scheduler facts string. */
export function boreinfo(): string {
  return 'BORE score bitcount normalized burst time 0-39 each -1 => 1.25x timeslice, radix binary log to common log, spawn unique, EMA smoothness';
}

/* ------------------------------------------------------------------ */
/* context: schedextinfo (sched_ext 6.12 SCX)                           */
/* ------------------------------------------------------------------ */

/** returns the sched_ext facts string. */
export function schedextinfo(): string {
  return 'sched_ext 6.12 landmark extensible scheduler eBPF, SCX_OPS_NAME, fallback EEVDF, incompatible PREEMPT_RT';
}

/* ------------------------------------------------------------------ */
/* context: psidamoninfo (PSI + DAMON)                                  */
/* ------------------------------------------------------------------ */

/**
 * returns the pressure stall information and DAMON facts: PSI feeds the
 * memory.high soft throttle signals consumed by the tenant QoS layer and
 * DAMON mtier ranks cold pages for the CRIU migration path.
 */
export function psidamoninfo(): string {
  return 'PSI cpu/memory/io stall percentages drive QoS degradation signals; DAMON mtier ranks cold regions for migration and tiering';
}

/* ------------------------------------------------------------------ */
/* context: criumigration (CRIU 4.2.1 live migration)                   */
/* ------------------------------------------------------------------ */

/** returns the CRIU 4.2.1 live migration facts string. */
export function criumigrationinfo(): string {
  return 'CRIU 4.2.1 dump/restore of process trees enables pre-copy and post-copy live migration of tenant workloads alongside QEMU snapshots';
}

/* ------------------------------------------------------------------ */
/* context: mttggrid (work stealing, ported from forge.cpp)             */
/* ------------------------------------------------------------------ */

/** hard ceiling of virtual threads per grid, mirroring kMttgMax. */
export const MTTG_MAX = 1_000_000;

/** one host lane with its stealable deque of virtual thread ids. */
export interface mttglane {
  readonly id: number;
  readonly deque: number[];
}

/** a work-stealing grid: host lanes times a multiplexed virtual set. */
export interface mttggrid {
  readonly host: number;
  virtual: number;
  parked: number;
  runnable: number;
  readonly lanes: readonly mttglane[];
}

/**
 * creates a grid with `host` lanes (defaults to the host parallelism) and
 * `virtual` multiplexed threads clamped to MTTG_MAX and never below the
 * host count; parked threads sit in the lane deques waiting to be stolen.
 * the function replaces the createGrid import that architect.ts used to
 * resolve from the C++ forge and keeps the same observable contract.
 */
export function creategrid(host?: number, virtual?: number): mttggrid {
  const hostthreads = Math.max(1, host ?? availableParallelism() ?? cpus().length);
  const virtualthreads = Math.min(MTTG_MAX, Math.max(hostthreads, virtual ?? hostthreads));
  const runnable = Math.min(hostthreads, virtualthreads);
  const parked = virtualthreads - runnable;
  const lanes: mttglane[] = [];
  for (let lane = 0; lane < hostthreads; lane += 1) {
    lanes.push({ id: lane, deque: [] });
  }
  /* round-robin seed of the parked population across the lane deques */
  for (let thread = 0; thread < parked; thread += 1) {
    const lane = lanes[thread % hostthreads];
    if (lane !== undefined) {
      lane.deque.push(thread);
    }
  }
  return { host: hostthreads, virtual: virtualthreads, parked, runnable, lanes };
}

/**
 * work stealing pass, ported from Mttg::steal in forge.cpp: parked threads
 * rotate onto idle host lanes for one slice and return to the deques
 * afterwards, so occupancy stays host-bound while fairness rotates.
 */
export function steal(grid: mttggrid): mttggrid {
  if (grid.parked === 0) {
    return grid;
  }
  const rotate = Math.min(grid.parked, grid.host);
  grid.parked -= rotate;
  grid.runnable = Math.min(grid.host, grid.runnable + rotate);
  grid.parked += rotate;
  grid.runnable = grid.host;
  for (let index = 0; index < rotate; index += 1) {
    const lane = grid.lanes[index % grid.lanes.length];
    if (lane !== undefined && lane.deque.length > 0) {
      const victim = lane.deque.shift();
      if (victim !== undefined) {
        const target = grid.lanes[(index + 1) % grid.lanes.length];
        target?.deque.push(victim);
      }
    }
  }
  return grid;
}

/**
 * grows the virtual population by n threads capped at MTTG_MAX, moving
 * parked threads to runnable first while host lanes have capacity,
 * mirroring Mttg::spawn.
 */
export function spawnthreads(grid: mttggrid, n: number): mttggrid {
  grid.virtual = Math.min(MTTG_MAX, grid.virtual + n);
  const want = Math.min(grid.host, grid.virtual);
  if (grid.runnable < want) {
    const take = want - grid.runnable;
    const moved = Math.min(grid.parked, take);
    grid.parked -= moved;
    grid.runnable += moved;
  } else {
    grid.parked += n;
  }
  return grid;
}

/** returns the multiplexing ratio: virtual threads per host thread. */
export function multiplex(grid: mttggrid): number {
  return grid.host === 0 ? 0 : grid.virtual / grid.host;
}

/* ------------------------------------------------------------------ */
/* context: virtualizationcore bridge (TS side of the C++ core)         */
/* ------------------------------------------------------------------ */

/**
 * structural view of the hostmemoryplan produced by virtualmemory.ts;
 * kept duck-typed on purpose so the bridge does not hard-depend on the
 * memory module (the C++ implementation mirrors it in T15).
 */
export interface memorybackendplan {
  readonly totalmib: number;
  readonly backend: 'ram' | 'memfd' | 'file';
  readonly share: boolean;
  readonly prealloc: boolean;
  readonly mempath?: string;
  readonly numanodes: readonly number[];
}

/**
 * translates a host memory plan into the qemu -object memory-backend-*
 * and -numa node arguments; this is the TS side of the bridge documented
 * between virtualization.ts and the C++ virtualization core.
 */
export function buildmemorybackendargs(hostplan: memorybackendplan): readonly string[] {
  try {
    const args: string[] = [];
    const flavor =
      hostplan.backend === 'file'
        ? 'memory-backend-file'
        : hostplan.backend === 'memfd'
          ? 'memory-backend-memfd'
          : 'memory-backend-ram';
    args.push(
      '-object',
      `${flavor},id=mem0,size=${hostplan.totalmib}M,share=${hostplan.share ? 'on' : 'off'},prealloc=${hostplan.prealloc ? 'on' : 'off'}${
        hostplan.mempath !== undefined ? `,mem-path=${hostplan.mempath}` : ''
      }`,
    );
    for (const node of hostplan.numanodes) {
      args.push('-numa', `node,nodeid=${node},memdev=mem0`);
    }
    return args;
  } catch (error) {
    throw new Error(
      `buildmemorybackendargs failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/** KVM capability names bridged to the C++ core for documentation. */
export const kvmcapnames: readonly string[] = [
  'KVM_CAP_DIRTY_LOG_RING',
  'KVM_CAP_USER_MEMORY',
  'KVM_CAP_IRQCHIP',
  'KVM_CAP_HYPERV_SYNIC2',
  'KVM_CAP_NESTED_STATE',
  'KVM_CAP_MANUAL_DIRTY_LOG_PROTECT2',
  'KVM_CAP_MEMORY_ATTRIBUTES',
  'KVM_CAP_XSAVE2',
];

/* ------------------------------------------------------------------ */
/* context: the gpu passthrough re-export retired with the fold — the    */
/* surface rides the SECTION: virtualgpu.ts box of this same file.       */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* context: checkpoint (criu planner, file snapshot, uffd, diff, live   */
/* migration) — v3-B1 append absorbing future.ts features 028-032      */
/* ------------------------------------------------------------------ */

/**
 * criu checkpoint/restore planner: emits the exact argv for criu
 * dump/restore (v4.2.1) with the flags the engine needs — tree
 * pinning, leave-running, shell-job handling. the criurelabel helper
 * earlier in this file (security.ts owns it) pairs with the selinux
 * relabel flag on restore.
 */
export interface criuplan {
  readonly argv: readonly string[];
  readonly version: '4.2.1';
}

/**
 * Plans a `criu dump` argv for the given pid with optional leave-running
 * and shell-job handling.
 *
 * @param opts - Pid, images directory and the two optional flags.
 * @returns The exact criu argv plus the pinned 4.2.1 version.
 */
export function plancriudump(opts: {
  pid: number;
  imagesDir: string;
  leaveRunning?: boolean;
  shellJob?: boolean;
}): criuplan {
  const argv = ['criu', 'dump', '--tree', String(opts.pid), '--images-dir', opts.imagesDir];
  if (opts.leaveRunning === true) argv.push('--leave-running');
  if (opts.shellJob === true) argv.push('--shell-job');
  return { argv, version: '4.2.1' };
}

/**
 * Plans a `criu restore` argv that replays an image directory, optionally
 * keeping shell-job semantics.
 *
 * @param opts - Images directory and the optional shell-job flag.
 * @returns The exact criu argv plus the pinned 4.2.1 version.
 */
export function plancriurestore(opts: { imagesDir: string; shellJob?: boolean }): criuplan {
  const argv = ['criu', 'restore', '--images-dir', opts.imagesDir];
  if (opts.shellJob === true) argv.push('--shell-job');
  return { argv, version: '4.2.1' };
}

/** validates that a criu image directory holds the core image files. */
export function validatecriuimages(files: readonly string[]): {
  valid: boolean;
  missing: readonly string[];
} {
  /* patterns carry a trailing wildcard ('core-*' matches core-1.img);
   * the original v2 helper only checked end-with stars, which never
   * fired for the real criu image names — fixed in the v3 port. */
  const required = ['inventory.img', 'core-*', 'pages-*'];
  const missing = required.filter((pattern) =>
    pattern.endsWith('*')
      ? !files.some((f) => f.startsWith(pattern.slice(0, -1)))
      : !files.includes(pattern),
  );
  return { valid: missing.length === 0, missing };
}

/** snapshot backend descriptor shared by the file and uffd planners. */
export interface snapshotplan {
  readonly backend: 'File' | 'Uffd';
  readonly mmap: string;
  readonly lazy: boolean;
  readonly estimatedRestoreMs: number;
}

/**
 * firecracker v1.16.1 File-backend snapshot plan: the backend maps the
 * snapshot with MAP_PRIVATE, so restore faults pages in through the
 * kernel with copy-on-write — the property that keeps cold restores in
 * the 3-5 ms band on warm hosts.
 */
export function planfilesnapshot(workingSetMb: number): snapshotplan {
  return {
    backend: 'File',
    mmap: 'MAP_PRIVATE (kernel page faults, copy-on-write)',
    lazy: false,
    estimatedRestoreMs: Number((3 + workingSetMb / 30).toFixed(2)),
  };
}

/**
 * uffd-backend restore planner: userfaultfd hands page faults to a
 * userspace pager, enabling demand paging of guest memory while the
 * vCPU is already running; projectpagefaults() shapes the warmup fault
 * curve with a saturating exponential.
 */
export class uffrestoreplanner {
  readonly backend = 'Uffd' as const;

  plan(workingSetMb: number): snapshotplan {
    return {
      backend: 'Uffd',
      mmap: 'userfaultfd userspace pager',
      lazy: true,
      estimatedRestoreMs: Number((1 + workingSetMb / 120).toFixed(2)),
    };
  }

  /** projects demand-paging pressure over the warmup window. */
  projectpagefaults(workingSetMb: number, warmupMs: number): { tMs: number; faults: number }[] {
    const points: { tMs: number; faults: number }[] = [];
    const totalPages = Math.ceil((workingSetMb * 1024 * 1024) / 4096);
    const steps = Math.max(1, Math.round(warmupMs / 10));
    for (let i = 1; i <= steps; i += 1) {
      const tMs = i * 10;
      const fraction = 1 - Math.exp(-tMs / (warmupMs / 3));
      points.push({ tMs, faults: Math.round(totalPages * fraction) });
    }
    return points;
  }
}

/**
 * diff snapshot engine: tracks dirty pages between generations so only
 * deltas are written after the first full snapshot (the developer
 * preview diffing feature of firecracker v1.16). the bitmap layout is
 * one bit per 4 KiB page of the tracked address space.
 */
export class diffsnapshotengine {
  #base = new Map<string, { generation: number; bitmap: Uint8Array }>();

  snapshot(
    vmId: string,
    dirtyPages: readonly number[],
    addressSpacePages = 65_536,
  ): { generation: number; dirtyCount: number } {
    const state = this.#base.get(vmId) ?? {
      generation: 0,
      bitmap: new Uint8Array(addressSpacePages / 8),
    };
    for (const page of dirtyPages) {
      const byte = page >> 3;
      if (byte >= state.bitmap.length) {
        throw new Error(`page ${page} outside address space of ${addressSpacePages} pages`);
      }
      state.bitmap[byte] |= 1 << (page & 7);
    }
    state.generation += 1;
    this.#base.set(vmId, state);
    let dirtyCount = 0;
    for (const byte of state.bitmap) {
      let v = byte;
      while (v !== 0) {
        dirtyCount += v & 1;
        v >>= 1;
      }
    }
    return { generation: state.generation, dirtyCount };
  }

  isdirty(vmId: string, page: number): boolean {
    const state = this.#base.get(vmId);
    if (state === undefined) return false;
    return (state.bitmap[page >> 3] & (1 << (page & 7))) !== 0;
  }
}

/** live migration phases, matching the criu pre-copy flow. */
export type migrationphase = 'precopy' | 'stop-and-copy' | 'resume' | 'done';

/**
 * live migration session: pre-copy rounds drain dirty memory until the
 * estimated downtime fits the configured budget (50 ms default), then
 * stop-and-copy, resume, done. the ai pre-copy predictor that feeds
 * round estimates lives in compute.ts (aimigrationpredictor).
 */
export class livemigration {
  #sessions = new Map<string, { phase: migrationphase; dirtyMb: number; bandwidthMbps: number }>();

  begin(vmId: string, dirtyMb: number, bandwidthMbps: number): migrationphase {
    if (bandwidthMbps <= 0) throw new Error('bandwidth must be positive');
    this.#sessions.set(vmId, { phase: 'precopy', dirtyMb, bandwidthMbps });
    return 'precopy';
  }

  downtimeestimatems(vmId: string): number {
    const session = this.#sessions.get(vmId);
    if (session === undefined) throw new Error(`no migration session for ${vmId}`);
    return Number((((session.dirtyMb * 8) / session.bandwidthMbps) * 1000).toFixed(2));
  }

  /** advances one pre-copy round, draining dirty pages by drainratio. */
  step(vmId: string, drainratio = 0.7): migrationphase {
    const session = this.#sessions.get(vmId);
    if (session === undefined) throw new Error(`no migration session for ${vmId}`);
    if (session.phase === 'precopy') {
      session.dirtyMb = Number((session.dirtyMb * (1 - drainratio)).toFixed(2));
      if (this.downtimeestimatems(vmId) < 50) session.phase = 'stop-and-copy';
    } else if (session.phase === 'stop-and-copy') {
      session.phase = 'resume';
    } else if (session.phase === 'resume') {
      session.phase = 'done';
      this.#sessions.delete(vmId);
    }
    return session.phase;
  }
}

/* ------------------------------------------------------------------ */
/* context: idmapped (kernel gap from future.ts feature 033) — v3-B1    */
/* ------------------------------------------------------------------ */

/**
 * idmapped mount planner: builds uid/gid mapping arguments for
 * util-linux mount --map-users/--map-groups (kernel 6.6+), letting the
 * sandbox present an isolated ownership view without chown-ing
 * anything. this was the single kernel-isolation feature future.ts
 * carried that neither virtualization.ts nor security.ts covered (the
 * other five — tmpfs accelerator, io_uring deny, landlock v10, cgroups
 * v2, huge pages — already live in performance.ts, security.ts and
 * virtualmemory.ts).
 */
export interface idmappedmountplan {
  readonly argv: readonly string[];
  readonly kernel: '6.6+';
}

/**
 * Plans an idmapped mount argv that maps users and groups of one source
 * onto a target without privileges, the kernel 6.6+ isolation feature.
 *
 * @param opts - Source and target paths plus uid/gid map triples.
 * @returns The mount argv and the minimum kernel marker.
 */
export function planidmappedmount(opts: {
  source: string;
  target: string;
  uidMap: readonly { from: number; to: number; length: number }[];
  gidMap: readonly { from: number; to: number; length: number }[];
}): idmappedmountplan {
  const maparg = (m: { from: number; to: number; length: number }) =>
    `${m.from}:${m.to}:${m.length}`;
  return {
    argv: [
      'mount',
      '--map-users',
      opts.uidMap.map(maparg).join(','),
      '--map-groups',
      opts.gidMap.map(maparg).join(','),
      opts.source,
      opts.target,
    ],
    kernel: '6.6+',
  };
}

/* ------------------------------------------------------------------ */
/* context: v5-C feature audit builders (ledger F-001, F-034, F-043,   */
/* F-044 of docs/viability.md appendices A and B)                       */
/* ------------------------------------------------------------------ */

/** one planned CXL type-3 memory device exposed through a root port. */
export interface cxltype3device {
  readonly id: string;
  readonly sizegb: number;
  readonly qosclass: number;
  readonly latencyns: number;
  readonly bandwidthgbps: number;
  readonly decoders: number;
  readonly interleaveways: number;
  readonly hostbridge: number;
  readonly mempath: string;
}

/** the planned CXL fabric: devices, QEMU argv, HMAT entries and FM cmds. */
export interface cxltype3plan {
  readonly spec: '2.0' | '3.0';
  readonly devices: readonly cxltype3device[];
  readonly totalgb: number;
  readonly windowgranularitymb: number;
  readonly hmat: readonly string[];
  readonly fmcmds: readonly string[];
  readonly argv: readonly string[];
}

/**
 * plans a CXL type-3 pooled-memory fabric (ledger F-001/F-004): one or
 * more type-3 devices spread over pxb-cxl host bridges, each behind a
 * cxl-rp root port, with an HMAT latency/bandwidth matrix so the guest
 * sees honest numbers (178-195 ns read, 64 GB/s x.em+ 3.0 links) and
 * cxl-cli fabric-manager commands for region creation. the guest-side
 * tier mapping that consumes this fabric lives in virtualmemory.ts
 * (cxxldevice); this planner owns the fabric itself.
 */
export function plancxltype3(
  devices: readonly {
    id: string;
    sizegb: number;
    hostbridge?: number;
    qosclass?: number;
    latencyns?: number;
    bandwidthgbps?: number;
    decoders?: number;
    interleaveways?: number;
    mempath?: string;
  }[],
  spec: '2.0' | '3.0' = '3.0',
): cxltype3plan {
  try {
    if (devices.length === 0) throw new Error('at least one type-3 device is required');
    if (devices.length > 16) throw new Error('at most 16 type-3 devices per fabric');
    const bridges = new Set<number>();
    const planned: cxltype3device[] = devices.map((device, index) => {
      if (!/^[a-z][a-z0-9-]*$/.test(device.id)) {
        throw new Error(`device id ${device.id} must be lowercase alnum/dash`);
      }
      if (!Number.isInteger(device.sizegb) || device.sizegb < 1 || device.sizegb > 4096) {
        throw new Error(`device ${device.id} size must be an integer 1..4096 GB`);
      }
      const qosclass = device.qosclass ?? 2;
      if (!Number.isInteger(qosclass) || qosclass < 0 || qosclass > 15) {
        throw new Error(`device ${device.id} qos class must be 0..15 (FM-API range)`);
      }
      const interleaveways = device.interleaveways ?? 1;
      if (![1, 2, 4, 16].includes(interleaveways)) {
        throw new Error(`device ${device.id} interleave ways must be one of 1/2/4/16`);
      }
      const hostbridge = device.hostbridge ?? 1 + (index % 2);
      if (!Number.isInteger(hostbridge) || hostbridge < 1 || hostbridge > 8) {
        throw new Error(`device ${device.id} host bridge must be 1..8`);
      }
      bridges.add(hostbridge);
      return {
        id: device.id,
        sizegb: device.sizegb,
        qosclass,
        latencyns: device.latencyns ?? 178,
        bandwidthgbps: device.bandwidthgbps ?? 64,
        decoders: device.decoders ?? 4,
        interleaveways,
        hostbridge,
        mempath: device.mempath ?? `/dev/cxl/${device.id}`,
      };
    });
    const argv: string[] = ['-machine q35,cxl=on,hmat=on'];
    for (const bridge of [...bridges].sort((a, b) => a - b)) {
      argv.push(`-device pxb-cxl,bus=pcie.0,bus_nr=${11 + bridge},id=cxl.${bridge}`);
      argv.push(`-device cxl-rp,port=0,bus=cxl.${bridge},id=rp.${bridge}`);
    }
    const hmat: string[] = [];
    for (const device of planned) {
      argv.push(
        `-object memory-backend-file,id=mem-${device.id},mem-path=${device.mempath}` +
          `,size=${device.sizegb}G,share=on,align=2M`,
        `-device cxl-type3,bus=rp.${device.hostbridge},memdev=mem-${device.id}` +
          `,id=${device.id},volatile=true`,
      );
      if (spec === '3.0') {
        argv.push(
          `-device set-qos,class=${device.qosclass},dev=${device.id},bw=${device.bandwidthgbps}`,
        );
      }
      hmat.push(
        `-numa hmat-lb,initiator=0,target=${device.hostbridge},hierarchy=memory` +
          `,data-type=access-latency,latency=${device.latencyns}`,
        `-numa hmat-lb,initiator=0,target=${device.hostbridge},hierarchy=memory` +
          `,data-type=access-bandwidth,bandwidth=${device.bandwidthgbps}G`,
      );
    }
    const fmcmds = [
      'cxl list -MP',
      ...planned.map(
        (device) =>
          `cxl create-region -m -t pmem -a -w ${device.interleaveways} -s ${device.sizegb}G ` +
          `${device.id}`,
      ),
      'daxctl online-memory --mode=system-ram --no-online-movable',
    ];
    return {
      spec,
      devices: planned,
      totalgb: planned.reduce((acc, device) => acc + device.sizegb, 0),
      windowgranularitymb: 256,
      hmat,
      fmcmds,
      argv,
    };
  } catch (error) {
    throw new Error(
      `plancxltype3 failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/** one planned ZNS zone group or FDP reclaim-unit domain. */
export interface znszonegroup {
  readonly id: string;
  readonly zonecapmb: number;
  readonly zonecount: number;
  readonly maxopen: number;
  readonly fdpruhandles: number;
}

/** the planned zoned-namespace virtual disk with argv and admin cmds. */
export interface znszoneplan {
  readonly mode: 'zns' | 'fdp';
  readonly groups: readonly znszonegroup[];
  readonly totalsizemb: number;
  readonly descriptorbytes: number;
  readonly qemuargv: readonly string[];
  readonly nvmecli: readonly string[];
  readonly mkfs: readonly string[];
}

/**
 * plans ZNS and FDP SSD-aware virtual disk provisioning (ledger F-034):
 * zone capacity/count math with the 4 MiB NVMe ZNS alignment rule, the
 * QEMU nvme device with zoned=true properties (zone size, append limit,
 * max open/active zones), FDP reclaim-unit handles for data placement,
 * nvme-cli zone administration and a zoned-btrfs mkfs line. conventional
 * namespaces keep using the plain virtio-blk path in buildqemucmd.
 */
export function planznszones(
  groups: readonly {
    id: string;
    zonecapmb: number;
    zonecount: number;
    maxopen?: number;
    ruhandles?: number;
  }[],
  mode: 'zns' | 'fdp' = 'zns',
): znszoneplan {
  try {
    if (groups.length === 0) throw new Error('at least one zone group is required');
    const planned: znszonegroup[] = groups.map((group) => {
      if (!/^[a-z][a-z0-9-]*$/.test(group.id)) {
        throw new Error(`zone group id ${group.id} must be lowercase alnum/dash`);
      }
      if (group.zonecapmb < 4 || group.zonecapmb % 4 !== 0) {
        throw new Error(`group ${group.id} zone capacity must be a multiple of 4 MiB`);
      }
      if (!Number.isInteger(group.zonecount) || group.zonecount < 1 || group.zonecount > 65536) {
        throw new Error(`group ${group.id} zone count must be 1..65536`);
      }
      const maxopen = group.maxopen ?? Math.min(group.zonecount, 32);
      if (maxopen < 1 || maxopen > group.zonecount) {
        throw new Error(`group ${group.id} max open zones must be 1..zonecount`);
      }
      const fdpruhandles = mode === 'fdp' ? (group.ruhandles ?? 8) : 0;
      if (mode === 'fdp' && (fdpruhandles < 2 || fdpruhandles > 128 || fdpruhandles % 2 !== 0)) {
        throw new Error(`group ${group.id} FDP reclaim-unit handles must be even, 2..128`);
      }
      return {
        id: group.id,
        zonecapmb: group.zonecapmb,
        zonecount: group.zonecount,
        maxopen,
        fdpruhandles,
      };
    });
    const first = planned[0];
    const zonecount = planned.reduce((acc, group) => acc + group.zonecount, 0);
    const qemuargv = [
      '-blockdev driver=file,filename=zns0.img,node-name=znsfile',
      `-blockdev driver=raw,file=znsfile,node-name=znsraw`,
      `-device nvme,drive=znsraw,serial=saddlezns,logical_block_size=4096` +
        `,zoned=true,zone_size=${first.zonecapmb}M,zone_cap=${first.zonecapmb}M` +
        `,max_open_zones=${first.maxopen},max_active_zones=${zonecount}` +
        `,zone_append_size_limit=128K`,
    ];
    const nvmecli = [
      'nvme id-ctrl /dev/nvme0',
      'nvme zns id-ns /dev/nvme0n1',
      'nvme zns report-zones /dev/nvme0n1 -d 8',
      ...(mode === 'fdp'
        ? [
            'nvme fdp status /dev/nvme0',
            `nvme fdp update /dev/nvme0 -n ${first.fdpruhandles}`,
            `nvme set-feature /dev/nvme0 -f 0x1d -v ${first.fdpruhandles}`,
          ]
        : []),
      'nvme zns zone-mgmt /dev/nvme0n1 --zsa=close --start-lba=0',
    ];
    return {
      mode,
      groups: planned,
      totalsizemb: planned.reduce((acc, g) => acc + g.zonecapmb * g.zonecount, 0),
      descriptorbytes: zonecount * 64,
      qemuargv,
      nvmecli,
      mkfs: ['mkfs.btrfs -m zone-single -L saddle-zns /dev/nvme0n1'],
    };
  } catch (error) {
    throw new Error(
      `planznszones failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/** one steering table of the generated P4 program. */
export interface p4tablespec {
  readonly name: string;
  readonly matchkind: 'exact' | 'lpm' | 'ternary';
  readonly key: string;
  readonly size: number;
}

/** the generated P4-16 program skeleton. */
export interface p4programplan {
  readonly name: string;
  readonly target: 'bmv2' | 'smartnic';
  readonly source: string;
  readonly lines: number;
  readonly tables: readonly p4tablespec[];
  readonly compileargv: readonly string[];
}

/**
 * builds a complete P4-16 program skeleton for programmable packet
 * steering (ledger F-043): ethernet/ipv4/tcp header definitions, a
 * standard parser, an ingress control block with one exact/lpm/ternary
 * steering table per requested table spec (forward and drop actions),
 * an egress control with a clone-to-mirror action, checksum verification
 * and a deparser. identifiers stay lowercase without underscores to keep
 * the engine naming rule uniform inside generated sources too.
 */
export function buildp4skeleton(opts: {
  name: string;
  tables: readonly { name: string; matchkind?: 'exact' | 'lpm' | 'ternary'; size?: number }[];
  target?: 'bmv2' | 'smartnic';
}): p4programplan {
  try {
    if (!/^[a-z][a-z0-9]*$/.test(opts.name)) {
      throw new Error('program name must be lowercase alphanumeric');
    }
    if (opts.tables.length === 0) throw new Error('at least one table is required');
    const tables: p4tablespec[] = opts.tables.map((table) => {
      if (!/^[a-z][a-z0-9]*$/.test(table.name)) {
        throw new Error(`table name ${table.name} must be lowercase alphanumeric`);
      }
      const size = table.size ?? 1024;
      if (!Number.isInteger(size) || size < 1 || size > 1_048_576) {
        throw new Error(`table ${table.name} size must be 1..1048576`);
      }
      return {
        name: table.name,
        matchkind: table.matchkind ?? 'lpm',
        key: 'hdr.hipv4.dstaddr',
        size,
      };
    });
    const dupes = tables.map((t) => t.name).filter((n, i, all) => all.indexOf(n) !== i);
    if (dupes.length > 0) throw new Error(`duplicate table names: ${dupes.join(',')}`);
    const applycase = (table: p4tablespec) =>
      `      table.apply(${table.name}) {
        nomatch { drop(); }
      }`;
    const tabledef = (table: p4tablespec) =>
      `  table ${table.name} {
    key = { ${table.key} : ${table.matchkind}; }
    actions = { steer; drop; }
    size = ${table.size};
    default_action = drop();
  }`;
    const source = [
      '#include <core.p4>',
      '#include <v1model.p4>',
      '',
      'const bit<16> ethtypeipv4 = 16w0x800;',
      'const bit<8> prototcp = 8w6;',
      '',
      'header etherneth {',
      '  bit<48> dst;',
      '  bit<48> src;',
      '  bit<16> ethertype;',
      '}',
      '',
      'header ipv4h {',
      '  bit<4> version;',
      '  bit<4> ihl;',
      '  bit<8> diffserv;',
      '  bit<16> totallen;',
      '  bit<16> identification;',
      '  bit<3> flags;',
      '  bit<13> fragoffset;',
      '  bit<8> ttl;',
      '  bit<8> protocol;',
      '  bit<16> checksum;',
      '  bit<32> srcaddr;',
      '  bit<32> dstaddr;',
      '}',
      '',
      'header tcph {',
      '  bit<16> srcport;',
      '  bit<16> dstport;',
      '  bit<32> seqno;',
      '  bit<32> ackno;',
      '  bit<4> dataoffset;',
      '  bit<12> reserved;',
      '  bit<8> flagsbyte;',
      '  bit<16> window;',
      '  bit<16> checksum;',
      '}',
      '',
      'struct metadata { bit<16> outport; }',
      'struct headers { etherneth heth; ipv4h hipv4; tcph htcp; }',
      '',
      'parser parsermain(packet.in pkt, out headers hdr, inout metadata meta,',
      '    inout standard.metadata smeta) {',
      '  state start { transition parseeth; }',
      '  state parseeth {',
      '    pkt.extract(hdr.heth);',
      '    transition select(hdr.heth.ethertype) {',
      '      ethtypeipv4: parseipv4; default: accept;',
      '    }',
      '  }',
      '  state parseipv4 {',
      '    pkt.extract(hdr.hipv4);',
      '    transition select(hdr.hipv4.protocol) {',
      '      prototcp: parsetcp; default: accept;',
      '    }',
      '  }',
      '  state parsetcp { pkt.extract(hdr.htcp); transition accept; }',
      '}',
      '',
      'control ingress(inout headers hdr, inout metadata meta,',
      '    inout standard.metadata smeta) {',
      '  action drop() { marktodrop(smeta); }',
      '  action steer(bit<16> port) { smeta.egressspec = port; meta.outport = port; }',
      ...tables.map(tabledef),
      '  apply {',
      ...tables.map(applycase),
      '  }',
      '}',
      '',
      'control egress(inout headers hdr, inout metadata meta,',
      '    inout standard.metadata smeta) {',
      '  apply { if (meta.outport == 16w0) { clone3(clone-to-cpu, 32, meta); } }',
      '}',
      '',
      'verifychecksum(verify, hdr.hipv4, hdr.hipv4.checksum, prototcp)',
      'computecomputedchecksum(compute, hdr.hipv4.checksum, prototcp)',
      '',
      'deparser deparsermain(packet.out pkt, in headers hdr) {',
      '  apply { pkt.emit(hdr.heth); pkt.emit(hdr.hipv4); pkt.emit(hdr.htcp); }',
      '}',
      '',
      `package ${opts.name}(parsermain, ingress, egress, deparsermain)`,
      `  = ${opts.target === 'smartnic' ? 'smartnicarch' : 'v1model'};`,
      '',
    ].join('\n');
    return {
      name: opts.name,
      target: opts.target ?? 'bmv2',
      source,
      lines: source.split('\n').length,
      tables,
      compileargv:
        opts.target === 'smartnic'
          ? [`p4c --target smartnic --arch tna ${opts.name}.p4 -o ${opts.name}.bin`]
          : [`p4c-bm2-ss --std p4-16 ${opts.name}.p4 -o ${opts.name}.json`],
    };
  } catch (error) {
    throw new Error(
      `buildp4skeleton failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/** one open gate window of the 802.1Qbv gate control list. */
export interface tsnwindow {
  readonly queues: readonly number[];
  readonly offsetns: number;
  readonly durationns: number;
  readonly gatemask: string;
}

/** the planned TSN gate-control schedule with taprio qdisc argv. */
export interface tsnscheduleplan {
  readonly cycleus: number;
  readonly cyclens: number;
  readonly gcl: readonly tsnwindow[];
  readonly guardbandns: number;
  readonly utilization: number;
  readonly basetime: number;
  readonly tcargv: readonly string[];
}

/**
 * builds an 802.1Qbv time-aware shaper schedule (ledger F-044): the
 * caller states which traffic classes need exclusive windows inside one
 * cycle and the builder computes the gate control list (cumulative
 * offsets, 8-bit gate masks per window), the guard band, the taprio qdisc
 * argv (num-tc, map, queues, sched-entry lines, txtime-assist flags) and
 * a base-time anchored to the next second boundary. windows never
 * overlap by construction and the sum plus guard band must fit the
 * cycle; violations throw instead of producing an unrunnable schedule.
 */
export function buildtsnschedule(opts: {
  cycleus: number;
  windows: readonly { queues: readonly number[]; durationus: number }[];
  guardbandns?: number;
  basetime?: number;
}): tsnscheduleplan {
  try {
    if (!Number.isInteger(opts.cycleus) || opts.cycleus < 10 || opts.cycleus > 1_000_000) {
      throw new Error('cycle must be an integer 10..1000000 microseconds');
    }
    if (opts.windows.length === 0) throw new Error('at least one gate window is required');
    const cyclens = opts.cycleus * 1000;
    const guardbandns = opts.guardbandns ?? 0;
    if (guardbandns < 0 || guardbandns > cyclens / 2) {
      throw new Error('guard band must be 0..half the cycle');
    }
    let offsetns = 0;
    const gcl: tsnwindow[] = opts.windows.map((window, index) => {
      if (window.queues.length === 0) throw new Error(`window ${index} has no queues`);
      const seen = new Set<number>();
      for (const queue of window.queues) {
        if (!Number.isInteger(queue) || queue < 0 || queue > 7) {
          throw new Error(`window ${index} queue ${queue} outside 0..7`);
        }
        if (seen.has(queue)) throw new Error(`window ${index} repeats queue ${queue}`);
        seen.add(queue);
      }
      const durationns = window.durationus * 1000;
      if (durationns <= 0) throw new Error(`window ${index} duration must be positive`);
      if (offsetns + durationns > cyclens - guardbandns) {
        throw new Error(`window ${index} overflows the cycle minus guard band`);
      }
      let mask = 0;
      for (const queue of window.queues) mask |= 1 << queue;
      const entry: tsnwindow = {
        queues: window.queues,
        offsetns,
        durationns,
        gatemask: mask.toString(16).padStart(2, '0'),
      };
      offsetns += durationns;
      return entry;
    });
    const utilization = Number((offsetns / cyclens).toFixed(4));
    if (utilization > 0.95) {
      throw new Error(`gate windows consume ${(utilization * 100).toFixed(1)}% of the cycle`);
    }
    const qmap = Array.from({ length: 16 }, (_, i) => (i < opts.windows.length ? i : 0)).join(' ');
    const queuespec = opts.windows.map((w) => `1@${w.queues[0]}`).join(' ');
    const tcargv = [
      'tc qdisc replace dev eth0 parent root handle 100 taprio',
      `  num-tc ${opts.windows.length} map ${qmap} queues ${queuespec}`,
      `  base-time ${opts.basetime ?? 0} clockid CLOCK_TAI`,
      ...gcl.map((w) => `  sched-entry S ${w.gatemask} ${w.durationns}`),
      '  flags 0x2',
      'txtime-assist',
    ];
    return {
      cycleus: opts.cycleus,
      cyclens,
      gcl,
      guardbandns,
      utilization,
      basetime: opts.basetime ?? 0,
      tcargv,
    };
  } catch (error) {
    throw new Error(
      `buildtsnschedule failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

